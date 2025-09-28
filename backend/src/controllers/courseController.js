const Joi = require('joi');
const { logger } = require('../config/logger');
const Course = require('../models/Course');
const CourseEnrollment = require('../models/CourseEnrollment');
const Semester = require('../models/Semester');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateQRCode } = require('../utils/helpers');

// Validation schemas
const courseSchema = Joi.object({
  code: Joi.string().required().uppercase().trim(),
  name: Joi.string().required().trim(),
  department: Joi.string().required().trim(),
  semesterId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  credits: Joi.number().integer().min(1).max(6).required(),
  type: Joi.string().valid('core', 'elective', 'lab', 'project').default('core'),
  instructor: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required().lowercase().trim(),
  }).required(),
  maxCapacity: Joi.number().integer().min(1).required(),
  schedule: Joi.array().items(
    Joi.object({
      day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
      time: Joi.string().pattern(/^\d{2}:\d{2}-\d{2}:\d{2}$/).required(),
      room: Joi.string().required().trim(),
    })
  ).min(1).required(),
  description: Joi.string().trim().optional(),
  prerequisites: Joi.array().items(Joi.string().trim()).optional(),
});

const updateCourseSchema = Joi.object({
  code: Joi.string().uppercase().trim().optional(),
  name: Joi.string().trim().optional(),
  department: Joi.string().trim().optional(),
  semesterId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  credits: Joi.number().integer().min(1).max(6).optional(),
  type: Joi.string().valid('core', 'elective', 'lab', 'project').optional(),
  instructor: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().lowercase().trim().optional(),
  }).optional(),
  maxCapacity: Joi.number().integer().min(1).optional(),
  schedule: Joi.array().items(
    Joi.object({
      day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
      time: Joi.string().pattern(/^\d{2}:\d{2}-\d{2}:\d{2}$/).required(),
      room: Joi.string().required().trim(),
    })
  ).min(1).optional(),
  description: Joi.string().trim().optional(),
  prerequisites: Joi.array().items(Joi.string().trim()).optional(),
  status: Joi.string().valid('active', 'inactive', 'completed', 'upcoming').optional(),
});

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Private (Admin)
 */
exports.getAllCourses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      semester,
      status,
      search,
      sortBy = 'code',
      sortOrder = 'asc'
    } = req.query;

    const query = {};

    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { 'instructor.name': { $regex: search, $options: 'i' } },
        { 'instructor.email': { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const courses = await Course.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('semesterId', 'name year semesterNumber')
      .exec();

    const total = await Course.countDocuments(query);

    const response = {
      success: true,
      message: 'Courses retrieved successfully',
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCourses: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get all courses error:', error);
    next(error);
  }
};

/**
 * @desc    Get single course
 * @route   GET /api/courses/:id
 * @access  Private (Admin)
 */
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      const response = {
        success: false,
        message: 'Course not found',
      };
      return res.status(404).json(response);
    }

    const response = {
      success: true,
      message: 'Course retrieved successfully',
      data: { course },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get course error:', error);
    next(error);
  }
};

/**
 * @desc    Create new course
 * @route   POST /api/courses
 * @access  Private (Admin)
 */
exports.createCourse = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = courseSchema.validate(req.body);
    if (error) {
      const response = {
        success: false,
        message: error.details[0].message,
      };
      return res.status(400).json(response);
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: value.code });
    if (existingCourse) {
      const response = {
        success: false,
        message: 'Course code already exists',
      };
      return res.status(400).json(response);
    }

    // Create course
    const course = await Course.create(value);

    logger.info(`Course created: ${course.code}`);

    const response = {
      success: true,
      message: 'Course created successfully',
      data: { course },
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Create course error:', error);
    next(error);
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private (Admin)
 */
exports.updateCourse = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = updateCourseSchema.validate(req.body);
    if (error) {
      const response = {
        success: false,
        message: error.details[0].message,
      };
      return res.status(400).json(response);
    }

    // If code is being updated, check for conflicts
    if (value.code) {
      const existingCourse = await Course.findOne({
        code: value.code,
        _id: { $ne: req.params.id }
      });
      if (existingCourse) {
        const response = {
          success: false,
          message: 'Course code already exists',
        };
        return res.status(400).json(response);
      }
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    if (!course) {
      const response = {
        success: false,
        message: 'Course not found',
      };
      return res.status(404).json(response);
    }

    logger.info(`Course updated: ${course.code}`);

    const response = {
      success: true,
      message: 'Course updated successfully',
      data: { course },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Update course error:', error);
    next(error);
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private (Admin)
 */
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      const response = {
        success: false,
        message: 'Course not found',
      };
      return res.status(404).json(response);
    }

    logger.info(`Course deleted: ${course.code}`);

    const response = {
      success: true,
      message: 'Course deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Delete course error:', error);
    next(error);
  }
};

