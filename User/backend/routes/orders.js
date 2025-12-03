const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateOrder, handleValidationErrors } = require('../middleware/validation');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private/Public (guest checkout)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, guestInfo, currency, region, subtotal: clientSubtotal, tax: clientTax, shipping: clientShipping, total: clientTotal } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Use client-calculated totals if provided (region-aware), otherwise calculate server-side
    const subtotal = clientSubtotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const isIndia = currency === 'INR' || region === 'India';
    const tax = clientTax !== undefined ? clientTax : Math.round(subtotal * (isIndia ? 0.18 : 0));
    const shipping = clientShipping !== undefined ? clientShipping : (isIndia ? 0 : 20);
    const totalAmount = clientTotal || (subtotal + tax + shipping);

    // Build formatted address
    const formattedAddress = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`;

    // Generate unique order number
    const orderNumber = 'BD' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 5).toUpperCase();

    // Create order
    const order = new Order({
      orderNumber,
      user: req.user ? req.user._id : null,
      guestInfo: !req.user ? guestInfo : null,
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

    // Send confirmation email
    const email = req.user ? req.user.email : guestInfo?.email;
    if (email) {
      try {
        await sendOrderConfirmationEmail(order, email);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the order if email fails
      }
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status
      }
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
