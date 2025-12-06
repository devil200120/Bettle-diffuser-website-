const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Admin credentials (in production, store these in .env)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@beetlediffuser.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// @route   POST /api/admin/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // First check if user exists in database with isAdmin flag
    const user = await User.findOne({ email, isAdmin: true, isActive: true });
    
    if (user) {
      // Check if user is banned
      if (user.isBanned) {
        return res.status(403).json({ 
          message: 'Your account has been banned', 
          isBanned: true
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Create token
      const token = jwt.sign(
        { userId: user._id, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: 'admin'
        }
      });
    }

    // Fallback to environment variables for default admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { userId: 'admin', role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: 'admin',
          name: 'Administrator',
          email: ADMIN_EMAIL,
          role: 'admin'
        }
      });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/auth/verify
// @desc    Verify admin token
// @access  Private
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      user: {
        id: 'admin',
        name: 'Administrator',
        email: ADMIN_EMAIL,
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
