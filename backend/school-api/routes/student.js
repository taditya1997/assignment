const express = require('express');
const router = express.Router();
const { getDb } = require('../db');  // Add this line
const Student = require('../models/Student');

// Add a new student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dashboard data route
router.get('/dashboard-data', async (req, res) => {
  try {
    const db = getDb();
    
    const classes = await db.collection('classes').find().toArray();
    const sections = await db.collection('sections').find().toArray();
    
    const studentsData = await db.collection('students').aggregate([
      {
        $group: {
          _id: { class: '$class', section: '$section' },
          students: { 
            $push: { 
              name: '$name', 
              enrollmentNumber: '$enrollmentNumber',
              recentLeaves: '$recentLeaves'
            } 
          }
        }
      },
      {
        $group: {
          _id: '$_id.class',
          sections: {
            $push: {
              name: '$_id.section',
              students: '$students'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          class: '$_id',
          sections: 1
        }
      }
    ]).toArray();

    res.json({
      classes: classes.map(c => c.name),
      sections: sections.map(s => s.name),
      studentsData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
