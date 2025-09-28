const Joi = require('joi');
const { logger } = require('../config/logger');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Course = require('../models/Course');
const CourseEnrollment = require('../models/CourseEnrollment');
const User = require('../models/User');

// Validation schemas
const assignmentSchema = Joi.object({
  title: Joi.string().required().trim(),
  description: Joi.string().required(),
  courseId: Joi.string().required(),
  type: Joi.string().valid('homework', 'project', 'quiz', 'lab', 'presentation').default('homework'),
  content: Joi.string().required(),
  totalMarks: Joi.number().integer().min(1).required(),
  weightage: Joi.number().min(0).max(1).default(1),
  deadline: Joi.date().required(),
  gracePeriod: Joi.number().integer().min(0).default(24),
  instructions: Joi.string().trim().optional(),
  rubric: Joi.array().items(
    Joi.object({
      criteria: Joi.string().required(),
      description: Joi.string().required(),
      marks: Joi.number().min(0).required(),
    })
  ).optional(),
  settings: Joi.object({
    allowLateSubmission: Joi.boolean().default(true),
    maxFileSize: Joi.number().min(1).default(10),
    allowedFileTypes: Joi.array().items(Joi.string()).optional(),
    plagiarismCheck: Joi.boolean().default(false),
    autoGrading: Joi.boolean().default(false),
  }).optional(),
});

const submissionSchema = Joi.object({
  content: Joi.string().trim().optional(),
  attachments: Joi.array().items(
    Joi.object({
      filename: Joi.string().required(),
      originalName: Joi.string().required(),
      url: Joi.string().required(),
      size: Joi.number().required(),
      mimeType: Joi.string().required(),
    })
  ).optional(),
});

/**
 * @desc    Create new assignment
 * @route   POST /api/assignments
 * @access  Private (Faculty/Admin)
 */
exports.createAssignment = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = assignmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Check if course exists and user is the instructor
    const course = await Course.findById(value.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (req.user.role !== 'admin' && course.instructor.id?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create assignments for this course',
      });
    }

    // Create assignment
    const assignment = await Assignment.create({
      ...value,
      instructorId: req.user.id,
    });

    logger.info(`Assignment created: ${assignment.title} for course ${course.code}`);

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: { assignment },
    });
  } catch (error) {
    logger.error('Create assignment error:', error);
    next(error);
  }
};

/**
 * @desc    Get assignments for a course
 * @route   GET /api/assignments/course/:courseId
 * @access  Private (Enrolled Students/Faculty)
 */
exports.getCourseAssignments = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { status, type, page = 1, limit = 10 } = req.query;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check permissions
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
        message: 'Not authorized to access course assignments',
      });
    }

    const query = { courseId };

    if (status) query.status = status;
    if (type) query.type = type;

    const assignments = await Assignment.find(query)
      .populate('instructorId', 'name email')
      .sort({ deadline: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Assignment.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Assignments retrieved successfully',
      data: {
        assignments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalAssignments: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    logger.error('Get course assignments error:', error);
    next(error);
  }
};

/**
 * @desc    Get single assignment
 * @route   GET /api/assignments/:id
 * @access  Private (Enrolled Students/Faculty)
 */
exports.getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('courseId', 'code name department semester')
      .populate('instructorId', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check permissions
    let canAccess = req.user.role === 'admin' ||
                   assignment.instructorId._id.toString() === req.user.id;

    if (!canAccess && req.user.role === 'student') {
      const enrollment = await CourseEnrollment.findOne({
        studentId: req.user.id,
        courseId: assignment.courseId._id,
        status: 'enrolled'
      });
      canAccess = !!enrollment;
    }

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this assignment',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assignment retrieved successfully',
      data: { assignment },
    });
  } catch (error) {
    logger.error('Get assignment error:', error);
    next(error);
  }
};

/**
 * @desc    Update assignment
 * @route   PUT /api/assignments/:id
 * @access  Private (Faculty/Admin)
 */
exports.updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && assignment.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assignment',
      });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    logger.info(`Assignment updated: ${updatedAssignment.title}`);

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: { assignment: updatedAssignment },
    });
  } catch (error) {
    logger.error('Update assignment error:', error);
    next(error);
  }
};

/**
 * @desc    Publish assignment
 * @route   PATCH /api/assignments/:id/publish
 * @access  Private (Faculty/Admin)
 */
exports.publishAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && assignment.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this assignment',
      });
    }

    assignment.status = 'published';
    assignment.publishedAt = new Date();
    await assignment.save();

    logger.info(`Assignment published: ${assignment.title}`);

    res.status(200).json({
      success: true,
      message: 'Assignment published successfully',
      data: { assignment },
    });
  } catch (error) {
    logger.error('Publish assignment error:', error);
    next(error);
  }
};

/**
 * @desc    Submit assignment
 * @route   POST /api/assignments/:id/submit
 * @access  Private (Student)
 */
