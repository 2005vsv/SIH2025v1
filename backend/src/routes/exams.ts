import express from 'express';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', auth, (req, res) => {
  res.json({ success: true, message: 'Exams routes working', data: [] });
});

router.get('/results', auth, (req, res) => {
  res.json({ success: true, message: 'Exam results', data: [] });
});

export default router;