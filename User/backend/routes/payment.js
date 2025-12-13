const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   POST /api/payment/create-order
// @desc    Create Razorpay order
// @access  Public (supports guest checkout)
router.post('/create-order', optionalAuth, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    // Razorpay minimum order amount validation
    const minimumAmounts = {
      'INR': 1,     // ₹1
      'USD': 0.50,  // $0.50
      'EUR': 0.50,  // €0.50
      'GBP': 0.50,  // £0.50
      'AUD': 0.50,  // A$0.50
      'CAD': 0.50,  // C$0.50
    };

    const minAmount = minimumAmounts[currency] || 0.50;
    
    if (amount < minAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount is ${currency === 'INR' ? '₹' : '$'}${minAmount} for ${currency}`,
        minAmount: minAmount
      });
    }

    // Round to 2 decimal places and convert to smallest currency unit (paise/cents)
    const amountInSmallestUnit = Math.round(parseFloat(amount).toFixed(2) * 100);

    const options = {
      amount: amountInSmallestUnit, // Razorpay expects amount in paise/cents as integer
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1 // Auto capture payment
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create payment order',
      error: error.message 
    });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment signature
// @access  Public (supports guest checkout)
router.post('/verify', optionalAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing payment verification details' 
      });
    }

    // Create signature to verify
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSignature) {
      // Payment is verified
      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Payment verification failed',
      error: error.message 
    });
  }
});

// @route   GET /api/payment/:paymentId
// @desc    Get payment details
// @access  Private
router.get('/:paymentId', authenticateToken, async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    
    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount / 100, // Convert paise to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        created_at: payment.created_at
      }
    });
  } catch (error) {
    console.error('Fetch payment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message 
    });
  }
});

module.exports = router;
