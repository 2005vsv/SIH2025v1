const mongoose = require('mongoose');
const { Schema } = mongoose;

const JobSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  requirements: [{
    type: String,
    trim: true,
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  employmentType: {
    type: String,
    required: true,
    enum: ['full_time', 'part_time', 'internship', 'contract'],
    index: true,
  },
  salaryRange: {
    min: {
      type: Number,
      required: true,
      min: [0, 'Minimum salary cannot be negative'],
    },
    max: {
      type: Number,
      required: true,
      min: [0, 'Maximum salary cannot be negative'],
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP'],
    },
  },
  applicationDeadline: {
    type: Date,
    required: true,
    index: true,
  },
  eligibilityCriteria: {
    cgpaMin: {
      type: Number,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10'],
    },
    departments: [{
      type: String,
      trim: true,
    }],
    graduationYears: [{
      type: Number,
    }],
    skills: [{
      type: String,
      trim: true,
    }],
  },
  benefits: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  totalPositions: {
    type: Number,
    required: true,
    min: [1, 'Total positions must be at least 1'],
  },
  appliedCount: {
    type: Number,
    default: 0,
    min: [0, 'Applied count cannot be negative'],
  },
  selectedCount: {
    type: Number,
    default: 0,
    min: [0, 'Selected count cannot be negative'],
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

JobSchema.index({ isActive: 1, applicationDeadline: 1 });
JobSchema.index({ 'eligibilityCriteria.departments': 1, isActive: 1 });

module.exports = mongoose.model('Job', JobSchema);

// Company Model
const CompanySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
  },
  size: {
    type: String,
    required: [true, 'Company size is required'],
    enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
  },
  logo: {
    type: String,
    trim: true,
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true,
    lowercase: true,
  },
  contactPhone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports.Company = mongoose.model('Company', CompanySchema);