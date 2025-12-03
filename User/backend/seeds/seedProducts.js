const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');

// Use direct connection string as fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb://72.60.103.18:27017/beetle_diffuser_user';

const products = [
  {
    name: "Beetle Diffuser Pro",
    subtitle: "Premium Macro Photography Diffuser",
    sku: "BD-PRO-001",
    description: "We will send you the diffuser that matches your equipment. Completely customized design for your equipment.",
    icon: "Pro Grey Background.jpg",
    price: 5500,
    rating: 5,
    features: [
      "Light Diffusion",
      "Professional Quality",
      "Easy Setup",
      "Durable Design"
    ],
    specifications: [
      "Available in 3 sizes: Large, Medium, Mini",
      "Compatible with most camera setups",
      "Precision-engineered diffusion",
      "Lightweight aluminum construction",
      "Includes carrying case",
      "Made in USA"
    ],
    compatibility: [
      "Canon EOS Series",
      "Nikon D Series",
      "Sony Alpha",
      "Other DSLR systems"
    ],
    sizes: ["46mm", "58mm", "62mm", "67mm", "Filter thread size not listed"],
    footer: "Inclusive of Shipping charges",
    loader: [
      "All the Prices are inclusive of Fedex Priority/Express shipping",
      "You can always write to us if you have any doubts regarding your gear to info@beetlediffuser.com.",
      "Maximum quantity in one order is 2 nos",
      "For Bulk order write to info@beetlediffuser.com"
    ],
    info: [
      "Though most flash models are supported, a few small flashes—such as the Meike MK-320 and Olympus FL-LM3—are not compatible.",
      "Lenses below Physical length of 2.5 inches (6.3 cm) are not supported",
      "Most macro lenses use the thread sizes listed in the dropdown, and a matching ring is included. If your lens size isn't listed, select \"Filter thread size not listed\" — you can still use the diffuser by tightening the cord panel around the lens."
    ],
    stock: 100,
    isActive: true
  },
  {
    name: "Beetle Diffuser Lite",
    subtitle: "Compact LED/Non-LED Diffuser",
    sku: "BD-LITE-002",
    description: "Diffuser ring design comes with two variants LED and Non-LED.",
    icon: "Lite grey background.jpg",
    price: 3250,
    rating: 5,
    features: [
      "Light Diffusion",
      "Professional Quality",
      "Easy Setup",
      "Durable Design"
    ],
    variant: ["LED", "Non-LED"],
    specifications: [
      "Designed specifically for Canon MP-E 65mm lens",
      "Optimal 1:1 macro magnification",
      "Minimizes lens creep",
      "Reduces color cast",
      "Quick release mount",
      "Sealed optical elements"
    ],
    compatibility: ["Canon MP-E 65mm (ONLY)"],
    sizes: ["46mm", "58mm", "62mm", "67mm", "Filter thread size not listed"],
    footer: "Inclusive of Shipping charges",
    loader: [
      "All the Prices are inclusive of Fedex Priority/Express shipping",
      "You can always write to us if you have any doubts regarding your gear to info@beetlediffuser.com.",
      "Maximum quantity in one order is 2 nos",
      "For Bulk order write to info@beetlediffuser.com"
    ],
    info: [],
    stock: 100,
    isActive: true
  },
  {
    name: "TWIN FLASH",
    subtitle: "Dual Flash Diffusion System",
    sku: "BD-TWIN-003",
    description: "Advanced dual-flash diffusion system for professional macro photography",
    icon: "Twin Grrey Background.jpg",
    price: 3250,
    rating: 5,
    features: [
      "Light Diffusion",
      "Professional Quality",
      "Easy Setup",
      "Durable Design"
    ],
    specifications: [
      "Exclusive collaboration with renowned macro photographer Ben Salb",
      "Optimized for Zuiko 90mm lens",
      "Premium optical coating",
      "Precision-engineered diffusion pattern",
      "Includes Ben Salb guide",
      "Limited production series"
    ],
    compatibility: ["Zuiko 90mm Pro lens"],
    sizes: ["46mm", "58mm", "62mm", "67mm", "Filter thread size not listed"],
    footer: "Inclusive of Shipping charges",
    loader: [
      "All the Prices are inclusive of Fedex Priority/Express shipping",
      "You can always write to us if you have any doubts regarding your gear to info@beetlediffuser.com.",
      "Maximum quantity in one order is 2 nos",
      "For Bulk order write to info@beetlediffuser.com"
    ],
    info: [],
    stock: 100,
    isActive: true
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected to:', MONGO_URI);

    // Drop the products collection entirely to clear indexes
    try {
      await mongoose.connection.db.dropCollection('products');
      console.log('Dropped products collection');
    } catch (err) {
      console.log('Collection may not exist, continuing...');
    }

    // Insert products
    await Product.insertMany(products);
    console.log('✅ Products seeded successfully!');
    console.log(`Inserted ${products.length} products`);

    // Verify
    const allProducts = await Product.find({}, 'name sku sizes');
    console.log('\nProducts in database:');
    allProducts.forEach(p => {
      console.log(`- ${p.name} (${p.sku}): ${p.sizes.length} sizes`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedProducts();
