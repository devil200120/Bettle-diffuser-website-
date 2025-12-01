const express = require('express');
const Order = require('../models/Order');
const { authenticateToken, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders with pagination and filtering
// @access  Private (Admin)
router.get('/', authenticateToken, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';
    const paymentStatus = req.query.paymentStatus || '';
    const search = req.query.search || '';

    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'guestCustomer.name': { $regex: search, $options: 'i' } },
        { 'guestCustomer.email': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private (Admin)
router.get('/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images sku')
      .populate('statusHistory.updatedBy', 'name');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin)
router.patch('/:id/status', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add to status history
    order.statusHistory.push({
      status,
      note,
      updatedBy: req.user._id
    });

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email')
      .populate('statusHistory.updatedBy', 'name');

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/orders/:id/payment-status
// @desc    Update order payment status
// @access  Private (Admin)
router.patch('/:id/payment-status', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    if (!paymentStatus) {
      return res.status(400).json({ message: 'Payment status is required' });
    }

    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.json({
      message: 'Payment status updated successfully',
      paymentStatus
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/orders/:id/tracking
// @desc    Update tracking number
// @access  Private (Admin)
router.patch('/:id/tracking', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    
    if (!trackingNumber) {
      return res.status(400).json({ message: 'Tracking number is required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { trackingNumber },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Tracking number updated successfully',
      trackingNumber
    });
  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;