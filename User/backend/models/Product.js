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
  // Indian pricing (INR)
  price: {
    type: Number,
    required: true,
    min: 0
  },
  // International pricing (USD)
  internationalPrice: {
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
