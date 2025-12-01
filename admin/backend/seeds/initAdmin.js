const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const path = require('path');

// Load environment variables from the parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Sample products based on the frontend
const sampleProducts = [
  {
    name: "Beetle Diffuser",
    subtitle: "Large - Medium - Mini",
    description: "We will send you the diffuser that matches your equipment. Completely customized design for your equipment.",
    price: 149.99,
    sku: "BD-MAIN-001",
    category: "diffuser",
    features: ["Light Diffusion", "Professional Quality", "Easy Setup", "Durable Design"],
    specifications: [
      "Available in 3 sizes: Large, Medium, Mini",
      "Compatible with most camera setups",
      "Precision-engineered diffusion",
      "Lightweight aluminum construction",
      "Includes carrying case",
      "Made in USA"
    ],
    compatibility: ["Canon EOS Series", "Nikon D Series", "Sony Alpha", "Other DSLR systems"],
    sizes: ["Large", "Medium", "Mini"],
    stock: 50,
    images: [{
      url: "./images/Lite grey background.jpg",
      alt: "Beetle Diffuser",
      isPrimary: true
    }],
    isActive: true,
    isFeatured: true,
    tags: ["diffuser", "macro", "photography", "professional"]
  },
  {
    name: "AK MP-E 65MM",
    subtitle: "Take amazing macro shots",
    description: "DIFFUSER FOR CANON MP-E 65MM (ONLY)",
    price: 89.99,
    sku: "BD-MPE65-002",
    category: "lens-specific",
    features: ["Perfect for 1:1 macro", "Compact design", "Quick attach", "Color accurate"],
    specifications: [
      "Designed specifically for Canon MP-E 65mm lens",
      "Optimal 1:1 macro magnification",
      "Minimizes lens creep",
      "Reduces color cast",
      "Quick release mount",
      "Sealed optical elements"
    ],
    compatibility: ["Canon MP-E 65mm (ONLY)"],
    stock: 30,
    images: [{
      url: "./images/Beetle Lite White Background.jpg",
      alt: "AK MP-E 65MM",
      isPrimary: true
    }],
    isActive: true,
    tags: ["canon", "mp-e", "macro", "lens-specific"]
  },
  {
    name: "AK OM-90 PRO",
    subtitle: "IN COLLABORATION WITH BEN SALB",
    description: "FOR ZUIKO 90MM PRO (ONLY)",
    price: 99.99,
    sku: "BD-OM90-003",
    category: "lens-specific",
    features: ["Pro collaboration", "Premium materials", "Limited edition", "Expert tuned"],
    specifications: [
      "Exclusive collaboration with renowned macro photographer Ben Salb",
      "Optimized for Zuiko 90mm lens",
      "Premium optical coating",
      "Precision-engineered diffusion pattern",
      "Includes Ben Salb guide",
      "Limited production series"
    ],
    compatibility: ["Zuiko 90mm Pro lens"],
    stock: 25,
    images: [{
      url: "./images/Twin Grrey Background.jpg",
      alt: "AK OM-90 PRO",
      isPrimary: true
    }],
    isActive: true,
    tags: ["olympus", "zuiko", "ben-salb", "collaboration", "limited"]
  },
  {
    name: "TWIN FLASH",
    subtitle: "Diffuser for Dual Lighting",
    description: "Advanced dual-flash diffusion system for professional macro photography",
    price: 129.99,
    sku: "BD-TWIN-004",
    category: "diffuser",
    features: ["Dual-flash support", "Even lighting", "No shadows", "Professional results"],
    specifications: [
      "Two independent diffusion domes",
      "Synchronized lighting control",
      "360-degree coverage",
      "TTL compatible",
      "Includes dual mount",
      "Built-in cable management"
    ],
    compatibility: ["Most external flash units", "Compatible with wireless triggers"],
    stock: 40,
    images: [{
      url: "./images/Twin Beetle Diffusers White Background.jpg",
      alt: "TWIN FLASH",
      isPrimary: true
    }],
    isActive: true,
    tags: ["twin", "flash", "dual", "lighting", "professional"]
  },
  {
    name: "Macro Background Cards & Flexible Dual Clip Holder",
    subtitle: "Premium Accessories Pack",
    description: "Complete macro background and clip holder system for professional setup",
    price: 39.99,
    sku: "BD-ACCESSORIES-005",
    category: "accessory",
    features: ["Multiple backgrounds", "Flexible clips", "Easy positioning", "Professional finish"],
    specifications: [
      "5 reversible background cards",
      "Dual flexible clip holder",
      "Ball joint for 360 adjustment",
      "Removable/replaceable cards",
      "Lightweight aluminum construction",
      "Portable storage case included"
    ],
    compatibility: ["All macro setups", "Works with any tripod"],
    stock: 100,
    images: [{
      url: "./images/Pro White Background.jpg",
      alt: "Macro Background Cards & Flexible Dual Clip Holder",
      isPrimary: true
    }],
    isActive: true,
    tags: ["background", "accessories", "clip", "holder", "cards"]
  }
];

async function initializeDatabase() {
  try {
    // Debug: Check if environment variables are loaded
    console.log('Environment check:');
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Not found');
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'Using default');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!existingAdmin) {
      // Create admin user
      const admin = new User({
        name: 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@beetlediffuser.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        isActive: true
      });

      await admin.save();
      console.log('✅ Admin user created successfully');
      console.log(`Email: ${admin.email}`);
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    
    if (existingProducts === 0) {
      // Create a dummy admin user for product creation
      const admin = await User.findOne({ role: 'admin' });
      
      // Add products with admin as creator
      const productsWithCreator = sampleProducts.map(product => ({
        ...product,
        createdBy: admin._id
      }));

      await Product.insertMany(productsWithCreator);
      console.log('✅ Sample products created successfully');
    } else {
      console.log('ℹ️ Products already exist in database');
    }

    console.log('\n🎉 Database initialization completed!');
    console.log('\nYou can now:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Login to admin panel with:');
    console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@beetlediffuser.com'}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

initializeDatabase();