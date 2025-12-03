const express = require('express');
const Review = require('../models/Review');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateReview, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get all reviews
// @access  Public
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('product', 'name');

    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ 
      product: req.params.productId,
      isApproved: true 
    }).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews
// @desc    Submit a review
// @access  Public (optionally logged in)
router.post('/', optionalAuth, validateReview, handleValidationErrors, async (req, res) => {
  try {
    const { title, body, rating, author, productId } = req.body;

    const review = new Review({
      user: req.user ? req.user._id : null,
      product: productId || null,
      title,
      body,
      rating,
      author,
      isApproved: true // Auto-approve reviews
    });

    await review.save();

    res.status(201).json({ 
      message: 'Review submitted successfully!',
      review
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
