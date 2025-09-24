const mongoose = require('mongoose');
const { Schema } = mongoose;

const BadgeSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Badge name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  icon: {
    type: String,
    required: [true, 'Icon is required'],
    trim: true,
  },
  criteria: {
    type: String,
    required: [true, 'Criteria is required'],
    trim: true,
  },
  points: {
    type: Number,
    required: [true, 'Points value is required'],
    min: [1, 'Points must be positive'],
  },
  category: {
    type: String,
    required: true,
    enum: ['academic', 'social', 'achievement', 'participation', 'milestone'],
    index: true,
  },
  rarity: {
    type: String,
    required: true,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports.Badge = mongoose.model('Badge', BadgeSchema);

const GamificationPointSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['badge_earned', 'exam_score', 'library_activity', 'placement_activity', 'fee_payment', 'event_participation', 'manual_award'],
    index: true,
  },
  points: {
    type: Number,
    required: [true, 'Points value is required'],
    min: [1, 'Points must be positive'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
  },
  relatedEntity: {
    model: {
      type: String,
      enum: ['Exam', 'Book', 'Job', 'Fee', 'Certificate'],
    },
    id: {
      type: Schema.Types.ObjectId,
      refPath: 'relatedEntity.model',
    },
  },
  badgeId: {
    type: Schema.Types.ObjectId,
    ref: 'Badge',
  },
  awardedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  multiplier: {
    type: Number,
    default: 1,
    min: [0.1, 'Multiplier must be positive'],
    max: [10, 'Multiplier cannot exceed 10'],
  },
}, {
  timestamps: true,
});

GamificationPointSchema.index({ userId: 1, createdAt: -1 });
GamificationPointSchema.index({ type: 1, createdAt: -1 });

module.exports.GamificationPoint = mongoose.model('GamificationPoint', GamificationPointSchema);

const UserBadgeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  badgeId: {
    type: Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
    index: true,
  },
  earnedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100'],
  },
  isDisplayed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });
UserBadgeSchema.index({ earnedAt: -1 });

module.exports.UserBadge = mongoose.model('UserBadge', UserBadgeSchema);