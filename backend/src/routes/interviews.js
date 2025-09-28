const express = require('express');
const { scheduleInterview, getStudentInterviews } = require('../controllers/interviewController');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// Admin: schedule interview for application
router.post('/schedule/:applicationId', auth, requireRole('admin'), scheduleInterview);

// Student: get scheduled interviews
router.get('/my-interviews', auth, requireRole('student'), getStudentInterviews);

module.exports = router;
