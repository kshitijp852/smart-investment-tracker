
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/smart_investment';
    console.log('Attempting MongoDB connection...');
    console.log('Connection URI:', uri.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✓ MongoDB connected successfully');
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    console.error('Server will continue without database connection');
    // Don't exit - let server run without DB for debugging
  }
};

module.exports = connectDB;
