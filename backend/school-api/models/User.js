const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, select: true },
  role: { type: String, enum: ['teacher', 'admin'], required: true },
  refreshToken: String,
  tokenCount: { type: Number, default: 0 },
});

// ... (keep the rest of the file as is)

module.exports = mongoose.model('User', userSchema);
