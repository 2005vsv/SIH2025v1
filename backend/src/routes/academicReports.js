const express = require('express');
const {
  generateTranscript,
  getAcademicSummary,
  getStudentPerformance,
  getCourseAnalysis,
} = require('../controllers/academicReportController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/academic-reports/transcript/{studentId}:
 *   get:
 *     summary: Generate student transcript
 *     tags: [Academic Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf]
 *           default: json
 *     responses:
 *       200:
 *         description: Transcript generated successfully
 *       404:
 *         description: Student or grades not found
 *       401:
 *         description: Unauthorized
 */
router.get('/transcript/:studentId', auth, authorize('admin', 'student'), generateTranscript);

/**
 * @swagger
 * /api/academic-reports/summary:
 *   get:
 *     summary: Get academic summary for admin dashboard
 *     tags: [Academic Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: semesterId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Academic summary retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', auth, authorize('admin'), getAcademicSummary);

/**
 * @swagger
 * /api/academic-reports/student-performance/{studentId}:
 *   get:
 *     summary: Get detailed student performance report
 *     tags: [Academic Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student performance report generated successfully
 *       404:
 *         description: Student or grades not found
 *       401:
 *         description: Unauthorized
 */
router.get('/student-performance/:studentId', auth, authorize('admin', 'student'), getStudentPerformance);

/**
 * @swagger
 * /api/academic-reports/course-analysis/{courseId}:
 *   get:
 *     summary: Get course performance analysis
 *     tags: [Academic Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: semesterId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course analysis generated successfully
 *       404:
 *         description: Course or grades not found
 *       401:
 *         description: Unauthorized
 */
router.get('/course-analysis/:courseId', auth, authorize('admin'), getCourseAnalysis);

module.exports = router;