/**
 * @desc    Get course statistics
 * @route   GET /api/courses/stats
 * @access  Private (Admin)
 */
exports.getCourseStats = async (req, res, next) => {
  try {
    const stats = await Course.aggregate([
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          activeCourses: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalCapacity: { $sum: '$maxCapacity' },
          totalEnrolled: { $sum: '$enrolledStudents' },
          coursesByDepartment: {
            $push: '$department'
          },
          coursesByType: {
            $push: '$type'
          },
        }
      },
      {
        $project: {
          _id: 0,
          totalCourses: 1,
          activeCourses: 1,
          totalCapacity: 1,
          totalEnrolled: 1,
          utilizationRate: {
            $multiply: [
              { $divide: ['$totalEnrolled', { $max: ['$totalCapacity', 1] }] },
              100
            ]
          },
          departmentStats: {
            $reduce: {
              input: '$coursesByDepartment',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $literal: {
                      $mergeObjects: [
                        { $literal: {} },
                        {
                          $arrayToObject: [
                            [{ k: '$$this', v: 1 }]
                          ]
                        }
                      ]
                    }
                  }
                ]
              }
            }
          },
          typeStats: {
            $reduce: {
              input: '$coursesByType',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $literal: {
                      $mergeObjects: [
                        { $literal: {} },
                        {
                          $arrayToObject: [
                            [{ k: '$$this', v: 1 }]
                          ]
                        }
                      ]
                    }
                  }
                ]
              }
            }
          },
        }
      }
    ]);

    const response = {
      success: true,
      message: 'Course statistics retrieved successfully',
      data: stats[0] || {
        totalCourses: 0,
        activeCourses: 0,
        totalCapacity: 0,
        totalEnrolled: 0,
        utilizationRate: 0,
        departmentStats: {},
        typeStats: {},
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get course stats error:', error);
    next(error);
  }
};

/**
 * @desc    Get available courses for students
 * @route   GET /api/courses/available
 * @access  Private (Student)
 */
exports.getAvailableCourses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      semester,
      search,
      sortBy = 'code',
      sortOrder = 'asc'
    } = req.query;

    const studentId = req.user.id;

    // Get courses the student cannot enroll in (already enrolled or completed)
    const enrolledCourseIds = await CourseEnrollment.find({
      studentId,
      status: { $in: ['enrolled', 'completed'] }
    }).distinct('courseId');

    const query = {
      status: 'active',
      _id: { $nin: enrolledCourseIds } // Exclude already enrolled courses
    };

    if (department) query.department = department;
    if (semester) {
      // Find semester with matching semesterNumber
      const semesterDoc = await Semester.findOne({ semesterNumber: parseInt(semester) });
      if (semesterDoc) {
        query.semesterId = semesterDoc._id;
      }
    }

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { 'instructor.name': { $regex: search, $options: 'i' } },
        { 'instructor.email': { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const courses = await Course.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('semesterId', 'name year')
      .exec();

    const total = await Course.countDocuments(query);

    const response = {
      success: true,
      message: 'Available courses retrieved successfully',
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCourses: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get available courses error:', error);
    next(error);
  }
};

/**
 * @desc    Get student's enrolled courses
 * @route   GET /api/courses/my-courses
 * @access  Private (Student)
 */
exports.getMyCourses = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const enrollments = await CourseEnrollment.find({
      studentId,
      status: 'enrolled'
    }).populate('courseId');

    const courses = enrollments.map(enrollment => ({
      ...enrollment.courseId.toObject(),
      enrollmentId: enrollment._id,
      enrolledAt: enrollment.enrolledAt,
    }));

    const response = {
      success: true,
      message: 'Enrolled courses retrieved successfully',
      data: { courses },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get my courses error:', error);
    next(error);
  }
};

