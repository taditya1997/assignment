const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../server');
const User = require('../models/User');

describe('Auth Routes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        password: await bcrypt.hash('password123', 10),
        email: 'test@test.com',
        role: 'teacher'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: userData.username,
          password: 'password123', // Send plain password
          email: userData.email,
          role: userData.role
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId');

      // Verify user was created
      const user = await User.findOne({ username: userData.username }).select('+email');
      expect(user).toBeTruthy();
      expect(user.email).toBe(userData.email);
    });
  });
}); 