exports.submitAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = submissionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check if assignment is published
    if (assignment.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Assignment is not available for submission',
      });
    }

    // Check if student is enrolled
    const enrollment = await CourseEnrollment.findOne({
      studentId: req.user.id,
      courseId: assignment.courseId,
      status: 'enrolled'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course',
      });
    }

    // Check deadline and grace period
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const graceDeadline = new Date(deadline.getTime() + (assignment.gracePeriod * 60 * 60 * 1000));

    let isLate = false;
    let lateHours = 0;

    if (now > deadline) {
      if (now > graceDeadline && !assignment.settings.allowLateSubmission) {
        return res.status(400).json({
          success: false,
          message: 'Assignment submission deadline has passed',
        });
      }
      isLate = true;
      lateHours = Math.floor((now - deadline) / (1000 * 60 * 60));
    }

    // Check if submission already exists
    let submission = await AssignmentSubmission.findOne({
      assignmentId: id,
      studentId: req.user.id,
    });

    if (submission) {
      // Update existing submission
      submission.content = value.content;
      submission.attachments = value.attachments;
      submission.submittedAt = now;
      submission.isLate = isLate;
      submission.lateHours = lateHours;
      submission.status = 'submitted';
      submission.attempts += 1;

      // Add to version history
      submission.versionHistory.push({
        version: submission.attempts,
        content: value.content,
        attachments: value.attachments,
        submittedAt: now,
      });

      await submission.save();
    } else {
      // Create new submission
      submission = await AssignmentSubmission.create({
        assignmentId: id,
        studentId: req.user.id,
        courseId: assignment.courseId,
        content: value.content,
        attachments: value.attachments,
        submittedAt: now,
        isLate,
        lateHours,
        status: 'submitted',
        attempts: 1,
        versionHistory: [{
          version: 1,
          content: value.content,
          attachments: value.attachments,
          submittedAt: now,
        }],
      });

      // Update assignment submission count
      await Assignment.findByIdAndUpdate(id, { $inc: { submissionCount: 1 } });
    }

    logger.info(`Assignment submitted: ${assignment.title} by student ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: { submission },
    });
  } catch (error) {
    logger.error('Submit assignment error:', error);
    next(error);
  }
};

/**
 * @desc    Get assignment submissions
 * @route   GET /api/assignments/:id/submissions
 * @access  Private (Faculty/Admin)
 */
exports.getAssignmentSubmissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && assignment.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view submissions',
      });
    }

    const query = { assignmentId: id };
    if (status) query.status = status;

    const submissions = await AssignmentSubmission.find(query)
      .populate('studentId', 'name email studentId')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AssignmentSubmission.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Submissions retrieved successfully',
      data: {
        submissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalSubmissions: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    logger.error('Get submissions error:', error);
    next(error);
  }
};

/**
 * @desc    Grade assignment submission
 * @route   PUT /api/assignments/submissions/:submissionId/grade
 * @access  Private (Faculty/Admin)
 */
exports.gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { marks, feedback, rubricScores } = req.body;

    const submission = await AssignmentSubmission.findById(submissionId)
      .populate('assignmentId', 'totalMarks rubric');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && submission.assignmentId.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to grade this submission',
      });
    }

    // Validate marks
    if (marks < 0 || marks > submission.assignmentId.totalMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${submission.assignmentId.totalMarks}`,
      });
    }

    // Calculate grade and percentage
    const percentage = (marks / submission.assignmentId.totalMarks) * 100;
    let grade = 'F';

    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C+';
    else if (percentage >= 40) grade = 'C';
    else if (percentage >= 30) grade = 'D';

    submission.grade = {
      marks,
      percentage,
      grade,
      feedback,
      gradedBy: req.user.id,
      gradedAt: new Date(),
    };

    if (rubricScores) {
      submission.rubricScores = rubricScores;
    }

    submission.status = 'graded';
    await submission.save();

    // Update assignment graded count
    await Assignment.findByIdAndUpdate(submission.assignmentId._id, {
      $inc: { gradedCount: 1 }
    });

    logger.info(`Submission graded: ${marks}/${submission.assignmentId.totalMarks} for assignment ${submission.assignmentId._id}`);

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      data: { submission },
    });
  } catch (error) {
    logger.error('Grade submission error:', error);
    next(error);
  }
};

/**
 * @desc    Get student's assignment submissions
 * @route   GET /api/assignments/my-submissions
 * @access  Private (Student)
 */
exports.getMySubmissions = async (req, res, next) => {
  try {
    const { courseId, status, page = 1, limit = 10 } = req.query;

    const query = { studentId: req.user.id };

    if (courseId) query.courseId = courseId;
    if (status) query.status = status;

    const submissions = await AssignmentSubmission.find(query)
      .populate('assignmentId', 'title deadline totalMarks type')
      .populate('courseId', 'code name')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AssignmentSubmission.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Submissions retrieved successfully',
      data: {
        submissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalSubmissions: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    logger.error('Get my submissions error:', error);
    next(error);
  }
};