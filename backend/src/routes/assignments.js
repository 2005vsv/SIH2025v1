const express = require('express');
const {
  createAssignment,
  getCourseAssignments,
  getAssignment,
  updateAssignment,
  publishAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  getMySubmissions,
} = require('../controllers/assignmentController');
const { auth } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

// Faculty/Admin routes
router.post('/', auth, roleCheck(['admin', 'faculty']), createAssignment);
router.put('/:id', auth, roleCheck(['admin', 'faculty']), updateAssignment);
router.patch('/:id/publish', auth, roleCheck(['admin', 'faculty']), publishAssignment);
router.get('/:id/submissions', auth, roleCheck(['admin', 'faculty']), getAssignmentSubmissions);
router.put('/submissions/:submissionId/grade', auth, roleCheck(['admin', 'faculty']), gradeSubmission);

// Student routes
router.post('/:id/submit', auth, roleCheck(['student']), submitAssignment);
router.get('/my-submissions', auth, roleCheck(['student']), getMySubmissions);

// Shared routes (students and faculty can view assignments)
router.get('/course/:courseId', auth, getCourseAssignments);
router.get('/:id', auth, getAssignment);

module.exports = router;