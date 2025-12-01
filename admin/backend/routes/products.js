const express = require('express');
const Product = require('../models/Product');
const { authenticateToken, adminOnly } = require('../middleware/auth');
const { validateProduct, validateProductUpdate, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Debug route to check if products exist in DB
router.get('/debug', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const allProducts = await Product.find().limit(5);
    
    res.json({
      totalProductsInDB: totalProducts,
      sampleProducts: allProducts.map(p => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        isActive: p.isActive,
        createdBy: p.createdBy
      }))
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/products
// @desc    Get all products with pagination and filtering
// @access  Private (Admin)
router.get('/', authenticateToken, adminOnly, async (req, res) => {
  try {
    console.log('Products API called with params:', req.query);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const isActive = req.query.isActive;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    console.log('Database query:', JSON.stringify(query, null, 2));

    // First try without population to see if that's the issue
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log('Raw products found:', products.length);
    
    // Try to populate createdBy separately to avoid any populate issues
    const populatedProducts = await Product.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .catch(err => {
        console.log('Populate error, returning products without population:', err.message);
        return products;
      });

    const total = await Product.countDocuments(query);
    
    console.log('Found products:', populatedProducts.length);
    console.log('Total products in DB:', total);

    res.json({
      success: true,
      data: {
        products: populatedProducts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Private (Admin)
router.get('/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin)
router.post('/', authenticateToken, adminOnly, validateProduct, handleValidationErrors, async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      createdBy: req.user._id
    });

    const savedProduct = await product.save();
    const populatedProduct = await Product.findById(savedProduct._id).populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin)
router.put('/:id', authenticateToken, adminOnly, validateProductUpdate, handleValidationErrors, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin)
router.delete('/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/products/:id/toggle-status
// @desc    Toggle product active status
// @access  Private (Admin)
router.patch('/:id/toggle-status', authenticateToken, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: product.isActive
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;