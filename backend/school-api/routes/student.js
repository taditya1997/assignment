const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const Class = require('../models/Class');

// GET dashboard data
router.get('/dashboard-data', auth, async (req, res) => {
  try {
    const classes = await Class.find().select('name');
    const sections = await Student.distinct('section');
    
    const studentsData = await Student.aggregate([
      {
        $lookup: {
          from: 'classes',
          localField: 'class',
          foreignField: '_id',
          as: 'classInfo'
        }
      },
      {
        $unwind: '$classInfo'
      },
      {
        $group: {
          _id: { class: '$classInfo.name', section: '$section' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          class: '$_id.class',
          section: '$_id.section',
          count: 1
        }
      }
    ]);

    res.json({ 
      classes: classes.map(c => c.name), 
      sections, 
      studentsData 
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
