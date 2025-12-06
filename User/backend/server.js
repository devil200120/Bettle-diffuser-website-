const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const contactRoutes = require('./routes/contact');
const reviewRoutes = require('./routes/reviews');
const addressRoutes = require('./routes/address');
const regionRoutes = require('./routes/region');
const galleryRoutes = require('./routes/gallery');
const assemblyVideosRoutes = require('./routes/assemblyVideos');
const faqRoutes = require('./routes/faqs');

// Admin Route imports
const adminAuthRoutes = require('./routes/admin/auth');
const adminDashboardRoutes = require('./routes/admin/dashboard');
const adminProductRoutes = require('./routes/admin/products');
const adminOrderRoutes = require('./routes/admin/orders');
const adminUserRoutes = require('./routes/admin/users');
const adminReviewRoutes = require('./routes/admin/reviews');
const adminGalleryRoutes = require('./routes/admin/gallery');
const adminUploadRoutes = require('./routes/admin/upload');
const adminAssemblyVideosRoutes = require('./routes/admin/assemblyVideos');
const adminFaqRoutes = require('./routes/admin/faqs');

const app = express();

// Trust proxy - Required for Render, Heroku, and other cloud platforms
// This allows Express to correctly read x-forwarded-for headers for client IP
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    // Allow specific production URLs if needed
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(null, true); // Allow all for development
  },
  credentials: true
}));

// Body parser middleware - conditionally applied
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  // Skip body parsing for multipart/form-data (let multer handle it)
  if (contentType.includes('multipart/form-data')) {
    return next();
  }
  
  // Apply JSON parser for application/json
  if (contentType.includes('application/json')) {
    return express.json({ limit: '10mb' })(req, res, next);
  }
  
  // Apply URL encoded parser for form submissions
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
  }
  
  // Default: apply both parsers
  express.json({ limit: '10mb' })(req, res, (err) => {
    if (err) return next(err);
    express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
  });
});

// Static file serving for video uploads
app.use('/api/uploads/videos', express.static(path.join(__dirname, 'uploads/videos')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/region', regionRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/assembly-videos', assemblyVideosRoutes);
app.use('/api/faqs', faqRoutes);

// Admin Routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use('/api/admin/gallery', adminGalleryRoutes);
app.use('/api/admin/upload', adminUploadRoutes);
app.use('/api/admin/assembly-videos', adminAssemblyVideosRoutes);
app.use('/api/admin/faqs', adminFaqRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Beetle Diffuser User API is running!', 
    timestamp: new Date(),
    googleMapsEnabled: !!process.env.GOOGLE_MAPS_API_KEY
  });
});

// Get Google Maps API Key (for frontend)
app.get('/api/config/maps', (req, res) => {
  res.json({ 
    apiKey: process.env.GOOGLE_MAPS_API_KEY 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Beetle Diffuser User Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});
