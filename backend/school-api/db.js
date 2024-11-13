const mongoose = require('mongoose');

const connectToDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB!');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = { connectToDatabase };
