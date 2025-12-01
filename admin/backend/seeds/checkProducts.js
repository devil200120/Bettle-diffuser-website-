const mongoose = require('mongoose');
const Product = require('../models/Product');
const path = require('path');

// Load environment variables from the parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check products in database
    const totalProducts = await Product.countDocuments();
    console.log(`Total products in database: ${totalProducts}`);

    if (totalProducts > 0) {
      const products = await Product.find().limit(10);
      console.log('\nProducts found:');
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (SKU: ${product.sku}) - Active: ${product.isActive} - CreatedBy: ${product.createdBy || 'NULL'}`);
      });
    } else {
      console.log('No products found in database');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkProducts();