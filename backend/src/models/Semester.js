const mongoose = require('mongoose');
const { Schema } = mongoose;

const SemesterSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Semester name is required'],
    trim: true,
    unique: true,
  },
  semesterNumber: {
    type: Number,
    required: [true, 'Semester number is required'],
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: [true, 'Academic year is required'],
    min: 2020,
    max: 2030,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming',
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
  description: {
    type: String,
    trim: true,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for better performance
SemesterSchema.index({ status: 1 });
SemesterSchema.index({ year: 1 });
SemesterSchema.index({ startDate: 1, endDate: 1 });

// Ensure only one current semester at a time
SemesterSchema.pre('save', async function(next) {
  if (this.isCurrent && this.isModified('isCurrent')) {
    // Set all other semesters to not current
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isCurrent: false }
    );
  }
  next();
});

module.exports = mongoose.model('Semester', SemesterSchema);