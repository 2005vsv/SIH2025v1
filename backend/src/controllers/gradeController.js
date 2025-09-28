const Joi = require('joi');
const { logger } = require('../config/logger');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const Semester = require('../models/Semester');

// Validation schemas
const gradeComponentSchema = Joi.object({
  name: Joi.string().valid('midterm', 'final', 'practical', 'quiz', 'assignment', 'project', 'attendance').required(),
  weight: Joi.number().min(0).max(100).required(),
  score: Joi.number().min(0).max(100).optional(),
  maxScore: Joi.number().min(0).required(),
});

const gradeSchema = Joi.object({
  studentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  courseId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  semesterId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  components: Joi.array().items(gradeComponentSchema).min(1).required(),
  status: Joi.string().valid('incomplete', 'graded', 'published').default('incomplete'),
  remarks: Joi.string().trim().optional(),
});

const updateGradeSchema = Joi.object({
  components: Joi.array().items(gradeComponentSchema).min(1).optional(),
  status: Joi.string().valid('incomplete', 'graded', 'published').optional(),
  remarks: Joi.string().trim().optional(),
});

/**
 * @desc    Get all grades
 * @route   GET /api/grades
 * @access  Private (Admin)
 */
exports.getAllGrades = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      courseId,
      semesterId,
      studentId,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (courseId) query.courseId = courseId;
    if (semesterId) query.semesterId = semesterId;
    if (studentId) query.studentId = studentId;
    if (status) query.status = status;

    if (search) {
      // Search in populated student and course data
      const courses = await Course.find({ name: { $regex: search, $options: 'i' } });
      const courseIds = courses.map(c => c._id);

      query.$or = [
        { courseId: { $in: courseIds } },
        // Add more search criteria as needed
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const grades = await Grade.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('studentId', 'name email rollNumber')
      .populate('courseId', 'code name credits')
      .populate('semesterId', 'name year')
      .exec();

    const total = await Grade.countDocuments(query);

    const response = {
      success: true,
      message: 'Grades retrieved successfully',
      data: {
        grades,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalGrades: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get all grades error:', error);
    next(error);
  }
};

/**
 * @desc    Get single grade
 * @route   GET /api/grades/:id
 * @access  Private (Admin)
 */
exports.getGrade = async (req, res, next) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('studentId', 'name email rollNumber')
      .populate('courseId', 'code name credits department')
      .populate('semesterId', 'name year')
      .populate('gradedBy', 'name email');

    if (!grade) {
      const response = {
        success: false,
        message: 'Grade not found',
      };
      return res.status(404).json(response);
    }

    const response = {
      success: true,
      message: 'Grade retrieved successfully',
      data: { grade },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get grade error:', error);
    next(error);
  }
};

/**
 * @desc    Create new grade
 * @route   POST /api/grades
 * @access  Private (Admin)
 */
exports.createGrade = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = gradeSchema.validate(req.body);
    if (error) {
      const response = {
        success: false,
        message: error.details[0].message,
      };
      return res.status(400).json(response);
    }

    // Verify student, course, and semester exist
    const [student, course, semester] = await Promise.all([
      require('../models/User').findById(value.studentId),
      Course.findById(value.courseId),
      Semester.findById(value.semesterId),
    ]);

    if (!student) {
      const response = { success: false, message: 'Student not found' };
      return res.status(404).json(response);
    }

    if (!course) {
      const response = { success: false, message: 'Course not found' };
      return res.status(404).json(response);
    }

    if (!semester) {
      const response = { success: false, message: 'Semester not found' };
      return res.status(404).json(response);
    }

    // Check if grade already exists
    const existingGrade = await Grade.findOne({
      studentId: value.studentId,
      courseId: value.courseId,
      semesterId: value.semesterId,
    });

    if (existingGrade) {
      const response = {
        success: false,
        message: 'Grade already exists for this student in this course and semester',
      };
      return res.status(400).json(response);
    }

    // Create grade
    const grade = await Grade.create({
      ...value,
      gradedBy: req.user.id,
      gradedAt: new Date(),
    });

    await grade.populate('studentId', 'name email rollNumber');
    await grade.populate('courseId', 'code name credits');
    await grade.populate('semesterId', 'name year');

    logger.info(`Grade created for student ${student.name} in course ${course.code}`);

    const response = {
      success: true,
      message: 'Grade created successfully',
      data: { grade },
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Create grade error:', error);
    next(error);
  }
};

/**
 * @desc    Update grade
 * @route   PUT /api/grades/:id
 * @access  Private (Admin)
 */
exports.updateGrade = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = updateGradeSchema.validate(req.body);
    if (error) {
      const response = {
        success: false,
        message: error.details[0].message,
      };
      return res.status(400).json(response);
    }

    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      const response = {
        success: false,
        message: 'Grade not found',
      };
      return res.status(404).json(response);
    }

    // Update grade
    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      {
        ...value,
        gradedBy: req.user.id,
        gradedAt: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate('studentId', 'name email rollNumber')
      .populate('courseId', 'code name credits')
      .populate('semesterId', 'name year');

    logger.info(`Grade updated for student ${updatedGrade.studentId.name} in course ${updatedGrade.courseId.code}`);

    const response = {
      success: true,
      message: 'Grade updated successfully',
      data: { grade: updatedGrade },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Update grade error:', error);
    next(error);
  }
};

/**
 * @desc    Delete grade
 * @route   DELETE /api/grades/:id
 * @access  Private (Admin)
 */
