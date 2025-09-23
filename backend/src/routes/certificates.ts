import express from 'express';
import {
    createCertificate,
    deleteCertificate,
    downloadCertificate,
    getAllCertificates,
    getCertificateById,
    updateCertificate,
    verifyCertificate,
} from '../controllers/certificateController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';

const router = express.Router();

// Student routes
router.get('/', auth, getAllCertificates);
router.get('/:id', auth, getCertificateById);
router.get('/:id/download', auth, downloadCertificate);
router.post('/', auth, createCertificate);

// Admin routes
router.put('/:id', auth, requireRole('admin'), updateCertificate);
router.delete('/:id', auth, requireRole('admin'), deleteCertificate);

// Public routes
router.post('/verify', verifyCertificate);

export default router;