const express = require('express');
const router = express.Router();
const Coupon = require('../../models/Coupon');
const { authenticateToken, isAdmin } = require('../../middleware/auth');

// Get all coupons (admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Failed to fetch coupons' });
  }
});

// Get single coupon (admin only)
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json(coupon);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({ message: 'Failed to fetch coupon' });
  }
});

// Create new coupon (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, expiryDate, description } = req.body;

    // Validation
    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({ message: 'Percentage discount must be between 0 and 100' });
    }

    if (discountValue < 0) {
      return res.status(400).json({ message: 'Discount value cannot be negative' });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || null,
      expiryDate: new Date(expiryDate),
      description: description || ''
    });

    await coupon.save();
    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Failed to create coupon' });
  }
});

// Update coupon (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, expiryDate, isActive, description } = req.body;

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if updating code to one that already exists
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
    }

    // Update fields
    if (code) coupon.code = code.toUpperCase();
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minOrderValue !== undefined) coupon.minOrderValue = minOrderValue;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (expiryDate) coupon.expiryDate = new Date(expiryDate);
    if (isActive !== undefined) coupon.isActive = isActive;
    if (description !== undefined) coupon.description = description;

    await coupon.save();
    res.json({ message: 'Coupon updated successfully', coupon });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: 'Failed to update coupon' });
  }
});

// Delete coupon (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Failed to delete coupon' });
  }
});

// Toggle coupon active status (admin only)
router.patch('/:id/toggle', authenticateToken, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    res.json({ 
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`, 
      coupon 
    });
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    res.status(500).json({ message: 'Failed to toggle coupon status' });
  }
});

module.exports = router;
