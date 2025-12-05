const express = require('express');
const router = express.Router();
const Gallery = require('../../models/Gallery');
const cloudinary = require('../../utils/cloudinary');

// @route   GET /api/admin/gallery
// @desc    Get all gallery images with pagination
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const total = await Gallery.countDocuments(query);
    const images = await Gallery.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        images,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit) || 1
        }
      }
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/gallery/categories
// @desc    Get all unique categories
// @access  Private/Admin
router.get('/categories', async (req, res) => {
  try {
    const categories = await Gallery.distinct('category');
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/gallery
// @desc    Add new gallery image
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const { title, category, image } = req.body;

    if (!title || !image) {
      return res.status(400).json({ message: 'Title and image are required' });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: 'beetle-diffuser-gallery',
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ]
    });

    // Get the highest order number
    const lastImage = await Gallery.findOne().sort({ order: -1 });
    const newOrder = lastImage ? lastImage.order + 1 : 1;

    const gallery = new Gallery({
      title,
      category: category || 'Featured',
      imageUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      order: newOrder
    });

    await gallery.save();

    res.status(201).json({
      success: true,
      message: 'Image added successfully',
      data: gallery
    });
  } catch (error) {
    console.error('Add gallery image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/gallery/:id
// @desc    Update gallery image
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const { title, category, image, isActive, order } = req.body;
    
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery image not found' });
    }

    // Update fields
    if (title !== undefined) gallery.title = title;
    if (category !== undefined) gallery.category = category;
    if (isActive !== undefined) gallery.isActive = isActive;
    if (order !== undefined) gallery.order = order;

    // If new image is provided, upload to Cloudinary and delete old one
    if (image && image.startsWith('data:')) {
      // Delete old image from Cloudinary
      if (gallery.cloudinaryId) {
        await cloudinary.uploader.destroy(gallery.cloudinaryId);
      }

      // Upload new image
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: 'beetle-diffuser-gallery',
        transformation: [
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ]
      });

      gallery.imageUrl = uploadResult.secure_url;
      gallery.cloudinaryId = uploadResult.public_id;
    }

    await gallery.save();

    res.json({
      success: true,
      message: 'Gallery image updated successfully',
      data: gallery
    });
  } catch (error) {
    console.error('Update gallery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/gallery/:id
// @desc    Delete gallery image
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery image not found' });
    }

    // Delete from Cloudinary
    if (gallery.cloudinaryId) {
      await cloudinary.uploader.destroy(gallery.cloudinaryId);
    }

    await gallery.deleteOne();

    res.json({
      success: true,
      message: 'Gallery image deleted successfully'
    });
  } catch (error) {
    console.error('Delete gallery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/gallery/reorder
// @desc    Reorder gallery images
// @access  Private/Admin
router.put('/reorder/batch', async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid items array' });
    }

    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } }
      }
    }));

    await Gallery.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: 'Gallery reordered successfully'
    });
  } catch (error) {
    console.error('Reorder gallery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
