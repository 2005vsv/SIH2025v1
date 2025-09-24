const express = require('express');
const {
    createCertificate,
    deleteCertificate,
    downloadCertificate,
    getAllCertificates,
    getCertificateById,
    updateCertificate,
    verifyCertificate,
} = require('../controllers/certificateController');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

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

module.exports = router;
