require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Add this line
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectToDatabase, getDb } = require('./db');
const verifyToken = require('./middleware/auth');
const leaveRoutes = require('./routes/leave');
const studentRoutes = require('./routes/student');
const authRoutes = require('./routes/auth');

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

// Connect to the database before starting the server
connectToDatabase().then(() => {
  // Start the server after successful database connection
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to connect to the database', err);
  process.exit(1);
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const db = getDb();
    const { username, password, email, role } = req.body;

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      username,
      password: hashedPassword,
      email,
      role: role || 'teacher',
      refreshToken: null,
      tokenCount: 0
    };

    const result = await db.collection('users').insertOne(newUser);

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertedId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const db = getDb();
    const { username, password } = req.body;
    
    const user = await db.collection('users').findOne({ username });

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
    await db.collection('users').updateOne(
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
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});