/**
 * @desc    Enroll in a course
 * @route   POST /api/courses/:id/enroll
 * @access  Private (Student)
 */
exports.enrollInCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user.id;

    // Check if course exists and is active
    const course = await Course.findById(courseId).populate('semesterId', 'semesterNumber');
    if (!course || course.status !== 'active') {
      const response = {
        success: false,
        message: 'Course not found or not available for enrollment',
      };
      return res.status(404).json(response);
    }

    // Check course capacity
    if (course.enrolledStudents >= course.maxCapacity) {
      const response = {
        success: false,
        message: 'Course is at full capacity',
      };
      return res.status(400).json(response);
    }

    // Check for existing enrollment
    const existingEnrollment = await CourseEnrollment.findOne({
      studentId,
      courseId
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === 'enrolled') {
        const response = {
          success: false,
          message: 'Already enrolled in this course',
        };
        return res.status(400).json(response);
      } else if (existingEnrollment.status === 'completed') {
        const response = {
          success: false,
          message: 'Course already completed. Cannot re-enroll.',
        };
        return res.status(400).json(response);
      } else if (existingEnrollment.status === 'dropped') {
        // Allow re-enrollment by updating the dropped enrollment
        // First, validate all enrollment conditions for re-enrollment

        // Check course capacity
        if (course.enrolledStudents >= course.maxCapacity) {
          const response = {
            success: false,
            message: 'Course is at full capacity',
          };
          return res.status(400).json(response);
        }

        // Check enrollment limit (max 4 courses per semester)
        const enrolledCourses = await CourseEnrollment.find({
          studentId,
          status: 'enrolled'
        }).populate('courseId', 'semester');

        const semesterEnrollments = enrolledCourses.filter(enrollment =>
          enrollment.courseId && enrollment.courseId.semesterId && enrollment.courseId.semesterId.semesterNumber === course.semesterId.semesterNumber
        );

        if (semesterEnrollments.length >= 4) {
          const response = {
            success: false,
            message: `Maximum enrollment limit reached for semester ${course.semester} (4 courses)`,
          };
          return res.status(400).json(response);
        }

        // Check credit limit (max 24 credits per semester)
        const totalCredits = semesterEnrollments.reduce((sum, enrollment) =>
          sum + (enrollment.courseId?.credits || 0), 0
        ) + course.credits;

        if (totalCredits > 24) {
          const response = {
            success: false,
            message: `Credit limit exceeded for semester ${course.semesterId.semesterNumber} (max 24 credits)`,
          };
          return res.status(400).json(response);
        }

        // Update the enrollment
        existingEnrollment.status = 'enrolled';
        existingEnrollment.enrolledAt = new Date();
        existingEnrollment.droppedAt = undefined; // Clear drop date
        await existingEnrollment.save();

        // Update course enrolled students count
        await Course.findByIdAndUpdate(courseId, {
          $inc: { enrolledStudents: 1 }
        });

        logger.info(`Student ${studentId} re-enrolled in course ${course.code}`);

        // Send notification
        try {
          const student = await User.findById(studentId);
          if (student) {
            const notification = new Notification({
              userId: studentId,
              title: 'Course Re-enrollment Successful',
              message: `You have successfully re-enrolled in ${course.name} (${course.code}). The course starts on ${new Date(course.startDate || course.createdAt).toLocaleDateString()}.`,
              type: 'success',
              category: 'exam',
              priority: 'medium',
              actionUrl: '/student/academics',
              actionText: 'View Course',
              data: {
                courseId: course._id,
                courseCode: course.code,
                courseName: course.name,
                enrollmentId: existingEnrollment._id,
                semester: course.semester,
              },
              createdBy: null,
            });

            const savedNotification = await notification.save();

            if (global.io) {
              global.io.to(`user_${studentId}`).emit('notification', {
                id: savedNotification._id,
                title: savedNotification.title,
                message: savedNotification.message,
                type: savedNotification.type,
                category: savedNotification.category,
                priority: savedNotification.priority,
                actionUrl: savedNotification.actionUrl,
                actionText: savedNotification.actionText,
                data: savedNotification.data,
                createdAt: savedNotification.createdAt,
              });
            }
          }
        } catch (notificationError) {
          logger.error('Error sending re-enrollment notification:', notificationError);
        }

        const response = {
          success: true,
          message: 'Successfully re-enrolled in course',
          data: { enrollment: existingEnrollment },
        };

        return res.status(200).json(response);
      }
    }

    // Check prerequisites
    if (course.prerequisites && course.prerequisites.length > 0) {
      const completedCourses = await CourseEnrollment.find({
        studentId,
        status: 'completed'
      }).populate('courseId', 'code name');

      const prerequisitesMet = course.prerequisites.every(prereq => {
        return completedCourses.some(enrollment =>
          enrollment.courseId.code === prereq.courseCode
        );
      });

      if (!prerequisitesMet) {
        const response = {
          success: false,
          message: 'Prerequisites not met for this course',
        };
        return res.status(400).json(response);
      }
    }

    // Check enrollment limit (max 4 courses per semester)
    const enrolledCourses = await CourseEnrollment.find({
      studentId,
      status: 'enrolled'
    }).populate('courseId', 'semester');

    const semesterEnrollments = enrolledCourses.filter(enrollment =>
      enrollment.courseId && enrollment.courseId.semesterId && enrollment.courseId.semesterId.semesterNumber === course.semesterId.semesterNumber
    );

    if (semesterEnrollments.length >= 4) {
      const response = {
        success: false,
        message: `Maximum enrollment limit reached for semester ${course.semesterId.semesterNumber} (4 courses)`,
      };
      return res.status(400).json(response);
    }

    // Check credit limit (max 24 credits per semester)
    const totalCredits = semesterEnrollments.reduce((sum, enrollment) =>
      sum + (enrollment.courseId?.credits || 0), 0
    ) + course.credits;

    if (totalCredits > 24) {
      const response = {
        success: false,
        message: `Credit limit exceeded for semester ${course.semester} (max 24 credits)`,
      };
      return res.status(400).json(response);
    }

    // Create enrollment
    const enrollment = await CourseEnrollment.create({
      studentId,
      courseId,
      status: 'enrolled',
    });

    // Update course enrolled students count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledStudents: 1 }
    });

    logger.info(`Student ${studentId} enrolled in course ${course.code}`);

    // Send notification to the student about successful enrollment
    try {
      const student = await User.findById(studentId);
      if (student) {
        const notification = new Notification({
          userId: studentId,
          title: 'Course Enrollment Successful',
          message: `You have successfully enrolled in ${course.name} (${course.code}). The course starts on ${new Date(course.startDate || course.createdAt).toLocaleDateString()}.`,
          type: 'success',
          category: 'academic',
          priority: 'medium',
          actionUrl: '/student/academics',
          actionText: 'View Course',
          data: {
            courseId: course._id,
            courseCode: course.code,
            courseName: course.name,
            enrollmentId: enrollment._id,
            semester: course.semester,
          },
          createdBy: null, // System generated
        });

        const savedNotification = await notification.save();

        // Emit real-time notification via Socket.IO
        if (global.io) {
          global.io.to(`user_${studentId}`).emit('notification', {
            id: savedNotification._id,
            title: savedNotification.title,
            message: savedNotification.message,
            type: savedNotification.type,
            category: savedNotification.category,
            priority: savedNotification.priority,
            actionUrl: savedNotification.actionUrl,
            actionText: savedNotification.actionText,
            data: savedNotification.data,
            createdAt: savedNotification.createdAt,
          });
        }
      }
    } catch (notificationError) {
      logger.error('Error sending enrollment notification:', notificationError);
      // Don't fail enrollment if notification fails
    }

    const response = {
      success: true,
      message: 'Successfully enrolled in course',
      data: { enrollment },
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Enroll in course error:', error);
    next(error);
  }
};

