const express = require('express');
const {
  getAllExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  getMyTimetable,
  getExamStats,
  bulkCreateExams,
  startOnlineExam,
  submitOnlineExam,
  saveExamProgress,
  generateHallTickets,
  getHallTicket,
  getProctoringReport,
} = require('../controllers/examController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/exams:
 *   get:
 *     summary: Get all exams
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: semesterId
 *         schema:
 *           type: string
 *       - in: query
 *         name: examType
 *         schema:
 *           type: string
 *           enum: [midterm, final, quiz, practical, viva, project]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, ongoing, completed, cancelled, postponed]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: examDate
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Exams retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, authorize('admin', 'student'), getAllExams);

/**
 * @swagger
 * /api/exams/stats:
 *   get:
 *     summary: Get exam statistics
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: semesterId
 *         schema:
 *           type: string
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', auth, authorize('admin'), getExamStats);

/**
 * @swagger
 * /api/exams/my-timetable:
 *   get:
 *     summary: Get my exam timetable
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: semesterId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam timetable retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my-timetable', auth, authorize('student'), getMyTimetable);

/**
 * @swagger
 * /api/exams:
 *   post:
 *     summary: Create a new exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - semesterId
 *               - examType
 *               - examDate
 *               - startTime
 *               - endTime
 *               - duration
 *               - room
 *               - maxMarks
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: Course ID
 *               semesterId:
 *                 type: string
 *                 description: Semester ID
 *               examType:
 *                 type: string
 *                 enum: [midterm, final, quiz, practical, viva, project]
 *               examDate:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 pattern: '^\d{2}:\d{2}$'
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 pattern: '^\d{2}:\d{2}$'
 *                 example: "12:00"
 *               duration:
 *                 type: integer
 *                 minimum: 30
 *                 maximum: 480
 *                 description: Duration in minutes
 *               room:
 *                 type: string
 *                 description: Exam room
 *               building:
 *                 type: string
 *                 description: Building name
 *               seatAllocation:
 *                 type: string
 *                 enum: [random, roll_number, alphabetical]
 *                 default: roll_number
 *               instructions:
 *                 type: string
 *                 description: Exam instructions
 *               syllabus:
 *                 type: string
 *                 description: Syllabus topics
 *               maxMarks:
 *                 type: integer
 *                 minimum: 1
 *               passingMarks:
 *                 type: integer
 *                 minimum: 0
 *               status:
 *                 type: string
 *                 enum: [scheduled, ongoing, completed, cancelled, postponed]
 *                 default: scheduled
 *               invigilators:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - email
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *     responses:
 *       201:
 *         description: Exam created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, authorize('admin'), createExam);

/**
 * @swagger
 * /api/exams/bulk:
 *   post:
 *     summary: Bulk create exams
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exams
 *             properties:
 *               exams:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - courseId
 *                     - semesterId
 *                     - examType
 *                     - examDate
 *                     - startTime
 *                     - endTime
 *                     - duration
 *                     - room
 *                     - maxMarks
 *     responses:
 *       200:
 *         description: Bulk operation completed
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/bulk', auth, authorize('admin'), bulkCreateExams);

/**
 * @swagger
 * /api/exams/{id}:
 *   get:
 *     summary: Get an exam by ID
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam retrieved successfully
 *       404:
 *         description: Exam not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth, authorize('admin', 'student'), getExam);

/**
 * @swagger
 * /api/exams/{id}:
 *   put:
 *     summary: Update an exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               examType:
 *                 type: string
 *                 enum: [midterm, final, quiz, practical, viva, project]
 *               examDate:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 pattern: '^\d{2}:\d{2}$'
 *               endTime:
 *                 type: string
 *                 pattern: '^\d{2}:\d{2}$'
 *               duration:
 *                 type: integer
 *                 minimum: 30
 *                 maximum: 480
 *               room:
 *                 type: string
 *               building:
 *                 type: string
 *               seatAllocation:
 *                 type: string
 *                 enum: [random, roll_number, alphabetical]
 *               instructions:
 *                 type: string
 *               syllabus:
 *                 type: string
 *               maxMarks:
 *                 type: integer
 *                 minimum: 1
 *               passingMarks:
 *                 type: integer
 *                 minimum: 0
 *               status:
 *                 type: string
 *                 enum: [scheduled, ongoing, completed, cancelled, postponed]
 *               invigilators:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - email
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *     responses:
 *       200:
 *         description: Exam updated successfully
 *       404:
 *         description: Exam not found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', auth, authorize('admin'), updateExam);

/**
 * @swagger
 * /api/exams/{id}:
 *   delete:
 *     summary: Delete an exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exam deleted successfully
 *       404:
 *         description: Exam not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', auth, authorize('admin'), deleteExam);

// Online exam routes
router.post('/:id/start', auth, authorize('student'), startOnlineExam);
router.post('/:id/submit', auth, authorize('student'), submitOnlineExam);
router.post('/:id/save-progress', auth, authorize('student'), saveExamProgress);

// Hall ticket routes
router.post('/:id/generate-hall-tickets', auth, authorize('admin', 'faculty'), generateHallTickets);
router.get('/:id/hall-ticket', auth, authorize('student'), getHallTicket);

// Proctoring routes
router.get('/:id/proctoring/:studentId', auth, authorize('admin', 'faculty'), getProctoringReport);

module.exports = router;
