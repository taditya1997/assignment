require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Add this line
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const verifyToken = require('./middleware/auth');
const leaveRoutes = require('./routes/leave');
const studentRoutes = require('./routes/student');
const authRoutes = require('./routes/auth');
const { connectToDatabase } = require('./db');
const User = require('./models/User');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow these headers
}));

app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/students', verifyToken, studentRoutes);
app.use('/api/leaves', verifyToken, leaveRoutes);

// Initialize database connection
if (process.env.NODE_ENV !== 'test') {
  connectToDatabase()
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
}

// Don't start the server in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for testing
module.exports = app;

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    
    // Use mongoose model directly
    const user = await User.create({
      username,
      password,
      email,
      role
    });

    res.status(201).json({ 
      userId: user._id,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Update user's refresh token in the database
    await User.updateOne(
      { _id: user._id },
      { $set: { refreshToken, tokenCount: 1 } }
    );

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add other routes and middleware as needed

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// If you need to close the connection when the server shuts down:
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});
