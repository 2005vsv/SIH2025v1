const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  feeType: {
    type: String,
    enum: ['tuition', 'hostel', 'library', 'examination', 'other'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive'],
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  },
  paidAt: {
    type: Date,
  },
  paymentMethod: {
    type: String,
    trim: true,
  },
  transactionId: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes
FeeSchema.index({ userId: 1 });
FeeSchema.index({ status: 1 });
FeeSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Fee', FeeSchema);