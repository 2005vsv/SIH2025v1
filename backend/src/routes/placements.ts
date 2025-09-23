import express from 'express';
import {
    applyForJob,
    createJob,
    deleteJob,
    getAllJobs,
    getJobApplications,
    getJobById,
    getPlacementStatistics,
    updateApplicationStatus,
    updateJob,
} from '../controllers/placementController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';

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

export default router;