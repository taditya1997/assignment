const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Student = require('../models/Student');
const Class = require('../models/Class');

describe('Leave Routes', () => {
  let authToken;
  let studentId;
  let classId;

  beforeEach(async () => {
    // Create a test user
    const user = await User.create({
      username: 'testuser',
      password: 'testpassword',
      email: 'test@test.com',
      role: 'teacher'
    });

    // Create a test class
    const testClass = await Class.create({
      name: 'Test Class',
      sections: ['A', 'B']
    });
    classId = testClass._id;

    // Create a test student
    const student = await Student.create({
      name: 'Test Student',
      enrollmentNumber: 'TEST123',
      class: classId,
      section: 'A',
      user: user._id
    });

    studentId = student._id;
    authToken = jwt.sign(
      { id: user._id, role: 'teacher' },
      process.env.JWT_SECRET || 'test-secret'
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Class.deleteMany({});
    await Leave.deleteMany({});
  });

  describe('POST /api/leaves/create', () => {
    it('should create a new leave request', async () => {
      const leaveData = {
        studentId: studentId.toString(),
        reason: 'Sick leave',
        startDate: '2024-03-20',
        endDate: '2024-03-21',
        leaveType: 'single'
      };

      const response = await request(app)
        .post('/api/leaves/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(leaveData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('leaveId');
      expect(response.body.message).toBe('Leave request created successfully');

      // Verify leave was created
      const leave = await Leave.findById(response.body.leaveId);
      expect(leave).toBeTruthy();
      expect(leave.reason).toBe(leaveData.reason);
    });
  });

  describe('GET /api/leaves/all', () => {
    it('should get all leave requests', async () => {
      // Create a test leave request
      await Leave.create({
        student: studentId,
        reason: 'Test leave',
        startDate: new Date(),
        endDate: new Date(),
        leaveType: 'single'
      });

      const response = await request(app)
        .get('/api/leaves/all')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
}); 