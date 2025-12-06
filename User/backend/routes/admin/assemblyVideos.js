const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const AssemblyVideo = require('../../models/AssemblyVideo');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/videos');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Configure multer for large video files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'assembly-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024 // 10GB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|mkv|wmv|flv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only video files are allowed!'));
  }
});

// @route   GET /api/admin/assembly-videos
// @desc    Get all assembly videos
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const videos = await AssemblyVideo.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Get assembly videos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/assembly-videos/:id
// @desc    Get single assembly video
// @access  Private/Admin
router.get('/:id', async (req, res) => {
  try {
    const video = await AssemblyVideo.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json({ success: true, data: video });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/assembly-videos
// @desc    Create new assembly video
// @access  Private/Admin
router.post('/', upload.single('video'), async (req, res) => {
  try {
    const { title, description, sortOrder, isActive } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    if (!title || !description) {
      // Delete uploaded file if validation fails
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const video = new AssemblyVideo({
      title,
      description,
      videoPath: `/uploads/videos/${req.file.filename}`,
      fileSize: req.file.size,
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await video.save();

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: video
    });
  } catch (error) {
    console.error('Create video error:', error);
    // Delete uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/assembly-videos/:id
// @desc    Update assembly video
// @access  Private/Admin
router.put('/:id', upload.single('video'), async (req, res) => {
  try {
    const { title, description, sortOrder, isActive } = req.body;
    
    const video = await AssemblyVideo.findById(req.params.id);
    
    if (!video) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      return res.status(404).json({ message: 'Video not found' });
    }

    // Update fields
    if (title) video.title = title;
    if (description) video.description = description;
    if (sortOrder !== undefined) video.sortOrder = sortOrder;
    if (isActive !== undefined) video.isActive = isActive;

    // If new video file is uploaded, delete old one and update path
    if (req.file) {
      // Delete old video file
      const oldFilePath = path.join(__dirname, '../../', video.videoPath);
      await fs.unlink(oldFilePath).catch(console.error);
      
      video.videoPath = `/uploads/videos/${req.file.filename}`;
      video.fileSize = req.file.size;
    }

    await video.save();

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: video
    });
  } catch (error) {
    console.error('Update video error:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/assembly-videos/:id
// @desc    Delete assembly video
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const video = await AssemblyVideo.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete video file from filesystem
    const filePath = path.join(__dirname, '../../', video.videoPath);
    await fs.unlink(filePath).catch(console.error);

    await AssemblyVideo.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
