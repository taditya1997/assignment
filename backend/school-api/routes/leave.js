const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// Create leave request
router.post('/create', auth, async (req, res) => {
  try {
    const { studentId, reason, startDate, endDate, leaveType } = req.body;

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create leave request
    const leave = await Leave.create({
      student: studentId,
      reason,
      startDate,
      endDate,
      leaveType
    });

    res.status(201).json({
      leaveId: leave._id,
      message: 'Leave request created successfully'
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all leave requests
router.get('/all', auth, async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('student', 'name enrollmentNumber')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
