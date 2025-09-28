const express = require('express');
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  getAvailableCourses,
  getMyCourses,
  enrollInCourse,
  dropCourse,
  checkPrerequisites,
  generateAttendanceQR,
  markAttendance,
  getCourseAttendance,
  uploadCourseMaterial,
  getCourseMaterials,
  updateCourseMaterial
} = require('../controllers/courseController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

// Student routes
router.get('/available', auth, authorize('student', 'admin'), getAvailableCourses);
router.get('/my-courses', auth, authorize('student', 'admin'), getMyCourses);
router.post('/:id/enroll', auth, authorize('student', 'admin'), enrollInCourse);
router.delete('/:id/drop', auth, authorize('student', 'admin'), dropCourse);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
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
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: semester
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, completed, upcoming]
 *           default: active
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: code
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, roleCheck(['admin']), getAllCourses);

/**
 * @swagger
 * /api/courses/stats:
 *   get:
 *     summary: Get course statistics
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Course statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', auth, roleCheck(['admin']), getCourseStats);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - department
 *               - semester
 *               - credits
 *               - instructor
 *               - maxCapacity
 *               - schedule
 *             properties:
 *               code:
 *                 type: string
 *                 description: Unique course code (e.g., CSE101)
 *               name:
 *                 type: string
 *                 description: Course name
 *               department:
 *                 type: string
 *                 description: Department offering the course
 *               semester:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 description: Semester number
 *               credits:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 6
 *                 description: Credit hours
 *               type:
 *                 type: string
 *                 enum: [core, elective, lab, project]
 *                 default: core
 *               instructor:
 *                 type: object
 *                 required:
 *                   - name
 *                   - email
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *               maxCapacity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Maximum number of students
 *               schedule:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - day
 *                     - time
 *                     - room
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                     time:
 *                       type: string
 *                       pattern: '^\d{2}:\d{2}-\d{2}:\d{2}$'
 *                       example: "09:00-10:30"
 *                     room:
 *                       type: string
 *               description:
 *                 type: string
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, roleCheck(['admin']), createCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
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
 *         description: Course retrieved successfully
 *       404:
 *         description: Course not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth, roleCheck(['admin']), getCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
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
 *               department:
 *                 type: string
 *               semester:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *               credits:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 6
 *               type:
 *                 type: string
 *                 enum: [core, elective, lab, project]
 *               instructor:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *               maxCapacity:
 *                 type: integer
 *                 minimum: 1
 *               schedule:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - day
 *                     - time
 *                     - room
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                     time:
 *                       type: string
 *                       pattern: '^\d{2}:\d{2}-\d{2}:\d{2}$'
 *                     room:
 *                       type: string
 *               description:
 *                 type: string
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, completed, upcoming]
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       404:
 *         description: Course not found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', auth, roleCheck(['admin']), updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
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
 *         description: Course deleted successfully
 *       404:
 *         description: Course not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', auth, roleCheck(['admin']), deleteCourse);

// Prerequisite and enrollment validation
router.post('/:id/check-prerequisites', auth, authorize('student', 'admin'), checkPrerequisites);

// Attendance management
router.post('/:id/generate-qr', auth, roleCheck(['admin', 'faculty']), generateAttendanceQR);
router.post('/mark-attendance', auth, authorize('student', 'admin'), markAttendance);
router.get('/:id/attendance', auth, getCourseAttendance);

// Course materials management
router.post('/:id/materials', auth, roleCheck(['admin', 'faculty']), uploadCourseMaterial);
router.get('/:id/materials', auth, getCourseMaterials);
router.put('/:id/materials/:materialId', auth, roleCheck(['admin', 'faculty']), updateCourseMaterial);

module.exports = router;