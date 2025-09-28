const express = require('express');
const {
  getAllSemesters,
  getSemester,
  createSemester,
  updateSemester,
  deleteSemester,
  getCurrentSemester,
  addCoursesToSemester,
  removeCoursesFromSemester,
  getSemesterStats,
} = require('../controllers/semesterController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/semesters:
 *   get:
 *     summary: Get all semesters
 *     tags: [Semesters]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, active, completed]
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: startDate
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Semesters retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, authorize('admin'), getAllSemesters);

/**
 * @swagger
 * /api/semesters/current:
 *   get:
 *     summary: Get current semester
 *     tags: [Semesters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current semester retrieved successfully
 *       404:
 *         description: No current semester found
 *       401:
 *         description: Unauthorized
 */
router.get('/current', auth, authorize('admin', 'student'), getCurrentSemester);

/**
 * @swagger
 * /api/semesters:
 *   post:
 *     summary: Create a new semester
 *     tags: [Semesters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - year
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Semester name (e.g., Fall 2024)
 *               year:
 *                 type: integer
 *                 description: Academic year
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Semester start date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Semester end date
 *               status:
 *                 type: string
 *                 enum: [upcoming, active, completed]
 *                 default: upcoming
 *               courses:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of course IDs
 *               description:
 *                 type: string
 *                 description: Semester description
 *               isCurrent:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this is the current semester
 *     responses:
 *       201:
 *         description: Semester created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, authorize('admin'), createSemester);

/**
 * @swagger
 * /api/semesters/{id}:
 *   get:
 *     summary: Get a semester by ID
 *     tags: [Semesters]
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
 *         description: Semester retrieved successfully
 *       404:
 *         description: Semester not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth, authorize('admin'), getSemester);

/**
 * @swagger
 * /api/semesters/{id}:
 *   put:
 *     summary: Update a semester
 *     tags: [Semesters]
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
 *               name:
 *                 type: string
 *               year:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [upcoming, active, completed]
 *               courses:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               isCurrent:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Semester updated successfully
 *       404:
 *         description: Semester not found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', auth, authorize('admin'), updateSemester);

/**
 * @swagger
 * /api/semesters/{id}:
 *   delete:
 *     summary: Delete a semester
 *     tags: [Semesters]
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
 *         description: Semester deleted successfully
 *       404:
 *         description: Semester not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', auth, authorize('admin'), deleteSemester);

/**
 * @swagger
 * /api/semesters/{id}/courses:
 *   post:
 *     summary: Add courses to semester
 *     tags: [Semesters]
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
 *             required:
 *               - courseIds
 *             properties:
 *               courseIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of course IDs to add
 *     responses:
 *       200:
 *         description: Courses added to semester successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Semester not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/courses', auth, authorize('admin'), addCoursesToSemester);

/**
 * @swagger
 * /api/semesters/{id}/courses:
 *   delete:
 *     summary: Remove courses from semester
 *     tags: [Semesters]
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
 *             required:
 *               - courseIds
 *             properties:
 *               courseIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of course IDs to remove
 *     responses:
 *       200:
 *         description: Courses removed from semester successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Semester not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id/courses', auth, authorize('admin'), removeCoursesFromSemester);

/**
 * @swagger
 * /api/semesters/{id}/stats:
 *   get:
 *     summary: Get semester statistics
 *     tags: [Semesters]
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
 *         description: Semester statistics retrieved successfully
 *       404:
 *         description: Semester not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/stats', auth, authorize('admin'), getSemesterStats);

module.exports = router;