const express = require('express');
const {
    applyForJob,
    createJob,
    deleteJob,
    getAllJobs,
    getJobApplications,
    getJobById,
    getPlacementStatistics,
    updateApplicationStatus,
    updateJob,
} = require('../controllers/placementController');
const upload = require('../middleware/resumeUpload');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// Student routes
router.get('/jobs', auth, getAllJobs);
router.get('/jobs/:id', auth, getJobById);
router.post('/jobs/:jobId/apply', auth, upload.single('resume'), applyForJob);
router.get('/applications', auth, getJobApplications);
router.get('/applications/my', auth, requireRole('student'), require('../controllers/placementController').getStudentApplications);

// Admin routes
router.post('/jobs', auth, requireRole('admin'), createJob);
router.put('/jobs/:id', auth, requireRole('admin'), updateJob);
router.delete('/jobs/:id', auth, requireRole('admin'), deleteJob);
router.put('/applications/:id', auth, requireRole('admin'), updateApplicationStatus);
router.get('/stats', auth, requireRole('admin'), getPlacementStatistics);
// Admin: get all student applications
const { getAllStudentApplications } = require('../controllers/placementController');
router.get('/applications/all', auth, requireRole('admin'), getAllStudentApplications);

module.exports = router;
