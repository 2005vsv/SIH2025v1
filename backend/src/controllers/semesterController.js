const Joi = require('joi');
const { logger } = require('../config/logger');
const Semester = require('../models/Semester');
const Course = require('../models/Course');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Validation schemas
const semesterSchema = Joi.object({
  name: Joi.string().required().trim(),
  semesterNumber: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2020).max(2030).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
  status: Joi.string().valid('upcoming', 'active', 'completed').default('upcoming'),
  courses: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional(),
  description: Joi.string().trim().optional(),
  isCurrent: Joi.boolean().default(false),
});

const updateSemesterSchema = Joi.object({
  name: Joi.string().trim().optional(),
  semesterNumber: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2020).max(2030).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().when('startDate', {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref('startDate')).required(),
    otherwise: Joi.date().optional(),
  }),
  status: Joi.string().valid('upcoming', 'active', 'completed').optional(),
  courses: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional(),
  description: Joi.string().trim().optional(),
  isCurrent: Joi.boolean().optional(),
});

/**
 * @desc    Get all semesters
 * @route   GET /api/semesters
 * @access  Private (Admin)
 */
exports.getAllSemesters = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      year,
      search,
      sortBy = 'startDate',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (year) query.year = parseInt(year);

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const semesters = await Semester.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('courses', 'code name credits')
      .exec();

    const total = await Semester.countDocuments(query);

    const response = {
      success: true,
      message: 'Semesters retrieved successfully',
      data: {
        semesters,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalSemesters: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get all semesters error:', error);
    next(error);
  }
};

/**
 * @desc    Get single semester
 * @route   GET /api/semesters/:id
 * @access  Private (Admin)
 */
