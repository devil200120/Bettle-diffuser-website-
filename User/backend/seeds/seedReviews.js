const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Review = require('../models/Review');

const reviews = [
  {
    title: "Great Diffuser",
    body: "The **AK Diffuser** truly changed the way I approach macro photography. Before, lighting felt inconsistent and sometimes distracting, but with this diffuser everything became smoother, more natural, and beautifully balanced.",
    rating: 5,
    author: "Jose Vega",
    isApproved: true
  },
  {
    title: "World record holder",
    body: "The terms \"trustworthy\" and \"customer-oriented\" must have been invented especially for these AK guys. Less than 48 hours (!!!) between ordering (in Florida/USA!) and delivery.",
    rating: 5,
    author: "Example User",
    isApproved: true
  }
];

const seedReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Check if reviews already exist
    const existingCount = await Review.countDocuments();
    if (existingCount > 0) {
      console.log(`${existingCount} reviews already exist in database`);
      console.log('Skipping seed to prevent duplicates');
      process.exit(0);
    }

    // Insert reviews
    await Review.insertMany(reviews);
    console.log('✅ Reviews seeded successfully!');
    console.log(`Inserted ${reviews.length} reviews`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedReviews();
