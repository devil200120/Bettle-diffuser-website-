const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');

// @route   GET /api/admin/products
// @desc    Get all products with pagination
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit) || 1
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/products/:id
// @desc    Get single product
// @access  Private/Admin
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/products
// @desc    Create new product
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const {
      name,
      subtitle,
      description,
      price,
      internationalPrice,
      sku,
      stock,
      icon,
      features,
      specifications,
      compatibility,
      sizes,
      variant,
      variantPricing,
      isActive,
      rating
    } = req.body;

    // Check if SKU exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({ message: 'SKU already exists' });
    }

    const product = new Product({
      name,
      subtitle,
      description,
      price,
      internationalPrice: internationalPrice || { single: 0, double: 0 },
      sku,
      stock,
      icon: icon || '/images/fallback.jpg',
      features,
      specifications,
      compatibility,
      sizes,
      variant,
      variantPricing: variantPricing || undefined,
      isActive: isActive !== undefined ? isActive : true,
      rating: rating || 5
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      subtitle,
      description,
      price,
      internationalPrice,
      sku,
      stock,
      icon,
      features,
      specifications,
      compatibility,
      sizes,
      variant,
      variantPricing,
      isActive,
      rating
    } = req.body;

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if SKU is taken by another product
    if (sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
    }

    // Update fields
    product.name = name || product.name;
    product.subtitle = subtitle || product.subtitle;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.internationalPrice = internationalPrice || product.internationalPrice;
    product.sku = sku || product.sku;
    product.stock = stock !== undefined ? stock : product.stock;
    product.icon = icon || product.icon;
    product.features = features || product.features;
    product.specifications = specifications || product.specifications;
    product.compatibility = compatibility || product.compatibility;
    product.sizes = sizes || product.sizes;
    product.variant = variant || product.variant;
    product.variantPricing = variantPricing !== undefined ? variantPricing : product.variantPricing;
    product.isActive = isActive !== undefined ? isActive : product.isActive;
    product.rating = rating !== undefined ? rating : product.rating;

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/products/:id/toggle-status
// @desc    Toggle product active status
// @access  Private/Admin
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      data: product
    });
  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
