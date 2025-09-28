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
    validate: {
      validator: function(password) {
        // Password must contain at least one uppercase, one lowercase, one number
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  lastLogin: {
    type: Date
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

// Constants for login attempts
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

// Check if account is locked
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to handle failed login attempts
UserSchema.methods.incrementLoginAttempts = async function() {
  // If previous lock has expired, restart count
  if (this.lockUntil && this.lockUntil < Date.now()) {
    await this.updateOne({
      $set: {
        loginAttempts: 1,
        lockUntil: null
      }
    });
    return;
  }

  // Otherwise increment login attempts
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account if max attempts reached
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }

  await this.updateOne(updates);
};

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
  // Check if account is locked
  if (this.isLocked) {
    throw new Error('Account is temporarily locked. Please try again later.');
  }

  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    if (isMatch) {
      // Reset login attempts and update last login on successful login
      await this.updateOne({
        $set: {
          loginAttempts: 0,
          lockUntil: null,
          lastLogin: new Date()
        }
      });
    } else {
      // Increment failed login attempts
      await this.incrementLoginAttempts();
    }
    
    return isMatch;
  } catch (error) {
    throw error;
  }
};

// Don't return password in JSON
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', UserSchema);