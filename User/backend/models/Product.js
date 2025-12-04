const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  // Indian pricing (INR)
  price: {
    type: Number,
    required: true,
    min: 0
  },
  // International pricing (USD) - supports qty 1-5
  internationalPrice: {
    qty1: {
      type: Number,
      default: 0,
      min: 0
    },
    qty2: {
      type: Number,
      default: 0,
      min: 0
    },
    qty3: {
      type: Number,
      default: 0,
      min: 0
    },
    qty4: {
      type: Number,
      default: 0,
      min: 0
    },
    qty5: {
      type: Number,
      default: 0,
      min: 0
    },
    // Backward compatibility
    single: {
      type: Number,
      default: 0,
      min: 0
    },
    double: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  icon: {
    type: String,
    default: '/images/fallback.jpg'
  },
  rating: {
    type: Number,
    default: 5,
    min: 0,
    max: 5
  },
  features: [String],
  specifications: [String],
  compatibility: [String],
  sizes: [String],
  variant: [String],
  // Variant-specific pricing (e.g., LED vs Non-LED)
  variantPricing: {
    type: Map,
    of: {
      price: { type: Number, min: 0 },
      internationalPrice: {
        single: { type: Number, default: 0, min: 0 },
        double: { type: Number, default: 0, min: 0 }
      }
    }
  },
  footer: String,
  loader: [String],
  info: [String],
  stock: {
    type: Number,
    default: 100,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
