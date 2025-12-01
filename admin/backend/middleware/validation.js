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

// User validation rules
exports.validateUser = [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.validateUserUpdate = [
  body('name').optional().notEmpty().trim().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Product validation rules
exports.validateProduct = [
  body('name').notEmpty().trim().withMessage('Product name is required'),
  body('subtitle').notEmpty().trim().withMessage('Product subtitle is required'),
  body('description').notEmpty().withMessage('Product description is required'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('category').isIn(['diffuser', 'accessory', 'lens-specific', 'bundle']).withMessage('Valid category is required'),
  body('stock').isNumeric().isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
];

exports.validateProductUpdate = [
  body('name').optional().notEmpty().trim().withMessage('Product name cannot be empty'),
  body('subtitle').optional().notEmpty().trim().withMessage('Product subtitle cannot be empty'),
  body('description').optional().notEmpty().withMessage('Product description cannot be empty'),
  body('price').optional().isNumeric().isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').optional().isIn(['diffuser', 'accessory', 'lens-specific', 'bundle']).withMessage('Valid category is required'),
  body('stock').optional().isNumeric().isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
];

// Login validation
exports.validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];