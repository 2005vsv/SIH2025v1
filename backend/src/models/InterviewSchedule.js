const mongoose = require('mongoose');
const { Schema } = mongoose;

const InterviewScheduleSchema = new Schema({
  applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  mode: { type: String, enum: ['online', 'offline'], required: true },
  questions: [{ type: String, required: true }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }, // admin
}, { timestamps: true });

module.exports = mongoose.model('InterviewSchedule', InterviewScheduleSchema);
