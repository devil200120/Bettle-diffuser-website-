const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// Validate and apply coupon
router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || !orderTotal) {
      return res.status(400).json({ message: 'Coupon code and order total are required' });
    }

    // Find coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    // Check if coupon is valid
    const validityCheck = coupon.isValid();
    if (!validityCheck.valid) {
      return res.status(400).json({ message: validityCheck.message });
    }

    // Calculate discount
    const discountResult = coupon.calculateDiscount(orderTotal);
    if (!discountResult.valid) {
      return res.status(400).json({ message: discountResult.message });
    }

    res.json({
      message: 'Coupon applied successfully',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: discountResult.discount
      },
      discount: discountResult.discount,
      finalTotal: orderTotal - discountResult.discount
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ message: 'Failed to validate coupon' });
  }
});

// Increment coupon usage (called after successful order)
router.post('/use', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.usedCount += 1;
    await coupon.save();

    res.json({ message: 'Coupon usage recorded' });
  } catch (error) {
    console.error('Error recording coupon usage:', error);
    res.status(500).json({ message: 'Failed to record coupon usage' });
  }
});

module.exports = router;
