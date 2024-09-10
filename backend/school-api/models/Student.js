const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  enrollmentNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  recentLeaves: [{
    leaveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Leave' },
    startDate: Date,
    endDate: Date,
    status: String
  }]
});

module.exports = mongoose.model('Student', studentSchema);
