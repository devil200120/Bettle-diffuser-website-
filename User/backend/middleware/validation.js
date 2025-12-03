const { body, validationResult } = require('express-validator');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
exports.validateRegister = [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().trim().withMessage('Phone number is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('address.formattedAddress').notEmpty().withMessage('Formatted address is required'),
  body('address.coordinates.lat').isNumeric().withMessage('Latitude is required'),
  body('address.coordinates.lng').isNumeric().withMessage('Longitude is required'),
];

// Login validation
exports.validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Contact form validation
exports.validateContact = [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').notEmpty().trim().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
];

// Order validation
exports.validateOrder = [
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('shippingAddress.formattedAddress').notEmpty().withMessage('Shipping address is required'),
  body('shippingAddress.name').notEmpty().withMessage('Recipient name is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone number is required'),
  body('shippingAddress.coordinates.lat').isNumeric().withMessage('Address location is required'),
  body('shippingAddress.coordinates.lng').isNumeric().withMessage('Address location is required'),
];

// Cart item validation
exports.validateCartItem = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1, max: 2 }).withMessage('Quantity must be 1 or 2'),
];

// Review validation
exports.validateReview = [
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Review body is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('author').notEmpty().trim().withMessage('Author name is required'),
];
