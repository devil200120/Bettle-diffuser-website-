const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateOrder, handleValidationErrors } = require('../middleware/validation');
const { sendOrderConfirmationEmail, sendAccountCreatedEmail } = require('../utils/emailService');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private/Public (guest checkout with auto account creation)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, guestInfo, currency, region, subtotal: clientSubtotal, tax: clientTax, shipping: clientShipping, total: clientTotal, createAccount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Use client-calculated totals if provided (region-aware), otherwise calculate server-side
    const subtotal = clientSubtotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const isIndia = currency === 'INR' || region === 'India';
    const tax = clientTax !== undefined ? clientTax : Math.round(subtotal * (isIndia ? 0.18 : 0));
    const shipping = clientShipping !== undefined ? clientShipping : (isIndia ? 0 : 20);
    const totalAmount = clientTotal || (subtotal + tax + shipping);

    // Build formatted address (handle optional fields)
    const addressParts = [
      shippingAddress.street,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.zipCode,
      shippingAddress.country
    ].filter(Boolean); // Remove undefined/null/empty values
    const formattedAddress = addressParts.join(', ');

    // Generate unique order number
    const orderNumber = 'BD' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 5).toUpperCase();

    let userId = req.user ? req.user._id : null;
    let newUserCreated = false;
    let newUser = null;
    let passwordResetToken = null;

    // If guest checkout and createAccount is true (or always create account for guests)
    if (!req.user && guestInfo && guestInfo.email) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: guestInfo.email });
      
      if (!existingUser) {
        // Create new user account from checkout info
        const tempPassword = crypto.randomBytes(16).toString('hex'); // Temporary password
        
        // Extract name from guestInfo or shippingAddress, with proper fallback
        const firstName = guestInfo.firstName || shippingAddress.firstName || '';
        const lastName = guestInfo.lastName || shippingAddress.lastName || '';
        const fullName = guestInfo.name || `${firstName} ${lastName}`.trim() || 'Customer';
        
        newUser = new User({
          name: fullName,
          email: guestInfo.email,
          phone: guestInfo.phone || shippingAddress.phone,
          password: tempPassword,
          isVerified: true, // Auto-verify since they're making a purchase
          address: {
            formattedAddress: formattedAddress,
            street: shippingAddress.street || '',
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            zipCode: shippingAddress.zipCode,
            country: shippingAddress.country || 'India'
          }
        });

        // Generate password reset token so user can set their own password
        passwordResetToken = crypto.randomBytes(32).toString('hex');
        newUser.resetPasswordToken = crypto.createHash('sha256').update(passwordResetToken).digest('hex');
        newUser.resetPasswordExpires = Date.now() + 7 * 24 * 3600000; // 7 days

        await newUser.save();
        userId = newUser._id;
        newUserCreated = true;
      } else {
        // User exists, link order to existing user
        userId = existingUser._id;
      }
    }

    // Create order
    const order = new Order({
      orderNumber,
      user: userId,
      guestInfo: (!req.user && !userId) ? guestInfo : null,
      items: items.map(item => ({
        product: item.product || null,
        name: item.name,
        icon: item.icon,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        cameraModel: item.cameraModel,
        lensModel: item.lensModel,
        flashModel: item.flashModel
      })),
      subtotal,
      tax,
      shipping,
      totalAmount,
      currency: currency || 'INR',
      region: region || 'India',
      shippingAddress: {
        ...shippingAddress,
        name: shippingAddress.name || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || 'Customer',
        formattedAddress
      },
      paymentMethod: paymentMethod || 'cod'
    });

    await order.save();

    // Clear user's cart if logged in
    if (req.user) {
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { items: [] }
      );
    }

    // Send emails
    const email = req.user ? req.user.email : guestInfo?.email;
    
    // Send order confirmation email
    if (email) {
      try {
        await sendOrderConfirmationEmail(order, email);
      } catch (emailError) {
        console.error('Order confirmation email sending failed:', emailError);
      }
    }

    // Send account created email if new user was created
    if (newUserCreated && newUser && passwordResetToken) {
      try {
        await sendAccountCreatedEmail(newUser, passwordResetToken);
      } catch (emailError) {
        console.error('Account created email sending failed:', emailError);
      }
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status
      },
      accountCreated: newUserCreated
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name icon');

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get current user's orders
// @access  Private
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name icon images');

    res.json({ orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/track/:orderNumber
// @desc    Track order by order number (public)
// @access  Public
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.product', 'name images price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product', 'name icon');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
