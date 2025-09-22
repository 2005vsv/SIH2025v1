import express from 'express';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', auth, (req, res) => {
  res.json({ success: true, message: 'Hostel routes working', data: [] });
});

router.post('/request-change', auth, (req, res) => {
  res.json({ success: true, message: 'Room change request submitted', data: {} });
});

export default router;