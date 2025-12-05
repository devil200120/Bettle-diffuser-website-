const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');

// @route   GET /api/gallery
// @desc    Get all active gallery images (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    const query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const images = await Gallery.find(query)
      .sort({ order: 1, createdAt: -1 })
      .select('title category imageUrl');

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Get public gallery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gallery/categories
// @desc    Get all unique categories (public)
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Gallery.distinct('category', { isActive: true });
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
