const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// @route   POST /api/admin/users/create-admin
// @desc    Create a new admin user
// @access  Private/Admin
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create admin user
    const user = new User({
      name,
      email,
      password, // Will be hashed by pre-save hook
      phone,
      address: address || {
        formattedAddress: 'Admin Office',
        coordinates: { lat: 0, lng: 0 }
      },
      isAdmin: true,
      isActive: true,
      isVerified: true
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit) || 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user
// @access  Private/Admin
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone, isActive = true } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      isActive
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, password, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed to one that already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (isActive !== undefined) user.isActive = isActive;

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Private/Admin
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: userResponse
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/users/:id/ban
// @desc    Ban/Unban a user
// @access  Private/Admin
router.patch('/:id/ban', async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = !user.isBanned;
    if (user.isBanned) {
      user.bannedReason = reason || 'Violation of terms and conditions';
      user.bannedAt = new Date();
    } else {
      user.bannedReason = undefined;
      user.bannedAt = undefined;
    }
    
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
      data: userResponse
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/users/:id/toggle-admin
// @desc    Toggle user admin status
// @access  Private/Admin
router.patch('/:id/toggle-admin', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: `User ${user.isAdmin ? 'promoted to admin' : 'removed from admin'} successfully`,
      data: userResponse
    });
  } catch (error) {
    console.error('Toggle admin status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
