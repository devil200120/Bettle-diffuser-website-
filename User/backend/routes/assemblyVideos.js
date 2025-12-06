const express = require('express');
const router = express.Router();
const AssemblyVideo = require('../models/AssemblyVideo');

// @route   GET /api/assembly-videos
// @desc    Get all active assembly videos for users
// @access  Public
router.get('/', async (req, res) => {
  try {
    const videos = await AssemblyVideo.find({ isActive: true })
      .select('-__v')
      .sort({ sortOrder: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Get assembly videos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assembly-videos/:id
// @desc    Get single assembly video
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const video = await AssemblyVideo.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json({ success: true, data: video });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
