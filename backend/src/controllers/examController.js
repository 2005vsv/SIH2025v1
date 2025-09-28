const Joi = require('joi');
const { logger } = require('../config/logger');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const Course = require('../models/Course');
const Semester = require('../models/Semester');
const CourseEnrollment = require('../models/CourseEnrollment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateQRCode } = require('../utils/helpers');

// Validation schemas
const examSchema = Joi.object({
  courseId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  semesterNumber: Joi.alternatives().try(
    Joi.number().integer().min(1).max(8),
    Joi.string().pattern(/^[1-8]$/)
  ).required(),
  title: Joi.string().required().trim(),
  examType: Joi.string().valid('midterm', 'final', 'quiz', 'practical', 'viva', 'project').required(),
  examDate: Joi.date().required(),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  duration: Joi.number().integer().min(30).max(480).required(),
  room: Joi.string().required().trim(),
  building: Joi.string().trim().optional(),
  seatAllocation: Joi.string().valid('random', 'roll_number', 'alphabetical').default('roll_number'),
  instructions: Joi.string().trim().optional(),
  syllabus: Joi.string().trim().optional(),
  maxMarks: Joi.number().integer().min(1).required(),
  passingMarks: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid('scheduled', 'ongoing', 'completed', 'cancelled', 'postponed').default('scheduled'),
  invigilators: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required().lowercase().trim(),
    })
  ).optional(),
});

const updateExamSchema = Joi.object({
  examType: Joi.string().valid('midterm', 'final', 'quiz', 'practical', 'viva', 'project').optional(),
  examDate: Joi.date().optional(),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  duration: Joi.number().integer().min(30).max(480).optional(),
  room: Joi.string().trim().optional(),
  building: Joi.string().trim().optional(),
  seatAllocation: Joi.string().valid('random', 'roll_number', 'alphabetical').optional(),
  instructions: Joi.string().trim().optional(),
  syllabus: Joi.string().trim().optional(),
  maxMarks: Joi.number().integer().min(1).optional(),
  passingMarks: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid('scheduled', 'ongoing', 'completed', 'cancelled', 'postponed').optional(),
  invigilators: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required().lowercase().trim(),
    })
  ).optional(),
});

/**
 * @desc    Get all exams
 * @route   GET /api/exams
 * @access  Private (Admin/Student)
 */
