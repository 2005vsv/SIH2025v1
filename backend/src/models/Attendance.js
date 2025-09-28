const mongoose = require('mongoose');
const { Schema } = mongoose;

const AttendanceSchema = new Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: [true, 'Attendance status is required'],
    default: 'present',
  },
  markedAt: {
    type: Date,
    default: Date.now,
  },
  markedBy: {
    type: String,
    enum: ['qr', 'manual', 'auto'],
    default: 'manual',
  },
  qrCode: {
    type: String,
    trim: true,
  },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
  },
  deviceInfo: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate attendance records
AttendanceSchema.index({ courseId: 1, studentId: 1, date: 1 }, { unique: true });

// Index for better query performance
AttendanceSchema.index({ courseId: 1, date: 1 });
AttendanceSchema.index({ studentId: 1, date: 1 });
AttendanceSchema.index({ status: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);