exports.getSemester = async (req, res, next) => {
  try {
    const semester = await Semester.findById(req.params.id)
      .populate('courses', 'code name credits department instructor');

    if (!semester) {
      const response = {
        success: false,
        message: 'Semester not found',
      };
      return res.status(404).json(response);
    }

    const response = {
      success: true,
      message: 'Semester retrieved successfully',
      data: { semester },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get semester error:', error);
    next(error);
  }
};

/**
 * @desc    Create new semester
 * @route   POST /api/semesters
 * @access  Private (Admin)
 */
exports.createSemester = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = semesterSchema.validate(req.body);
    if (error) {
      const response = {
        success: false,
        message: error.details[0].message,
      };
      return res.status(400).json(response);
    }

    // Check if semester name already exists for the same year
    const existingSemester = await Semester.findOne({
      name: value.name,
      year: value.year,
    });
    if (existingSemester) {
      const response = {
        success: false,
        message: 'Semester with this name already exists for the given year',
      };
      return res.status(400).json(response);
    }

    // If this is set as current semester, unset others
    if (value.isCurrent) {
      await Semester.updateMany({}, { isCurrent: false });
    }

    // Create semester
    const semester = await Semester.create(value);

    // Populate courses
    await semester.populate('courses', 'code name credits');

    logger.info(`Semester created: ${semester.name} (${semester.year})`);

    // Send notifications to all students about the new semester
    try {
      const students = await User.find({ role: 'student' }).select('_id');
      const notifications = await Promise.all(
        students.map(async (student) => {
          const notification = new Notification({
            userId: student._id,
            title: 'New Semester Created',
            message: `A new semester "${semester.name}" has been created for ${semester.year}. Check the academic management section for course enrollment.`,
            type: 'info',
            category: 'academic',
            priority: 'medium',
            actionUrl: '/student/academics',
            actionText: 'View Courses',
            data: {
              semesterId: semester._id,
              semesterName: semester.name,
              year: semester.year,
              startDate: semester.startDate,
              endDate: semester.endDate,
            },
            createdBy: req.user && req.user.id,
          });

          const savedNotification = await notification.save();

          // Emit real-time notification via Socket.IO
          if (global.io) {
            global.io.to(`user_${student._id}`).emit('notification', {
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

      logger.info(`Sent semester creation notifications to ${notifications.length} students`);
    } catch (notificationError) {
      logger.error('Error sending semester creation notifications:', notificationError);
      // Don't fail the semester creation if notifications fail
    }

    const response = {
      success: true,
      message: 'Semester created successfully',
      data: { semester },
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Create semester error:', error);
    next(error);
  }
};

/**
 * @desc    Update semester
 * @route   PUT /api/semesters/:id
 * @access  Private (Admin)
 */
exports.updateSemester = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = updateSemesterSchema.validate(req.body);
    if (error) {
      const response = {
        success: false,
        message: error.details[0].message,
      };
      return res.status(400).json(response);
    }

    // Check if semester exists
    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      const response = {
        success: false,
        message: 'Semester not found',
      };
      return res.status(404).json(response);
    }

    // If this is being set as current semester, unset others
    if (value.isCurrent && !semester.isCurrent) {
      await Semester.updateMany(
        { _id: { $ne: req.params.id } },
        { isCurrent: false }
      );
    }

    const updatedSemester = await Semester.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    ).populate('courses', 'code name credits');

    logger.info(`Semester updated: ${updatedSemester.name}`);

    const response = {
      success: true,
      message: 'Semester updated successfully',
      data: { semester: updatedSemester },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Update semester error:', error);
    next(error);
  }
};

/**
 * @desc    Delete semester
 * @route   DELETE /api/semesters/:id
 * @access  Private (Admin)
 */
exports.deleteSemester = async (req, res, next) => {
  try {
    const semester = await Semester.findByIdAndDelete(req.params.id);

    if (!semester) {
      const response = {
        success: false,
        message: 'Semester not found',
      };
      return res.status(404).json(response);
    }

    logger.info(`Semester deleted: ${semester.name}`);

    const response = {
      success: true,
      message: 'Semester deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Delete semester error:', error);
    next(error);
  }
};

/**
 * @desc    Get current semester
 * @route   GET /api/semesters/current
 * @access  Private (Admin/Student)
 */
exports.getCurrentSemester = async (req, res, next) => {
  try {
    const currentSemester = await Semester.findOne({ isCurrent: true })
      .populate('courses', 'code name credits department instructor');

    if (!currentSemester) {
      const response = {
        success: false,
        message: 'No current semester found',
      };
      return res.status(404).json(response);
    }

    const response = {
      success: true,
      message: 'Current semester retrieved successfully',
      data: { semester: currentSemester },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get current semester error:', error);
    next(error);
  }
};

/**
 * @desc    Add courses to semester
 * @route   POST /api/semesters/:id/courses
 * @access  Private (Admin)
 */
exports.addCoursesToSemester = async (req, res, next) => {
  try {
    const { courseIds } = req.body;

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      const response = {
        success: false,
        message: 'Course IDs array is required',
      };
      return res.status(400).json(response);
    }

    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      const response = {
        success: false,
        message: 'Semester not found',
      };
      return res.status(404).json(response);
    }

    // Add courses that don't already exist in the semester
    const existingCourseIds = semester.courses.map(id => id.toString());
    const newCourseIds = courseIds.filter(id => !existingCourseIds.includes(id));

    if (newCourseIds.length === 0) {
      const response = {
        success: false,
        message: 'All courses are already in this semester',
      };
      return res.status(400).json(response);
    }

    // Verify courses exist
    const courses = await Course.find({ _id: { $in: newCourseIds } });
    if (courses.length !== newCourseIds.length) {
      const response = {
        success: false,
        message: 'Some courses not found',
      };
      return res.status(404).json(response);
    }

    semester.courses.push(...newCourseIds);
    await semester.save();
    await semester.populate('courses', 'code name credits');

    logger.info(`Added ${newCourseIds.length} courses to semester ${semester.name}`);

    const response = {
      success: true,
      message: 'Courses added to semester successfully',
      data: { semester },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Add courses to semester error:', error);
    next(error);
  }
};

/**
 * @desc    Remove courses from semester
 * @route   DELETE /api/semesters/:id/courses
 * @access  Private (Admin)
 */
exports.removeCoursesFromSemester = async (req, res, next) => {
  try {
    const { courseIds } = req.body;

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      const response = {
        success: false,
        message: 'Course IDs array is required',
      };
      return res.status(400).json(response);
    }

    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      const response = {
        success: false,
        message: 'Semester not found',
      };
      return res.status(404).json(response);
    }

    // Remove courses from semester
    semester.courses = semester.courses.filter(
      courseId => !courseIds.includes(courseId.toString())
    );

    await semester.save();
    await semester.populate('courses', 'code name credits');

    logger.info(`Removed ${courseIds.length} courses from semester ${semester.name}`);

    const response = {
      success: true,
      message: 'Courses removed from semester successfully',
      data: { semester },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Remove courses from semester error:', error);
    next(error);
  }
};

/**
 * @desc    Get semester statistics
 * @route   GET /api/semesters/:id/stats
 * @access  Private (Admin)
 */
exports.getSemesterStats = async (req, res, next) => {
  try {
    const semester = await Semester.findById(req.params.id)
      .populate('courses');

    if (!semester) {
      const response = {
        success: false,
        message: 'Semester not found',
      };
      return res.status(404).json(response);
    }

    const stats = {
      totalCourses: semester.courses.length,
      totalCredits: semester.courses.reduce((sum, course) => sum + course.credits, 0),
      departments: [...new Set(semester.courses.map(course => course.department))],
      courseTypes: semester.courses.reduce((acc, course) => {
        acc[course.type] = (acc[course.type] || 0) + 1;
        return acc;
      }, {}),
    };

    const response = {
      success: true,
      message: 'Semester statistics retrieved successfully',
      data: { stats },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get semester stats error:', error);
    next(error);
  }
};