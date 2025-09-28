const express = require('express');
const {
    applyForJob,
    createJob,
    deleteJob,
    getAllJobs,
    getJobApplications,
    getJobById,
    getPlacementStatistics,
    getTrendingJobs,
    getRecentPlacements,
    bulkUpdateJobStatus,
    getJobRecommendations,
    scheduleInterview,
    getPlacementDashboard,
    updateApplicationStatus,
    updateJob,
    getStudentApplications,
} = require('../controllers/placementController');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// Student routes
router.get('/jobs', auth, getAllJobs);
router.get('/jobs/:id', auth, getJobById);
router.post('/apply', auth, applyForJob);
router.get('/applications', auth, getJobApplications);
router.get('/applications/my', auth, getStudentApplications);

// Student routes
router.get('/recommendations', auth, getJobRecommendations);
router.get('/dashboard', auth, getPlacementDashboard);

// Admin routes
router.post('/jobs', auth, requireRole('admin'), createJob);
router.put('/jobs/:id', auth, requireRole('admin'), updateJob);
router.delete('/jobs/:id', auth, requireRole('admin'), deleteJob);
router.put('/applications/:id', auth, requireRole('admin'), updateApplicationStatus);
router.post('/applications/:applicationId/interview', auth, requireRole('admin'), scheduleInterview);
router.put('/jobs/bulk-update', auth, requireRole('admin'), bulkUpdateJobStatus);
router.get('/stats', auth, requireRole('admin'), getPlacementStatistics);
router.get('/trending', auth, requireRole('admin'), getTrendingJobs);
router.get('/recent-placements', auth, requireRole('admin'), getRecentPlacements);

module.exports = router;
