const express = require('express');
const {
  addPoints,
  awardBadge,
  createBadge,
  getAllBadges,
  getLeaderboard,
  getUserProfile
} = require('../controllers/gamificationController');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// Student routes
router.get('/points', auth, getUserProfile);
router.get('/points/my', auth, getUserProfile);
router.get('/badges', auth, getAllBadges);
router.get('/achievements', auth, getUserProfile);
router.get('/leaderboard', auth, getLeaderboard);

// Admin routes
router.post('/badges', auth, requireRole('admin'), createBadge);
router.get('/all-badges', auth, requireRole('admin'), getAllBadges);
router.post('/award-badge', auth, requireRole('admin'), awardBadge);
router.post('/add-points', auth, requireRole('admin'), addPoints);

module.exports = router;
