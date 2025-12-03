const mongoose = require('mongoose');
const Product = require('../models/Product');

// MongoDB connection
const MONGODB_URI = 'mongodb://72.60.103.18:27017/beetle_diffuser_user';

const defaultSizes = ["46mm", "58mm", "62mm", "67mm", "Filter thread size not listed"];

const updateProductSizes = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all products that have empty sizes array
    const result = await Product.updateMany(
      { $or: [{ sizes: { $exists: false } }, { sizes: { $size: 0 } }] },
      { $set: { sizes: defaultSizes } }
    );

    console.log(`Updated ${result.modifiedCount} products with sizes`);

    // Verify the update
    const products = await Product.find({}, 'name sizes');
    console.log('\nProducts after update:');
    products.forEach(p => {
      console.log(`- ${p.name}: ${p.sizes.length} sizes`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error updating products:', error);
    process.exit(1);
  }
};

updateProductSizes();