/**
 * @desc    Drop a course
 * @route   DELETE /api/courses/:id/drop
 * @access  Private (Student)
 */
exports.dropCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user.id;

    logger.info(`Drop course attempt: studentId=${studentId}, courseId=${courseId}`);

    // Find the enrollment
    const enrollment = await CourseEnrollment.findOne({ studentId, courseId, status: 'enrolled' });

    if (!enrollment) {
      logger.warn(`Drop course failed: No enrolled enrollment found for studentId=${studentId}, courseId=${courseId}`);
      const response = {
        success: false,
        message: 'Enrollment not found or already dropped',
      };
      return res.status(404).json(response);
    }

    // Check drop period (within 14 days of enrollment)
    const dropDeadline = new Date(enrollment.enrolledAt.getTime() + (14 * 24 * 60 * 60 * 1000));
    const now = new Date();

    if (now > dropDeadline) {
      logger.warn(`Drop course failed: Drop period expired for studentId=${studentId}, courseId=${courseId}, enrolledAt=${enrollment.enrolledAt}, deadline=${dropDeadline}`);
      const response = {
        success: false,
        message: 'Drop period has expired. Courses can only be dropped within 14 days of enrollment.',
      };
      return res.status(400).json(response);
    }

    // Update enrollment status
    enrollment.status = 'dropped';
    enrollment.droppedAt = new Date();
    await enrollment.save();

    // Update course enrolled students count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledStudents: -1 }
    });

    logger.info(`Student ${studentId} dropped course ${courseId}`);

    const response = {
      success: true,
      message: 'Successfully dropped course',
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Drop course error:', error);
    next(error);
  }
};

