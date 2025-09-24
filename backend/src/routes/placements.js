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
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// Student routes
router.get('/jobs', auth, getAllJobs);
router.get('/jobs/:id', auth, getJobById);
router.post('/apply', auth, applyForJob);
router.get('/applications', auth, getJobApplications);

// Admin routes
router.post('/jobs', auth, requireRole('admin'), createJob);
router.put('/jobs/:id', auth, requireRole('admin'), updateJob);
router.delete('/jobs/:id', auth, requireRole('admin'), deleteJob);
router.put('/applications/:id', auth, requireRole('admin'), updateApplicationStatus);
router.get('/stats', auth, requireRole('admin'), getPlacementStatistics);

module.exports = router;
