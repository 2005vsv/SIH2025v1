const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExamSchema = new Schema({
  code: {
    type: String,
    unique: true,
    trim: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
  },
  semesterNumber: {
    type: Number,
    required: [true, 'Semester number is required'],
    min: 1,
    max: 8,
  },
  examType: {
    type: String,
    required: [true, 'Exam type is required'],
    enum: ['midterm', 'final', 'quiz', 'practical', 'viva', 'project', 'online'],
  },
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  examDate: {
    type: Date,
    required: [true, 'Exam date is required'],
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^\d{2}:\d{2}$/, 'Time format should be HH:MM'],
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^\d{2}:\d{2}$/, 'Time format should be HH:MM'],
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: 30,
    max: 480, // 8 hours max
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  room: {
    type: String,
    trim: true,
  },
  building: {
    type: String,
    trim: true,
  },
  seatAllocation: {
    type: String,
    enum: ['random', 'roll_number', 'alphabetical'],
    default: 'roll_number',
  },
  instructions: {
    type: String,
    trim: true,
  },
  syllabus: {
    type: String,
    trim: true,
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks is required'],
    min: 1,
  },
  passingMarks: {
    type: Number,
    min: 0,
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'],
    default: 'draft',
  },
  questions: [{
    questionNumber: {
      type: Number,
      required: true,
    },
    questionType: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'short_answer', 'essay', 'code'],
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: [{
      type: String,
      trim: true,
    }],
    correctAnswer: {
      type: String,
      trim: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
    },
    explanation: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    topic: {
      type: String,
      trim: true,
    },
  }],
  settings: {
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleOptions: {
      type: Boolean,
      default: false,
    },
    showResults: {
      type: Boolean,
      default: false,
    },
    allowReview: {
      type: Boolean,
      default: true,
    },
    timeLimit: {
      type: Number, // in minutes
      min: 0,
    },
    attemptsAllowed: {
      type: Number,
      default: 1,
      min: 1,
    },
    lateSubmission: {
      type: Boolean,
      default: false,
    },
    gracePeriod: {
      type: Number, // in minutes
      default: 0,
    },
  },
  proctoring: {
    enabled: {
      type: Boolean,
      default: false,
    },
    webcamRequired: {
      type: Boolean,
      default: false,
    },
    screenSharing: {
      type: Boolean,
      default: false,
    },
    tabSwitchDetection: {
      type: Boolean,
      default: false,
    },
    copyPastePrevention: {
      type: Boolean,
      default: false,
    },
    faceDetection: {
      type: Boolean,
      default: false,
    },
    browserLockdown: {
      type: Boolean,
      default: false,
    },
  },
  invigilators: [{
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  hallTickets: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hallTicketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    seatNumber: {
      type: String,
      trim: true,
    },
    qrCode: {
      type: String,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
  collection: 'exams_new'
});

// Index for better performance
ExamSchema.index({ courseId: 1 });
ExamSchema.index({ semesterNumber: 1 });
ExamSchema.index({ examDate: 1 });
ExamSchema.index({ examType: 1 });
ExamSchema.index({ status: 1 });
ExamSchema.index({ title: 1 });

// Compound index to prevent scheduling conflicts
ExamSchema.index({ examDate: 1, startTime: 1, endTime: 1, room: 1 }, {
  unique: true,
  partialFilterExpression: { status: { $in: ['scheduled', 'ongoing'] } }
});

// Virtual for checking if exam is in the past
ExamSchema.virtual('isPast').get(function() {
  return new Date() > this.examDate;
});

// Virtual for checking if exam is today
ExamSchema.virtual('isToday').get(function() {
  const today = new Date();
  const examDate = new Date(this.examDate);
  return today.toDateString() === examDate.toDateString();
});

// Method to check for time conflicts
ExamSchema.methods.hasTimeConflict = function(otherExam) {
  if (this.room !== otherExam.room) return false;

  const thisStart = new Date(this.examDate);
  const thisEnd = new Date(this.examDate);
  const otherStart = new Date(otherExam.examDate);
  const otherEnd = new Date(otherExam.examDate);

  const [thisHour, thisMin] = this.startTime.split(':').map(Number);
  const [thisEndHour, thisEndMin] = this.endTime.split(':').map(Number);
  const [otherHour, otherMin] = otherExam.startTime.split(':').map(Number);
  const [otherEndHour, otherEndMin] = otherExam.endTime.split(':').map(Number);

  thisStart.setHours(thisHour, thisMin);
  thisEnd.setHours(thisEndHour, thisEndMin);
  otherStart.setHours(otherHour, otherMin);
  otherEnd.setHours(otherEndHour, otherEndMin);

  // Check for overlap
  return (thisStart < otherEnd && thisEnd > otherStart);
};

// Static method to find conflicting exams
ExamSchema.statics.findConflicts = function(examData) {
  const { examDate, startTime, endTime, room, excludeId } = examData;

  const query = {
    examDate,
    room,
    status: { $in: ['scheduled', 'ongoing'] },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.find(query);
};

module.exports = mongoose.model('Exam', ExamSchema);