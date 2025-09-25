// backend/src/controllers/certificateController.ts
// Add this to your existing certificate controller

import { Request, Response } from 'express';
import { Document, Types } from 'mongoose';
import QRCode from 'qrcode';
import { Certificate, ICertificate } from '../models/Certificate';
import blockchainService from '../services/blockchainService';

// Types
interface CertificateDocument extends Document, ICertificate {
  _id: Types.ObjectId;
}

// Helper function for error handling
const handleError = (res: Response, error: unknown) => {
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  return res.status(500).json({ success: false, error: message });
}

// EXISTING FUNCTION - Modify to add QR generation
export const createCertificate = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { studentId, certificateType, grade, examId } = req.body;

    // 1. Create certificate in database
    const certificate = new Certificate({
      studentId,
      certificateType,
      grade,
      examId,
      issueDate: new Date(),
      isBlockchainIssued: false, // Frontend will handle blockchain
    });

    const savedCertificate = await certificate.save() as CertificateDocument;
    const certificateId = savedCertificate._id.toString();

    // 2. Generate QR code with verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-certificate/${certificateId}`;
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // 3. Update certificate with QR data
    savedCertificate.qrCode = qrCodeDataURL;
    savedCertificate.verificationUrl = verificationUrl;
    await savedCertificate.save();

    return res.status(201).json({
      success: true,
      message: 'Certificate created with QR code',
      certificate: {
        id: certificateId,
        studentId,
        certificateType,
        grade,
        issueDate: savedCertificate.issueDate,
        qrCode: qrCodeDataURL,
        verificationUrl,
        isBlockchainIssued: false
      }
    });

  } catch (error) {
    return handleError(res, error);
  }
};

// NEW FUNCTION - Get certificates for a student
export const getStudentCertificates = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { studentId } = req.params;
    
    const certificates = await Certificate.find({ studentId }).sort({ issueDate: -1 }) as CertificateDocument[];
    
    return res.json({
      success: true,
      certificates: certificates.map(cert => ({
        id: (cert._id as Types.ObjectId).toString(),
        studentId: cert.studentId,
        certificateType: cert.certificateType,
        grade: cert.grade,
        issueDate: cert.issueDate,
        qrCode: cert.qrCode,
        verificationUrl: cert.verificationUrl,
        blockchainTxHash: cert.blockchainTxHash,
        isBlockchainIssued: cert.isBlockchainIssued,
      }))
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// NEW FUNCTION - Verify certificate (for QR code scanning)
export const verifyCertificate = async (req: Request, res: Response): Promise<Response> => {
  try {
    const certificate = await Certificate.findById(req.params.id) as CertificateDocument;
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Simplified verification logic until blockchain is fully implemented
    const isValid = true; // Temporary
    
    return res.json({ 
      success: true, 
      isValid,
      certificate: {
        id: certificate._id,
        studentId: certificate.studentId,
        certificateType: certificate.certificateType,
        issueDate: certificate.issueDate
      }
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// NEW FUNCTION - Update certificate with blockchain data (called from frontend)
export const updateCertificateBlockchain = async (req: Request, res: Response): Promise<Response> => {
  try {
    const certificate = await Certificate.findById(req.params.id) as CertificateDocument;
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // ...existing code...

    return res.json({ success: true, data: certificate });
  } catch (error) {
    return handleError(res, error);
  }
};