/**
 * @desc    Check prerequisite validation for course enrollment
 * @route   POST /api/courses/:id/check-prerequisites
 * @access  Private (Student)
 */
exports.checkPrerequisites = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.prerequisites || course.prerequisites.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No prerequisites required',
        data: { canEnroll: true, prerequisites: [] }
      });
    }

    // Get student's completed courses and grades
    const completedCourses = await CourseEnrollment.find({
      studentId,
      status: 'completed'
    }).populate('courseId', 'code name');

    const prerequisiteStatus = await Promise.all(
      course.prerequisites.map(async (prereq) => {
        const completedCourse = completedCourses.find(
          enrollment => enrollment.courseId.code === prereq.courseCode
        );

        if (!completedCourse) {
          return {
            courseCode: prereq.courseCode,
            courseName: prereq.courseName,
            requiredGrade: prereq.minGrade,
            status: 'not_completed',
            message: 'Course not completed'
          };
        }

        // Check grade if required
        if (prereq.minGrade && prereq.minGrade !== 'F') {
          // This would need to be implemented with grade checking
          // For now, assume prerequisites are met if course is completed
        }

        return {
          courseCode: prereq.courseCode,
          courseName: prereq.courseName,
          requiredGrade: prereq.minGrade,
          status: 'completed',
          message: 'Prerequisite satisfied'
        };
      })
    );

    const canEnroll = prerequisiteStatus.every(p => p.status === 'completed');

    res.status(200).json({
      success: true,
      message: canEnroll ? 'Prerequisites satisfied' : 'Prerequisites not met',
      data: {
        canEnroll,
        prerequisites: prerequisiteStatus
      }
    });
  } catch (error) {
    logger.error('Check prerequisites error:', error);
    next(error);
  }
};

/**
 * @desc    Generate QR code for attendance
 * @route   POST /api/courses/:id/generate-qr
 * @access  Private (Faculty/Admin)
 */
exports.generateAttendanceQR = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const { date, sessionType = 'lecture' } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && course.instructor.id?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to generate QR for this course'
      });
    }

    const qrData = {
      courseId,
      courseCode: course.code,
      date: date || new Date().toISOString().split('T')[0],
      sessionType,
      timestamp: Date.now(),
      expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
    };

    const qrString = JSON.stringify(qrData);
    const qrCode = await generateQRCode(qrString);

    // Update course schedule with QR code
    const scheduleIndex = course.schedule.findIndex(s =>
      s.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })
    );

    if (scheduleIndex !== -1) {
      course.schedule[scheduleIndex].qrCode = qrCode;
      await course.save();
    }

    res.status(200).json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        qrCode,
        qrData,
        expiresIn: '15 minutes'
      }
    });
  } catch (error) {
    logger.error('Generate QR error:', error);
    next(error);
  }
};

/**
 * @desc    Mark attendance using QR code
 * @route   POST /api/courses/mark-attendance
 * @access  Private (Student)
 */
