const mongoose = require('mongoose');
const { Schema } = mongoose;

const CourseSchema = new Schema({
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required'],
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: 1,
    max: 6,
  },
  type: {
    type: String,
    enum: ['core', 'elective', 'lab', 'project'],
    default: 'core',
  },
  instructor: {
    name: {
      type: String,
      required: [true, 'Instructor name is required'],
    },
    email: {
      type: String,
      required: [true, 'Instructor email is required'],
      lowercase: true,
      trim: true,
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  enrolledStudents: {
    type: Number,
    default: 0,
    min: 0,
  },
  maxCapacity: {
    type: Number,
    required: [true, 'Maximum capacity is required'],
    min: 1,
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    time: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Time format should be HH:MM-HH:MM'],
    },
    room: {
      type: String,
      required: true,
      trim: true,
    },
    qrCode: {
      type: String,
      default: null,
    },
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'upcoming'],
    default: 'active',
  },
  description: {
    type: String,
    trim: true,
  },
  prerequisites: [{
    courseCode: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      trim: true,
    },
    minGrade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'F'],
      default: 'D',
    },
  }],
  courseMaterials: [{
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'document', 'presentation'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    versionHistory: [{
      version: Number,
      url: String,
      uploadedBy: mongoose.Schema.Types.ObjectId,
      uploadedAt: Date,
      changes: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  syllabus: {
    type: String,
    trim: true,
  },
  objectives: [{
    type: String,
    trim: true,
  }],
  outcomes: [{
    type: String,
    trim: true,
  }],
  textbooks: [{
    title: String,
    author: String,
    isbn: String,
    required: {
      type: Boolean,
      default: false,
    },
  }],
  gradingPolicy: {
    attendance: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    assignments: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
    midterm: {
      type: Number,
      default: 30,
      min: 0,
      max: 100,
    },
    final: {
      type: Number,
      default: 40,
      min: 0,
      max: 100,
    },
  },
  attendance: {
    totalClasses: {
      type: Number,
      default: 0,
    },
    requiredAttendance: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
  },
}, {
  timestamps: true,
});

// Index for better performance
CourseSchema.index({ department: 1, semester: 1 });
CourseSchema.index({ code: 1 });
CourseSchema.index({ status: 1 });

module.exports = mongoose.model('Course', CourseSchema);