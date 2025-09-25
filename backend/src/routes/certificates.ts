// backend/src/routes/certificates.ts
// Add these routes to your existing certificates route file

import express from 'express';
import {
  createCertificate,
  getStudentCertificates,
  verifyCertificate,
  updateCertificateBlockchain
} from '../controllers/certificateController';

const router = express.Router();

// EXISTING ROUTES (keep all your existing routes)
// ... your existing routes here

// NEW ROUTES - Add these
router.post('/create', createCertificate);                    // Create certificate with QR
router.get('/student/:studentId', getStudentCertificates);    // Get student's certificates
router.get('/verify/:certificateId', verifyCertificate);      // Verify certificate (QR scan)
router.put('/:certificateId/blockchain', updateCertificateBlockchain); // Update with blockchain data

export default router;