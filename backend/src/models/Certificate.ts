// backend/src/models/Certificate.ts
// Updated Certificate model

import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificate extends Document {
  studentId: string;
  certificateType: string;
  grade?: string;
  qrCode?: string;
  verificationUrl?: string;
  blockchainTxHash?: string;
  isBlockchainIssued: boolean;
  issueDate: Date;
}

const certificateSchema = new Schema<ICertificate>({
  studentId: { type: String, required: true },
  certificateType: { type: String, required: true },
  grade: { type: String },
  qrCode: { type: String },
  verificationUrl: { type: String },
  blockchainTxHash: { type: String },
  isBlockchainIssued: { type: Boolean, default: false },
  issueDate: { type: Date, default: Date.now },
}, {
  timestamps: true
});

// Single place for indices
certificateSchema.index({ studentId: 1 });
certificateSchema.index({ certificateType: 1 });

export const Certificate = mongoose.model<ICertificate>('Certificate', certificateSchema);
export default Certificate;