exports.getAllExams = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      courseId,
      semesterId,
      semesterNumber,
      examType,
      status,
      startDate,
      endDate,
      search,
      sortBy = 'examDate',
      sortOrder = 'asc'
    } = req.query;

    const query = {};

    if (courseId) query.courseId = courseId;
    if (semesterId) query.semesterId = semesterId;
    if (semesterNumber) query.semesterNumber = parseInt(semesterNumber);
    if (examType) query.examType = examType;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.examDate = {};
      if (startDate) query.examDate.$gte = new Date(startDate);
      if (endDate) query.examDate.$lte = new Date(endDate);
    }

    if (search) {
      const courses = await Course.find({
        $or: [
          { code: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
        ]
      });
      const courseIds = courses.map(c => c._id);
      query.courseId = { $in: courseIds };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const exams = await Exam.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('courseId', 'code name credits department')
      .exec();

    const total = await Exam.countDocuments(query);

    const response = {
      success: true,
      message: 'Exams retrieved successfully',
      data: {
        exams,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalExams: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get all exams error:', error);
    next(error);
  }
};

/**
 * @desc    Get single exam
 * @route   GET /api/exams/:id
 * @access  Private (Admin/Student)
 */
exports.getExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('courseId', 'code name credits department instructor');

    if (!exam) {
      const response = {
        success: false,
        message: 'Exam not found',
      };
      return res.status(404).json(response);
    }

    const response = {
      success: true,
      message: 'Exam retrieved successfully',
      data: { exam },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get exam error:', error);
    next(error);
  }
};

/**
 * @desc    Create new exam
 * @route   POST /api/exams
 * @access  Private (Admin)
 */
exports.createExam = async (req, res, next) => {
  try {
    console.log('Exam creation request body:', req.body);

    // Validate request body
    const { error, value } = examSchema.validate(req.body);
    if (error) {
      console.log('Exam validation error:', error.details[0].message);
      const response = {
        success: false,
        message: error.details[0].message,
      };
      return res.status(400).json(response);
    }

    console.log('Validated exam data:', value);

    // Verify course exists
    const course = await Course.findById(value.courseId);

    if (!course) {
      const response = { success: false, message: 'Course not found' };
      return res.status(404).json(response);
    }

    // Check for duplicate exam title in the same course and semester
    const existingExam = await Exam.findOne({
      courseId: value.courseId,
      semesterNumber: value.semesterNumber,
      title: value.title
    });

    if (existingExam) {
      const response = {
        success: false,
        message: 'An exam with this title already exists for the selected course and semester',
      };
      return res.status(400).json(response);
    }

    // Check for time conflicts
    const conflictingExams = await Exam.findConflicts({
      examDate: value.examDate,
      startTime: value.startTime,
      endTime: value.endTime,
      room: value.room,
    });

    if (conflictingExams.length > 0) {
      const response = {
        success: false,
        message: 'Time conflict detected with existing exam in the same room',
        data: { conflictingExams },
      };
      return res.status(400).json(response);
    }

    // Create exam
    const exam = await Exam.create({
      ...value,
      createdBy: req.user.id,
    });

    await exam.populate('courseId', 'code name credits department');

    logger.info(`Exam created: ${exam.examType} for course ${course.code} on ${exam.examDate}`);

    // Send notifications to enrolled students
    try {
      const enrollments = await CourseEnrollment.find({
        courseId: exam.courseId,
        status: 'enrolled'
      }).populate('studentId', 'name email');

      const notifications = await Promise.all(
        enrollments.map(async (enrollment) => {
          const notification = new Notification({
            userId: enrollment.studentId._id,
            title: 'New Exam Scheduled',
            message: `${exam.examType.charAt(0).toUpperCase() + exam.examType.slice(1)} exam for ${course.name} (${course.code}) has been scheduled on ${new Date(exam.examDate).toLocaleDateString()} at ${exam.startTime}.`,
            type: 'warning',
            category: 'exam',
            priority: 'high',
            actionUrl: '/student/academics',
            actionText: 'View Exam Details',
            data: {
              examId: exam._id,
              courseId: exam.courseId,
              courseCode: course.code,
              courseName: course.name,
              examType: exam.examType,
              examDate: exam.examDate,
              startTime: exam.startTime,
              endTime: exam.endTime,
              room: exam.room,
              duration: exam.duration,
            },
            createdBy: req.user && req.user.id,
          });

          const savedNotification = await notification.save();

          // Emit real-time notification via Socket.IO
          if (global.io) {
            global.io.to(`user_${enrollment.studentId._id}`).emit('notification', {
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

          return savedNotification;
        })
      );

      logger.info(`Sent exam notifications to ${notifications.length} students`);
    } catch (notificationError) {
      logger.error('Error sending exam notifications:', notificationError);
      // Don't fail exam creation if notifications fail
    }

    const response = {
      success: true,
      message: 'Exam created successfully',
      data: { exam },
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Create exam error:', error);
    next(error);
  }
};

/**
 * @desc    Update exam
 * @route   PUT /api/exams/:id
 * @access  Private (Admin)
 */
exports.updateExam = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = updateExamSchema.validate(req.body);
    if (error) {
      const response = {
        success: false,
        message: error.details[0].message,
      };
      return res.status(400).json(response);
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      const response = {
        success: false,
        message: 'Exam not found',
      };
      return res.status(404).json(response);
    }

    // Check for time conflicts if time/room is being updated
    if (value.examDate || value.startTime || value.endTime || value.room) {
      const conflictingExams = await Exam.findConflicts({
        examDate: value.examDate || exam.examDate,
        startTime: value.startTime || exam.startTime,
        endTime: value.endTime || exam.endTime,
        room: value.room || exam.room,
        excludeId: req.params.id,
      });

      if (conflictingExams.length > 0) {
        const response = {
          success: false,
          message: 'Time conflict detected with existing exam in the same room',
          data: { conflictingExams },
        };
        return res.status(400).json(response);
      }
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    )
      .populate('courseId', 'code name credits department');

    logger.info(`Exam updated: ${updatedExam._id}`);

    // Send notifications to enrolled students about exam updates
    try {
      const enrollments = await CourseEnrollment.find({
        courseId: updatedExam.courseId,
        status: 'enrolled'
      }).populate('studentId', 'name email');

      const notifications = await Promise.all(
        enrollments.map(async (enrollment) => {
          const notification = new Notification({
            userId: enrollment.studentId._id,
            title: 'Exam Schedule Updated',
            message: `The ${updatedExam.examType} exam for ${course.name} (${course.code}) has been updated. New schedule: ${new Date(updatedExam.examDate).toLocaleDateString()} at ${updatedExam.startTime}.`,
            type: 'warning',
            category: 'exam',
            priority: 'high',
            actionUrl: '/student/academics',
            actionText: 'View Updated Exam',
            data: {
              examId: updatedExam._id,
              courseId: updatedExam.courseId,
              courseCode: course.code,
              courseName: course.name,
              examType: updatedExam.examType,
              examDate: updatedExam.examDate,
              startTime: updatedExam.startTime,
              endTime: updatedExam.endTime,
              room: updatedExam.room,
              duration: updatedExam.duration,
            },
            createdBy: req.user && req.user.id,
          });

          const savedNotification = await notification.save();

          // Emit real-time notification via Socket.IO
          if (global.io) {
            global.io.to(`user_${enrollment.studentId._id}`).emit('notification', {
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

          return savedNotification;
        })
      );

      logger.info(`Sent exam update notifications to ${notifications.length} students`);
    } catch (notificationError) {
      logger.error('Error sending exam update notifications:', notificationError);
      // Don't fail exam update if notifications fail
    }

    const response = {
      success: true,
      message: 'Exam updated successfully',
      data: { exam: updatedExam },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Update exam error:', error);
    next(error);
  }
};

/**
 * @desc    Delete exam
 * @route   DELETE /api/exams/:id
 * @access  Private (Admin)
 */
exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);

    if (!exam) {
      const response = {
        success: false,
        message: 'Exam not found',
      };
      return res.status(404).json(response);
    }

    logger.info(`Exam deleted: ${exam._id}`);

    // Send notifications to enrolled students about exam cancellation
    try {
      const enrollments = await CourseEnrollment.find({
        courseId: exam.courseId,
        status: 'enrolled'
      }).populate('studentId', 'name email');

      const notifications = await Promise.all(
        enrollments.map(async (enrollment) => {
          const notification = new Notification({
            userId: enrollment.studentId._id,
            title: 'Exam Cancelled',
            message: `The ${exam.examType} exam for ${exam.courseId?.name || 'Unknown Course'} (${exam.courseId?.code || 'N/A'}) scheduled on ${new Date(exam.examDate).toLocaleDateString()} has been cancelled.`,
            type: 'error',
            category: 'exam',
            priority: 'high',
            actionUrl: '/student/academics',
            actionText: 'View Timetable',
            data: {
              examId: exam._id,
              courseId: exam.courseId,
              courseCode: exam.courseId?.code,
              courseName: exam.courseId?.name,
              examType: exam.examType,
              examDate: exam.examDate,
              reason: 'Exam cancelled by administrator',
            },
            createdBy: req.user && req.user.id,
          });

          const savedNotification = await notification.save();

          // Emit real-time notification via Socket.IO
          if (global.io) {
            global.io.to(`user_${enrollment.studentId._id}`).emit('notification', {
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

          return savedNotification;
        })
      );

      logger.info(`Sent exam cancellation notifications to ${notifications.length} students`);
    } catch (notificationError) {
      logger.error('Error sending exam cancellation notifications:', notificationError);
      // Don't fail exam deletion if notifications fail
    }

    const response = {
      success: true,
      message: 'Exam deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Delete exam error:', error);
    next(error);
  }
};

/**
 * @desc    Get student's exam timetable
 * @route   GET /api/exams/my-timetable
 * @access  Private (Student)
 */
exports.getMyTimetable = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { semesterId, semesterNumber } = req.query;

    // For testing, return all exams for the semester
    const query = {
      status: { $in: ['scheduled', 'ongoing'] },
    };

    // Add semester filter if specified
    if (semesterNumber) {
      query.semesterNumber = parseInt(semesterNumber);
    }

    const exams = await Exam.find(query)
      .populate('courseId', 'code name credits department semester')
      .sort({ examDate: 1, startTime: 1 });

    const response = {
      success: true,
      message: 'Exam timetable retrieved successfully',
      data: {
        exams,
        totalExams: exams.length,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get my timetable error:', error);
    next(error);
  }
};

/**
 * @desc    Get exam statistics
 * @route   GET /api/exams/stats
 * @access  Private (Admin)
 */
exports.getExamStats = async (req, res, next) => {
  try {
    const { semesterId, courseId } = req.query;

    const matchStage = {};
    if (semesterNumber) matchStage.semesterNumber = parseInt(semesterNumber);
    if (courseId) matchStage.courseId = require('mongoose').Types.ObjectId(courseId);

    const stats = await Exam.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: null,
          totalExams: { $sum: 1 },
          scheduledExams: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          ongoingExams: {
            $sum: { $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0] }
          },
          completedExams: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledExams: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          examsByType: {
            $push: '$examType',
          },
          upcomingExams: {
            $push: {
              $cond: [
                { $gte: ['$examDate', new Date()] },
                {
                  examDate: '$examDate',
                  courseId: '$courseId',
                  examType: '$examType',
                },
                null,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalExams: 1,
          scheduledExams: 1,
          ongoingExams: 1,
          completedExams: 1,
          cancelledExams: 1,
          typeDistribution: {
            $reduce: {
              input: '$examsByType',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  { [Object.keys('$$this')[0]]: { $add: [{ $ifNull: ['$$value.$$this', 0] }, 1] } }
                ]
              }
            }
          },
          upcomingExams: {
            $filter: {
              input: '$upcomingExams',
              as: 'exam',
              cond: { $ne: ['$$exam', null] },
            },
          },
        },
      },
    ]);

    const response = {
      success: true,
      message: 'Exam statistics retrieved successfully',
      data: stats[0] || {
        totalExams: 0,
        scheduledExams: 0,
        ongoingExams: 0,
        completedExams: 0,
        cancelledExams: 0,
        typeDistribution: {},
        upcomingExams: [],
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get exam stats error:', error);
    next(error);
  }
};

/**
 * @desc    Bulk create exams
 * @route   POST /api/exams/bulk
 * @access  Private (Admin)
 */
exports.bulkCreateExams = async (req, res, next) => {
  try {
    const { exams } = req.body;

    if (!Array.isArray(exams) || exams.length === 0) {
      const response = {
        success: false,
        message: 'Exams array is required',
      };
      return res.status(400).json(response);
    }

    const results = [];
    const errors = [];

    for (const examData of exams) {
      try {
        // Validate each exam
        const { error, value } = examSchema.validate(examData);
        if (error) {
          errors.push({
            data: examData,
            error: error.details[0].message,
          });
          continue;
        }

        // Check for conflicts
        const conflictingExams = await Exam.findConflicts({
          examDate: value.examDate,
          startTime: value.startTime,
          endTime: value.endTime,
          room: value.room,
        });

        if (conflictingExams.length > 0) {
          errors.push({
            data: examData,
            error: 'Time conflict detected',
          });
          continue;
        }

        // Generate unique exam code
        value.code = 'EXAM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
        // Create exam
        const exam = await Exam.create({
          ...value,
          createdBy: req.user.id,
        });

        results.push(exam);
      } catch (error) {
        errors.push({
          data: examData,
          error: error.message,
        });
      }
    }

    const response = {
      success: true,
      message: `Bulk operation completed. ${results.length} successful, ${errors.length} failed`,
      data: {
        results,
        errors,
        summary: {
          created: results.length,
          failed: errors.length,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Bulk create exams error:', error);
    next(error);
  }
};

/**
 * @desc    Start online exam
 * @route   POST /api/exams/:id/start
 * @access  Private (Student)
 */
exports.startOnlineExam = async (req, res, next) => {
  try {
    const examId = req.params.id;
    const studentId = req.user.id;
    const { browserInfo } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    if (!exam.isOnline) {
      return res.status(400).json({
        success: false,
        message: 'This is not an online exam',
      });
    }

    // Check if exam is scheduled and within time window
    const now = new Date();
    const examDate = new Date(exam.examDate);
    const startTime = exam.startTime.split(':').map(Number);
    const endTime = exam.endTime.split(':').map(Number);

    const examStart = new Date(examDate);
    examStart.setHours(startTime[0], startTime[1], 0, 0);

    const examEnd = new Date(examDate);
    examEnd.setHours(endTime[0], endTime[1], 0, 0);

    if (now < examStart) {
      return res.status(400).json({
        success: false,
        message: 'Exam has not started yet',
      });
    }

    if (now > examEnd) {
      return res.status(400).json({
        success: false,
        message: 'Exam has ended',
      });
    }

    // Check enrollment
    const enrollment = await CourseEnrollment.findOne({
      studentId,
      courseId: exam.courseId,
      status: 'enrolled'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    // Check if student already has a result
    let examResult = await ExamResult.findOne({
      examId,
      studentId,
    });

    if (!examResult) {
      // Create new exam result
      examResult = await ExamResult.create({
        examId,
        studentId,
        courseId: exam.courseId,
        semesterId: exam.semesterId,
        startedAt: now,
        status: 'in_progress',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        browserInfo,
      });
    } else if (examResult.status === 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Exam already submitted',
      });
    }

    // Shuffle questions if enabled
    let questions = [...exam.questions];
    if (exam.settings.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    // Remove correct answers for student view
    const studentQuestions = questions.map(q => ({
      questionNumber: q.questionNumber,
      questionType: q.questionType,
      question: q.question,
      options: exam.settings.shuffleOptions ? q.options.sort(() => Math.random() - 0.5) : q.options,
      marks: q.marks,
      topic: q.topic,
    }));

    res.status(200).json({
      success: true,
      message: 'Exam started successfully',
      data: {
        exam: {
          id: exam._id,
          title: exam.title,
          duration: exam.duration,
          instructions: exam.instructions,
          settings: exam.settings,
          proctoring: exam.proctoring,
        },
        questions: studentQuestions,
        timeRemaining: Math.max(0, Math.floor((examEnd - now) / 1000 / 60)), // in minutes
        startedAt: examResult.startedAt,
      },
    });
  } catch (error) {
    logger.error('Start online exam error:', error);
    next(error);
  }
};

/**
 * @desc    Submit online exam
 * @route   POST /api/exams/:id/submit
 * @access  Private (Student)
 */
exports.submitOnlineExam = async (req, res, next) => {
  try {
    const examId = req.params.id;
    const studentId = req.user.id;
    const { answers, proctoringData } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    let examResult = await ExamResult.findOne({
      examId,
      studentId,
    });

    if (!examResult || examResult.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'No active exam session found',
      });
    }

    const submittedAt = new Date();
    const timeSpent = Math.floor((submittedAt - examResult.startedAt) / 1000 / 60); // in minutes

    // Process answers and calculate marks
    let totalMarks = 0;
    const processedAnswers = answers.map(answer => {
      const question = exam.questions.find(q => q.questionNumber === answer.questionId);
      if (!question) return answer;

      let isCorrect = false;
      let marksAwarded = 0;

      if (question.questionType === 'multiple_choice') {
        isCorrect = answer.answer === question.correctAnswer;
        marksAwarded = isCorrect ? question.marks : 0;
      } else if (question.questionType === 'true_false') {
        isCorrect = answer.answer === question.correctAnswer;
        marksAwarded = isCorrect ? question.marks : 0;
      } else {
        // For essay/short answer, manual grading required
        marksAwarded = 0;
      }

      totalMarks += marksAwarded;

      return {
        ...answer,
        isCorrect,
        marksAwarded,
        answeredAt: submittedAt,
      };
    });

    // Update exam result
    examResult.answers = processedAnswers;
    examResult.marksObtained = totalMarks;
    examResult.maxMarks = exam.maxMarks;
    examResult.submittedAt = submittedAt;
    examResult.timeSpent = timeSpent;
    examResult.status = 'submitted';

    if (proctoringData) {
      examResult.proctoringData = {
        ...examResult.proctoringData,
        ...proctoringData,
      };
    }

    await examResult.save();

    res.status(200).json({
      success: true,
      message: 'Exam submitted successfully',
      data: {
        marksObtained: totalMarks,
        maxMarks: exam.maxMarks,
        timeSpent,
        submittedAt,
      },
    });
  } catch (error) {
    logger.error('Submit online exam error:', error);
    next(error);
  }
};

/**
 * @desc    Save exam progress (auto-save)
 * @route   POST /api/exams/:id/save-progress
 * @access  Private (Student)
 */
exports.saveExamProgress = async (req, res, next) => {
  try {
    const examId = req.params.id;
    const studentId = req.user.id;
    const { answers, proctoringData } = req.body;

    let examResult = await ExamResult.findOne({
      examId,
      studentId,
    });

    if (!examResult || examResult.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'No active exam session found',
      });
    }

    // Update answers with timestamps
    if (answers) {
      examResult.answers = answers.map(answer => ({
        ...answer,
        answeredAt: new Date(),
      }));
    }

    // Update proctoring data
    if (proctoringData) {
      examResult.proctoringData = {
        ...examResult.proctoringData,
        ...proctoringData,
      };
    }

    await examResult.save();

    res.status(200).json({
      success: true,
      message: 'Progress saved successfully',
    });
  } catch (error) {
    logger.error('Save exam progress error:', error);
    next(error);
  }
};

/**
 * @desc    Generate hall tickets
 * @route   POST /api/exams/:id/generate-hall-tickets
 * @access  Private (Faculty/Admin)
 */
exports.generateHallTickets = async (req, res, next) => {
  try {
    const examId = req.params.id;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to generate hall tickets',
      });
    }

    // Get enrolled students
    const enrollments = await CourseEnrollment.find({
      courseId: exam.courseId,
      status: 'enrolled'
    }).populate('studentId', 'name email studentId');

    const hallTickets = [];

    for (let i = 0; i < enrollments.length; i++) {
      const enrollment = enrollments[i];
      const hallTicketNumber = `HT${examId.slice(-6)}${String(i + 1).padStart(3, '0')}`;
      const seatNumber = exam.seatAllocation === 'roll_number' ?
        enrollment.studentId.studentId :
        `S${String(i + 1).padStart(3, '0')}`;

      // Generate QR code for hall ticket
      const qrData = {
        examId,
        studentId: enrollment.studentId._id,
        hallTicketNumber,
        timestamp: Date.now(),
      };

      const qrCode = await generateQRCode(JSON.stringify(qrData));

      hallTickets.push({
        studentId: enrollment.studentId._id,
        hallTicketNumber,
        seatNumber,
        qrCode,
        issuedAt: new Date(),
      });
    }

    // Update exam with hall tickets
    exam.hallTickets = hallTickets;
    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Hall tickets generated successfully',
      data: {
        hallTickets,
        totalTickets: hallTickets.length,
      },
    });
  } catch (error) {
    logger.error('Generate hall tickets error:', error);
    next(error);
  }
};

