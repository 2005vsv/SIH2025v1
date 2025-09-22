import express from 'express';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/books', auth, (req, res) => {
  res.json({ success: true, message: 'Library books', data: [] });
});

router.post('/borrow', auth, (req, res) => {
  res.json({ success: true, message: 'Book borrowed successfully', data: {} });
});

router.post('/return', auth, (req, res) => {
  res.json({ success: true, message: 'Book returned successfully', data: {} });
});

export default router;