import express from 'express';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/leaderboard', auth, (req, res) => {
  res.json({ success: true, message: 'Leaderboard', data: [] });
});

router.get('/badges', auth, (req, res) => {
  res.json({ success: true, message: 'User badges', data: [] });
});

export default router;