/**
 * @desc    Get student's hall ticket
 * @route   GET /api/exams/:id/hall-ticket
 * @access  Private (Student)
 */
exports.getHallTicket = async (req, res, next) => {
  try {
    const examId = req.params.id;
    const studentId = req.user.id;

    const exam = await Exam.findById(examId)
      .populate('courseId', 'code name');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Check enrollment
    const enrollment = await CourseEnrollment.findOne({
      studentId,
      courseId: exam.courseId,
      status: 'enrolled'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    const hallTicket = exam.hallTickets.find(
      ticket => ticket.studentId.toString() === studentId
    );

    if (!hallTicket) {
      return res.status(404).json({
        success: false,
        message: 'Hall ticket not generated yet',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hall ticket retrieved successfully',
      data: {
        exam: {
          title: exam.title,
          examType: exam.examType,
          examDate: exam.examDate,
          startTime: exam.startTime,
          endTime: exam.endTime,
          duration: exam.duration,
          room: exam.room,
          building: exam.building,
          instructions: exam.instructions,
          course: exam.courseId,
          semester: exam.semesterId,
        },
        hallTicket,
      },
    });
  } catch (error) {
    logger.error('Get hall ticket error:', error);
    next(error);
  }
};

/**
 * @desc    Get exam proctoring report
 * @route   GET /api/exams/:id/proctoring/:studentId
 * @access  Private (Faculty/Admin)
 */
exports.getProctoringReport = async (req, res, next) => {
  try {
    const { id, studentId } = req.params;

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view proctoring reports',
      });
    }

    const examResult = await ExamResult.findOne({
      examId: id,
      studentId,
    }).populate('studentId', 'name email studentId');

    if (!examResult) {
      return res.status(404).json({
        success: false,
        message: 'Exam result not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Proctoring report retrieved successfully',
      data: {
        student: examResult.studentId,
        examResult: {
          startedAt: examResult.startedAt,
          submittedAt: examResult.submittedAt,
          timeSpent: examResult.timeSpent,
          status: examResult.status,
        },
        proctoringData: examResult.proctoringData,
      },
    });
  } catch (error) {
    logger.error('Get proctoring report error:', error);
    next(error);
  }
};