exports.markAttendance = async (req, res, next) => {
  try {
    const { qrData, location } = req.body;
    const studentId = req.user.id;

    let qrPayload;
    try {
      qrPayload = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data'
      });
    }

    // Check if QR code is expired
    if (qrPayload.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'QR code has expired'
      });
    }

    // Check if student is enrolled in the course
    const enrollment = await CourseEnrollment.findOne({
      studentId,
      courseId: qrPayload.courseId,
      status: 'enrolled'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Check if attendance already marked for today
    const today = new Date(qrPayload.date);
    const existingAttendance = await Attendance.findOne({
      courseId: qrPayload.courseId,
      studentId,
      date: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for today'
      });
    }

    // Mark attendance
    const attendance = await Attendance.create({
      courseId: qrPayload.courseId,
      studentId,
      date: today,
      status: 'present',
      markedBy: 'qr',
      qrCode: qrData,
      location,
      deviceInfo: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: { attendance }
    });
  } catch (error) {
    logger.error('Mark attendance error:', error);
    next(error);
  }
};

/**
 * @desc    Get course attendance
 * @route   GET /api/courses/:id/attendance
 * @access  Private (Faculty/Admin/Student)
 */
exports.getCourseAttendance = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const { date, studentId } = req.query;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check permissions
    const isInstructor = course.instructor.id?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isEnrolledStudent = req.user.role === 'student' && studentId === req.user.id;

    if (!isInstructor && !isAdmin && !isEnrolledStudent) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view attendance'
      });
    }

    const query = { courseId };

    if (date) {
      const attendanceDate = new Date(date);
      query.date = {
        $gte: new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate()),
        $lt: new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate() + 1)
      };
    }

    if (studentId && (isAdmin || isInstructor)) {
      query.studentId = studentId;
    } else if (req.user.role === 'student') {
      query.studentId = req.user.id;
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name email studentId')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: 'Attendance retrieved successfully',
      data: { attendance }
    });
  } catch (error) {
    logger.error('Get attendance error:', error);
    next(error);
  }
};

/**
 * @desc    Upload course material
 * @route   POST /api/courses/:id/materials
 * @access  Private (Faculty/Admin)
 */
exports.uploadCourseMaterial = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const { title, type, url, description } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && course.instructor.id?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload materials for this course'
      });
    }

    const material = {
      title,
      type,
      url,
      uploadedBy: req.user.id,
      version: 1,
      isActive: true,
      uploadedAt: new Date()
    };

    if (description) material.description = description;

    course.courseMaterials.push(material);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course material uploaded successfully',
      data: { material: course.courseMaterials[course.courseMaterials.length - 1] }
    });
  } catch (error) {
    logger.error('Upload material error:', error);
    next(error);
  }
};

/**
 * @desc    Get course materials
 * @route   GET /api/courses/:id/materials
 * @access  Private (Enrolled Students/Faculty)
 */
exports.getCourseMaterials = async (req, res, next) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled or is the instructor/admin
    let canAccess = req.user.role === 'admin' ||
                   course.instructor.id?.toString() === req.user.id;

    if (!canAccess && req.user.role === 'student') {
      const enrollment = await CourseEnrollment.findOne({
        studentId: req.user.id,
        courseId,
        status: 'enrolled'
      });
      canAccess = !!enrollment;
    }

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access course materials'
      });
    }

    const materials = course.courseMaterials.filter(m => m.isActive);

    res.status(200).json({
      success: true,
      message: 'Course materials retrieved successfully',
      data: { materials }
    });
  } catch (error) {
    logger.error('Get materials error:', error);
    next(error);
  }
};

/**
 * @desc    Update course material version
 * @route   PUT /api/courses/:id/materials/:materialId
 * @access  Private (Faculty/Admin)
 */
exports.updateCourseMaterial = async (req, res, next) => {
  try {
    const { courseId, materialId } = req.params;
    const { url, changes } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const material = course.courseMaterials.id(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && course.instructor.id?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update materials'
      });
    }

    // Add to version history
    material.versionHistory.push({
      version: material.version,
      url: material.url,
      uploadedBy: material.uploadedBy,
      uploadedAt: material.uploadedAt,
      changes: changes || 'Updated material'
    });

    // Update material
    material.url = url;
    material.version += 1;
    material.uploadedBy = req.user.id;
    material.uploadedAt = new Date();

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course material updated successfully',
      data: { material }
    });
  } catch (error) {
    logger.error('Update material error:', error);
    next(error);
  }
};