exports.deleteGrade = async (req, res, next) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);

    if (!grade) {
      const response = {
        success: false,
        message: 'Grade not found',
      };
      return res.status(404).json(response);
    }

    logger.info(`Grade deleted for student ${grade.studentId} in course ${grade.courseId}`);

    const response = {
      success: true,
      message: 'Grade deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Delete grade error:', error);
    next(error);
  }
};

/**
 * @desc    Get student's grades
 * @route   GET /api/grades/student/:studentId
 * @access  Private (Admin/Student)
 */
exports.getStudentGrades = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { semesterId } = req.query;

    const query = { studentId };
    if (semesterId) query.semesterId = semesterId;

    const grades = await Grade.find(query)
      .populate('courseId', 'code name credits department type')
      .populate('semesterId', 'name year')
      .sort({ createdAt: -1 });

    // Calculate SGPA if semester is specified
    let sgpa = null;
    if (semesterId) {
      sgpa = await Grade.calculateSGPA(grades);
    }

    const response = {
      success: true,
      message: 'Student grades retrieved successfully',
      data: {
        grades,
        sgpa,
        totalGrades: grades.length,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get student grades error:', error);
    next(error);
  }
};

/**
 * @desc    Get course grades
 * @route   GET /api/grades/course/:courseId
 * @access  Private (Admin)
 */
exports.getCourseGrades = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { semesterId } = req.query;

    const query = { courseId };
    if (semesterId) query.semesterId = semesterId;

    const grades = await Grade.find(query)
      .populate('studentId', 'name email rollNumber')
      .populate('semesterId', 'name year')
      .sort({ totalScore: -1 });

    // Calculate statistics
    const stats = {
      totalStudents: grades.length,
      averageScore: grades.length > 0
        ? grades.reduce((sum, grade) => sum + grade.totalScore, 0) / grades.length
        : 0,
      highestScore: grades.length > 0 ? Math.max(...grades.map(g => g.totalScore)) : 0,
      lowestScore: grades.length > 0 ? Math.min(...grades.map(g => g.totalScore)) : 0,
      gradeDistribution: grades.reduce((acc, grade) => {
        acc[grade.grade] = (acc[grade.grade] || 0) + 1;
        return acc;
      }, {}),
    };

    const response = {
      success: true,
      message: 'Course grades retrieved successfully',
      data: {
        grades,
        stats,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get course grades error:', error);
    next(error);
  }
};

/**
 * @desc    Bulk create/update grades
 * @route   POST /api/grades/bulk
 * @access  Private (Admin)
 */
exports.bulkCreateGrades = async (req, res, next) => {
  try {
    const { grades } = req.body;

    if (!Array.isArray(grades) || grades.length === 0) {
      const response = {
        success: false,
        message: 'Grades array is required',
      };
      return res.status(400).json(response);
    }

    const results = [];
    const errors = [];

    for (const gradeData of grades) {
      try {
        // Validate each grade
        const { error, value } = gradeSchema.validate(gradeData);
        if (error) {
          errors.push({
            data: gradeData,
            error: error.details[0].message,
          });
          continue;
        }

        // Check if grade already exists
        const existingGrade = await Grade.findOne({
          studentId: value.studentId,
          courseId: value.courseId,
          semesterId: value.semesterId,
        });

        if (existingGrade) {
          // Update existing grade
          const updatedGrade = await Grade.findByIdAndUpdate(
            existingGrade._id,
            {
              ...value,
              gradedBy: req.user.id,
              gradedAt: new Date(),
            },
            { new: true, runValidators: true }
          );
          results.push({ action: 'updated', grade: updatedGrade });
        } else {
          // Create new grade
          const newGrade = await Grade.create({
            ...value,
            gradedBy: req.user.id,
            gradedAt: new Date(),
          });
          results.push({ action: 'created', grade: newGrade });
        }
      } catch (error) {
        errors.push({
          data: gradeData,
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
          created: results.filter(r => r.action === 'created').length,
          updated: results.filter(r => r.action === 'updated').length,
          failed: errors.length,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Bulk create grades error:', error);
    next(error);
  }
};

/**
 * @desc    Get grade statistics
 * @route   GET /api/grades/stats
 * @access  Private (Admin)
 */
exports.getGradeStats = async (req, res, next) => {
  try {
    const { semesterId, courseId } = req.query;

    const matchStage = {};
    if (semesterId) matchStage.semesterId = require('mongoose').Types.ObjectId(semesterId);
    if (courseId) matchStage.courseId = require('mongoose').Types.ObjectId(courseId);

    const stats = await Grade.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: null,
          totalGrades: { $sum: 1 },
          averageScore: { $avg: '$totalScore' },
          highestScore: { $max: '$totalScore' },
          lowestScore: { $min: '$totalScore' },
          gradeDistribution: {
            $push: '$grade',
          },
          statusDistribution: {
            $push: '$status',
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalGrades: 1,
          averageScore: { $round: ['$averageScore', 2] },
          highestScore: 1,
          lowestScore: 1,
          gradeDistribution: {
            $reduce: {
              input: '$gradeDistribution',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  { [Object.keys('$$this')[0]]: { $add: [{ $ifNull: ['$$value.$$this', 0] }, 1] } }
                ]
              }
            }
          },
          statusDistribution: {
            $reduce: {
              input: '$statusDistribution',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  { [Object.keys('$$this')[0]]: { $add: [{ $ifNull: ['$$value.$$this', 0] }, 1] } }
                ]
              }
            }
          },
        },
      },
    ]);

    const response = {
      success: true,
      message: 'Grade statistics retrieved successfully',
      data: stats[0] || {
        totalGrades: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        gradeDistribution: {},
        statusDistribution: {},
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get grade stats error:', error);
    next(error);
  }
};