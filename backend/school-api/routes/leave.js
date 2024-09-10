const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { ObjectId } = require('mongodb');

// Create a new leave request
router.post('/create', async (req, res) => {
  try {
    const db = getDb();
    const { 
      studentName,
      studentId,
      classId, 
      sectionId, 
      reason, 
      leaveType, 
      startDate, 
      endDate, 
      status 
    } = req.body;

    // Find the student by name, class, and section
    const student = await db.collection('students').findOne({ 
      enrollmentNumber: studentId,
      class: classId, 
      section: sectionId 
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create the leave request
    const leaveRequest = {
      student: student._id,
      reason,
      leaveType, // 'single' or 'multiple'
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || 'Pending', // Use the provided status or default to 'Pending'
      createdAt: new Date()
    };

    const result = await db.collection('leaves').insertOne(leaveRequest);

    // Update student's recentLeaves
    await db.collection('students').updateOne(
      { _id: student._id },
      { 
        $push: { 
          recentLeaves: {
            $each: [{
              leaveId: result.insertedId,
              startDate: leaveRequest.startDate,
              endDate: leaveRequest.endDate,
              status: leaveRequest.status
            }],
            $slice: -5 // Keep only the 5 most recent leaves
          }
        }
      }
    );

    res.status(201).json({
      message: 'Leave request created successfully',
      leaveId: result.insertedId
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all leave requests
router.get('/all', async (req, res) => {
  try {
    const db = getDb();
    const leaves = await db.collection('leaves').aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      {
        $unwind: '$studentDetails'
      },
      {
        $project: {
          _id: 1,
          reason: 1,
          leaveType: 1,
          startDate: 1,
          endDate: 1,
          status: 1,
          createdAt: 1,
          'student.name': '$studentDetails.name',
          'student.enrollmentNumber': '$studentDetails.enrollmentNumber',
          'student.class': '$studentDetails.class',
          'student.section': '$studentDetails.section'
        }
      }
    ]).toArray();

    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
