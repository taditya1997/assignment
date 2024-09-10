const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Add this line
const { getDb } = require('../db');  // Add this line
const User = require('../models/User');

const router = express.Router();

// ... (keep the register route as is)

router.post('/login', async (req, res) => {
  try {
    const db = getDb();
    const { username, password } = req.body;
    const user = await db.collection('users').findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { refreshToken, tokenCount: 1 } }
    );

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh Token is required' });
  }

  try {
    const db = getDb();
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await db.collection('users').findOne({ _id: decoded.id });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: 'Error refreshing token' });
  }
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const db = getDb();
    await db.collection('users').updateOne(
      { refreshToken },
      { $set: { refreshToken: null, tokenCount: 0 } }
    );
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging out' });
  }
});

module.exports = router;
