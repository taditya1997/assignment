const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');

describe('Student Routes', () => {
  let authToken;
  let userId;
  let classId;

  beforeEach(async () => {
    // Create test user
    const user = await User.create({
      username: 'testuser',
      password: 'testpassword',
      email: 'test@test.com',
      role: 'teacher'
    });
    userId = user._id;

    // Create test class
    const testClass = await Class.create({
      name: 'Class A',
      sections: ['Section 1', 'Section 2']
    });
    classId = testClass._id;

    // Create test students
    await Student.create([
      {
        name: 'Student 1',
        enrollmentNumber: 'TEST001',
        class: classId,
        section: 'Section 1',
        user: userId
      },
      {
        name: 'Student 2',
        enrollmentNumber: 'TEST002',
        class: classId,
        section: 'Section 2',
        user: userId
      }
    ]);

    authToken = jwt.sign(
      { id: user._id, role: 'teacher' },
      process.env.JWT_SECRET || 'test-secret'
    );
  });

  afterEach(async () => {
    await Class.deleteMany({});
    await Student.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /api/students/dashboard-data', () => {
    it('should return dashboard data', async () => {
      const response = await request(app)
        .get('/api/students/dashboard-data')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('classes');
      expect(response.body).toHaveProperty('sections');
      expect(response.body).toHaveProperty('studentsData');
    });
  });
}); 