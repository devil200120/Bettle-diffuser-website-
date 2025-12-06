const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');

// @route   GET /api/faqs
// @desc    Get all active FAQs for users
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;

    const faqs = await FAQ.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('-__v -createdAt -updatedAt');

    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/faqs/categories
// @desc    Get unique categories for active FAQs
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await FAQ.distinct('category', { isActive: true });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
