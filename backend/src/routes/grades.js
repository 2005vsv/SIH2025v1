const express = require('express');
const {
  getAllGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
  getStudentGrades,
  getCourseGrades,
  bulkCreateGrades,
  getGradeStats,
} = require('../controllers/gradeController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/grades:
 *   get:
 *     summary: Get all grades
 *     tags: [Grades]
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
 *         name: studentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [incomplete, graded, published]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Grades retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, authorize('admin'), getAllGrades);

/**
 * @swagger
 * /api/grades/stats:
 *   get:
 *     summary: Get grade statistics
 *     tags: [Grades]
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
 *         description: Grade statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', auth, authorize('admin'), getGradeStats);

/**
 * @swagger
 * /api/grades:
 *   post:
 *     summary: Create a new grade
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - courseId
 *               - semesterId
 *               - components
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student ID
 *               courseId:
 *                 type: string
 *                 description: Course ID
 *               semesterId:
 *                 type: string
 *                 description: Semester ID
 *               components:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - weight
 *                     - maxScore
 *                   properties:
 *                     name:
 *                       type: string
 *                       enum: [midterm, final, practical, quiz, assignment, project, attendance]
 *                     weight:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                     score:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                     maxScore:
 *                       type: number
 *                       minimum: 0
 *               status:
 *                 type: string
 *                 enum: [incomplete, graded, published]
 *                 default: incomplete
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Grade created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, authorize('admin'), createGrade);

/**
 * @swagger
 * /api/grades/bulk:
 *   post:
 *     summary: Bulk create/update grades
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grades
 *             properties:
 *               grades:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - studentId
 *                     - courseId
 *                     - semesterId
 *                     - components
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     courseId:
 *                       type: string
 *                     semesterId:
 *                       type: string
 *                     components:
 *                       type: array
 *                       items:
 *                         type: object
 *     responses:
 *       200:
 *         description: Bulk operation completed
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/bulk', auth, authorize('admin'), bulkCreateGrades);

/**
 * @swagger
 * /api/grades/{id}:
 *   get:
 *     summary: Get a grade by ID
 *     tags: [Grades]
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
 *         description: Grade retrieved successfully
 *       404:
 *         description: Grade not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth, authorize('admin'), getGrade);

/**
 * @swagger
 * /api/grades/{id}:
 *   put:
 *     summary: Update a grade
 *     tags: [Grades]
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
 *               components:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - weight
 *                     - maxScore
 *                   properties:
 *                     name:
 *                       type: string
 *                       enum: [midterm, final, practical, quiz, assignment, project, attendance]
 *                     weight:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                     score:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                     maxScore:
 *                       type: number
 *                       minimum: 0
 *               status:
 *                 type: string
 *                 enum: [incomplete, graded, published]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Grade updated successfully
 *       404:
 *         description: Grade not found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', auth, authorize('admin'), updateGrade);

/**
 * @swagger
 * /api/grades/{id}:
 *   delete:
 *     summary: Delete a grade
 *     tags: [Grades]
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
 *         description: Grade deleted successfully
 *       404:
 *         description: Grade not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', auth, authorize('admin'), deleteGrade);

/**
 * @swagger
 * /api/grades/student/{studentId}:
 *   get:
 *     summary: Get student's grades
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: semesterId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student grades retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/student/:studentId', auth, authorize('admin', 'student'), getStudentGrades);

/**
 * @swagger
 * /api/grades/course/{courseId}:
 *   get:
 *     summary: Get course grades
 *     tags: [Grades]
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
 *         description: Course grades retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/course/:courseId', auth, authorize('admin'), getCourseGrades);

module.exports = router;