import express from 'express';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/jobs', auth, (req, res) => {
  res.json({ success: true, message: 'Job placements', data: [] });
});

router.post('/apply', auth, (req, res) => {
  res.json({ success: true, message: 'Application submitted', data: {} });
});

export default router;