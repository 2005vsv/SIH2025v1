const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't include password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'faculty'],
    default: 'student',
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  profile: {
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    department: {
      type: String,
      trim: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 12,
    },
    admissionYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    sgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
  },
  gamification: {
    points: {
      type: Number,
      default: 0,
    },
    badges: [{
      type: String,
    }],
    level: {
      type: Number,
      default: 1,
    },
  },
}, {
  timestamps: true,
});

// Index for better performance (email and studentId already have unique indexes)
UserSchema.index({ role: 1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12'));
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', UserSchema);