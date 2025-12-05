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
    const product = await Product.findById(req.params.id).lean();
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Convert variantPricing Map to plain object if it exists
    if (product.variantPricing) {
      // When using .lean(), MongoDB Map comes as plain object with $* keys or as-is
      // Ensure it's a proper plain object
      const variantPricingObj = {};
      if (product.variantPricing instanceof Map) {
        for (const [key, value] of product.variantPricing.entries()) {
          variantPricingObj[key] = value;
        }
        product.variantPricing = variantPricingObj;
      } else if (typeof product.variantPricing === 'object' && product.variantPricing !== null) {
        // Already a plain object from .lean()
        // Check if it has $* keys (old Map format)
        const keys = Object.keys(product.variantPricing);
        if (keys.length > 0 && !keys[0].startsWith('$')) {
          // It's already in the right format
        }
      }
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

    // Handle variantPricing - convert to Map format for MongoDB
    let variantPricingMap;
    if (variantPricing && Object.keys(variantPricing).length > 0) {
      variantPricingMap = new Map();
      Object.entries(variantPricing).forEach(([key, value]) => {
        variantPricingMap.set(key, {
          price: value.price || 0,
          internationalPrice: {
            qty1: value.internationalPrice?.qty1 || 0,
            qty2: value.internationalPrice?.qty2 || 0,
            qty3: value.internationalPrice?.qty3 || 0,
            qty4: value.internationalPrice?.qty4 || 0,
            qty5: value.internationalPrice?.qty5 || 0,
            single: value.internationalPrice?.single || value.internationalPrice?.qty1 || 0,
            double: value.internationalPrice?.double || value.internationalPrice?.qty2 || 0
          }
        });
      });
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
      variantPricing: variantPricingMap || undefined,
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
    product.isActive = isActive !== undefined ? isActive : product.isActive;
    product.rating = rating !== undefined ? rating : product.rating;

    // Handle variantPricing - convert to Map format for MongoDB
    if (variantPricing !== undefined) {
      if (variantPricing === null || Object.keys(variantPricing).length === 0) {
        product.variantPricing = undefined;
      } else {
        // Convert plain object to Map for MongoDB
        const variantMap = new Map();
        Object.entries(variantPricing).forEach(([key, value]) => {
          variantMap.set(key, {
            price: value.price || 0,
            internationalPrice: {
              qty1: value.internationalPrice?.qty1 || 0,
              qty2: value.internationalPrice?.qty2 || 0,
              qty3: value.internationalPrice?.qty3 || 0,
              qty4: value.internationalPrice?.qty4 || 0,
              qty5: value.internationalPrice?.qty5 || 0,
              single: value.internationalPrice?.single || value.internationalPrice?.qty1 || 0,
              double: value.internationalPrice?.double || value.internationalPrice?.qty2 || 0
            }
          });
        });
        product.variantPricing = variantMap;
      }
    }

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
