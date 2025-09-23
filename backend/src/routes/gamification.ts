import express from 'express';
import {
  addPoints,
  awardBadge,
  createBadge,
  getAllBadges,
  getLeaderboard,
  getUserProfile
} from '../controllers/gamificationController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';

const router = express.Router();

// Student routes
router.get('/points', auth, getUserProfile);
router.get('/badges', auth, getAllBadges);
router.get('/achievements', auth, getUserProfile);
router.get('/leaderboard', auth, getLeaderboard);

// Admin routes
router.post('/badges', auth, requireRole('admin'), createBadge);
router.get('/all-badges', auth, requireRole('admin'), getAllBadges);
router.post('/award-badge', auth, requireRole('admin'), awardBadge);
router.post('/add-points', auth, requireRole('admin'), addPoints);

export default router;