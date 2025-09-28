const Joi = require('joi');
const { logger } = require('../config/logger');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const Semester = require('../models/Semester');
const ExamResult = require('../models/ExamResult');
const User = require('../models/User');

/**
 * @desc    Generate student transcript
 * @route   GET /api/academic-reports/transcript/:studentId
 * @access  Private (Admin/Student)
 */
exports.generateTranscript = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { format = 'json' } = req.query; // json or pdf

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student) {
      const response = {
        success: false,
        message: 'Student not found',
      };
      return res.status(404).json(response);
    }

    // Get all grades for the student
    const grades = await Grade.find({ studentId })
      .populate('courseId', 'code name credits department type')
      .populate('semesterId', 'name year')
      .sort({ 'semesterId.year': 1, 'semesterId.name': 1 });

    if (grades.length === 0) {
      const response = {
        success: false,
        message: 'No academic records found for this student',
      };
      return res.status(404).json(response);
    }

    // Organize grades by semester
    const semesterData = {};
    let totalCredits = 0;
    let totalGradePoints = 0;
    let completedSemesters = 0;

    grades.forEach(grade => {
      const semesterKey = grade.semesterId._id.toString();

      if (!semesterData[semesterKey]) {
        semesterData[semesterKey] = {
          semester: grade.semesterId,
          courses: [],
          semesterCredits: 0,
          semesterGradePoints: 0,
          sgpa: 0,
        };
      }

      semesterData[semesterKey].courses.push({
        code: grade.courseId.code,
        name: grade.courseId.name,
        credits: grade.courseId.credits,
        grade: grade.grade,
        gradePoint: grade.gradePoint,
        totalScore: grade.totalScore,
        components: grade.components,
      });

      semesterData[semesterKey].semesterCredits += grade.courseId.credits;
      semesterData[semesterKey].semesterGradePoints += grade.gradePoint * grade.courseId.credits;

      totalCredits += grade.courseId.credits;
      totalGradePoints += grade.gradePoint * grade.courseId.credits;
    });

    // Calculate SGPA for each semester and CGPA
    Object.values(semesterData).forEach(semester => {
      semester.sgpa = semester.semesterCredits > 0
        ? Math.round((semester.semesterGradePoints / semester.semesterCredits) * 100) / 100
        : 0;
      completedSemesters++;
    });

    const cgpa = totalCredits > 0
      ? Math.round((totalGradePoints / totalCredits) * 100) / 100
      : 0;

    const transcriptData = {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        program: student.profile?.program || 'Not specified',
        admissionYear: student.profile?.admissionYear || new Date().getFullYear(),
      },
      academicSummary: {
        totalCredits,
        cgpa,
        completedSemesters,
        totalCourses: grades.length,
      },
      semesterData: Object.values(semesterData),
      generatedAt: new Date(),
      generatedBy: req.user.name,
    };

    if (format === 'pdf') {
      // Generate PDF transcript
      const pdfBuffer = await generatePDFTranscript(transcriptData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="transcript_${student.rollNumber || studentId}.pdf"`);
      res.send(pdfBuffer);
    } else {
      // Return JSON format
      const response = {
        success: true,
        message: 'Transcript generated successfully',
        data: transcriptData,
      };
      res.status(200).json(response);
    }
  } catch (error) {
    logger.error('Generate transcript error:', error);
    next(error);
  }
};

/**
 * @desc    Get academic summary for admin dashboard
 * @route   GET /api/academic-reports/summary
 * @access  Private (Admin)
 */
exports.getAcademicSummary = async (req, res, next) => {
  try {
    const { semesterId } = req.query;

    const matchStage = {};
    if (semesterId) matchStage.semesterId = require('mongoose').Types.ObjectId(semesterId);

    // Get grade statistics
    const gradeStats = await Grade.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: null,
          totalStudents: { $addToSet: '$studentId' },
          totalGrades: { $sum: 1 },
          averageScore: { $avg: '$totalScore' },
          highestScore: { $max: '$totalScore' },
          lowestScore: { $min: '$totalScore' },
          gradeDistribution: { $push: '$grade' },
          statusDistribution: { $push: '$status' },
        },
      },
      {
        $project: {
          _id: 0,
          totalStudents: { $size: '$totalStudents' },
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

    // Get semester statistics
    const semesterStats = await Semester.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'courseDetails',
        },
      },
      {
        $project: {
          name: 1,
          year: 1,
          status: 1,
          totalCourses: { $size: '$courses' },
          totalCredits: { $sum: '$courseDetails.credits' },
          departments: { $setUnion: '$courseDetails.department' },
        },
      },
    ]);

    // Get course performance statistics
    const courseStats = await Grade.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $group: {
          _id: '$courseId',
          courseName: { $first: { $arrayElemAt: ['$course.name', 0] } },
          courseCode: { $first: { $arrayElemAt: ['$course.code', 0] } },
          totalStudents: { $sum: 1 },
          averageScore: { $avg: '$totalScore' },
          highestScore: { $max: '$totalScore' },
          lowestScore: { $min: '$totalScore' },
          passRate: {
            $multiply: [
              {
                $divide: [
                  { $sum: { $cond: [{ $in: ['$grade', ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D']] }, 1, 0] } },
                  { $sum: 1 }
                ]
              },
              100
            ]
          },
        },
      },
      {
        $project: {
          _id: 1,
          courseName: 1,
          courseCode: 1,
          totalStudents: 1,
          averageScore: { $round: ['$averageScore', 2] },
          highestScore: 1,
          lowestScore: 1,
          passRate: { $round: ['$passRate', 2] },
        },
      },
      { $sort: { averageScore: -1 } },
      { $limit: 10 },
    ]);

    const response = {
      success: true,
      message: 'Academic summary retrieved successfully',
      data: {
        gradeStats: gradeStats[0] || {},
        semesterStats,
        topPerformingCourses: courseStats,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get academic summary error:', error);
    next(error);
  }
};

/**
 * @desc    Get student performance report
 * @route   GET /api/academic-reports/student-performance/:studentId
 * @access  Private (Admin/Student)
 */
exports.getStudentPerformance = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student) {
      const response = {
        success: false,
        message: 'Student not found',
      };
      return res.status(404).json(response);
    }

    // Get all grades for the student
    const grades = await Grade.find({ studentId })
      .populate('courseId', 'code name credits department type')
      .populate('semesterId', 'name year')
      .sort({ 'semesterId.year': 1, 'semesterId.name': 1 });

    if (grades.length === 0) {
      const response = {
        success: false,
        message: 'No academic records found for this student',
      };
      return res.status(404).json(response);
    }

    // Calculate performance metrics
    const performanceData = {
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
      },
      overall: {
        totalCourses: grades.length,
        totalCredits: grades.reduce((sum, grade) => sum + grade.courseId.credits, 0),
        cgpa: await calculateCGPA(grades),
        averageScore: Math.round(grades.reduce((sum, grade) => sum + grade.totalScore, 0) / grades.length * 100) / 100,
        passRate: (grades.filter(grade => ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D'].includes(grade.grade)).length / grades.length) * 100,
      },
      semesterWise: {},
      subjectWise: {},
      trends: {
        semesterGPAs: [],
        scoreProgression: [],
      },
    };

    // Organize by semester and subject
    grades.forEach(grade => {
      const semesterKey = grade.semesterId._id.toString();
      const subjectKey = grade.courseId._id.toString();

      // Semester-wise data
      if (!performanceData.semesterWise[semesterKey]) {
        performanceData.semesterWise[semesterKey] = {
          semester: grade.semesterId,
          courses: [],
          sgpa: 0,
          totalCredits: 0,
        };
      }

      performanceData.semesterWise[semesterKey].courses.push({
        code: grade.courseId.code,
        name: grade.courseId.name,
        grade: grade.grade,
        gradePoint: grade.gradePoint,
        credits: grade.courseId.credits,
      });

      // Subject-wise data
      if (!performanceData.subjectWise[subjectKey]) {
        performanceData.subjectWise[subjectKey] = {
          course: grade.courseId,
          grades: [],
          averageScore: 0,
        };
      }

      performanceData.subjectWise[subjectKey].grades.push({
        semester: grade.semesterId.name,
        grade: grade.grade,
        gradePoint: grade.gradePoint,
        totalScore: grade.totalScore,
      });
    });

    // Calculate SGPA for each semester
    for (const semesterKey in performanceData.semesterWise) {
      const semester = performanceData.semesterWise[semesterKey];
      const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
      const totalGradePoints = semester.courses.reduce((sum, course) => sum + (course.gradePoint * course.credits), 0);

      semester.sgpa = totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;
      semester.totalCredits = totalCredits;

      performanceData.trends.semesterGPAs.push({
        semester: semester.semester.name,
        sgpa: semester.sgpa,
      });
    }

    // Calculate subject averages
    for (const subjectKey in performanceData.subjectWise) {
      const subject = performanceData.subjectWise[subjectKey];
      subject.averageScore = Math.round(subject.grades.reduce((sum, grade) => sum + grade.totalScore, 0) / subject.grades.length * 100) / 100;
    }

    const response = {
      success: true,
      message: 'Student performance report generated successfully',
      data: performanceData,
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get student performance error:', error);
    next(error);
  }
};

/**
 * @desc    Get course performance analysis
 * @route   GET /api/academic-reports/course-analysis/:courseId
 * @access  Private (Admin)
 */
exports.getCourseAnalysis = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { semesterId } = req.query;

    const query = { courseId };
    if (semesterId) query.semesterId = semesterId;

    const grades = await Grade.find(query)
      .populate('studentId', 'name email rollNumber')
      .populate('semesterId', 'name year')
      .sort({ totalScore: -1 });

    if (grades.length === 0) {
      const response = {
        success: false,
        message: 'No grades found for this course',
      };
      return res.status(404).json(response);
    }

    // Calculate detailed statistics
    const scores = grades.map(grade => grade.totalScore);
    const gradeDistribution = grades.reduce((acc, grade) => {
      acc[grade.grade] = (acc[grade.grade] || 0) + 1;
      return acc;
    }, {});

    const statistics = {
      totalStudents: grades.length,
      averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 100) / 100,
      medianScore: calculateMedian(scores),
      standardDeviation: calculateStandardDeviation(scores),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passRate: (grades.filter(grade => ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D'].includes(grade.grade)).length / grades.length) * 100,
      gradeDistribution,
      scoreRanges: {
        '90-100': grades.filter(g => g.totalScore >= 90).length,
        '80-89': grades.filter(g => g.totalScore >= 80 && g.totalScore < 90).length,
        '70-79': grades.filter(g => g.totalScore >= 70 && g.totalScore < 80).length,
        '60-69': grades.filter(g => g.totalScore >= 60 && g.totalScore < 70).length,
        '50-59': grades.filter(g => g.totalScore >= 50 && g.totalScore < 60).length,
        'Below 50': grades.filter(g => g.totalScore < 50).length,
      },
    };

    const response = {
      success: true,
      message: 'Course analysis generated successfully',
      data: {
        course: grades[0].courseId,
        statistics,
        topPerformers: grades.slice(0, 5).map(grade => ({
          student: grade.studentId,
          score: grade.totalScore,
          grade: grade.grade,
          gradePoint: grade.gradePoint,
        })),
        needsImprovement: grades.slice(-5).map(grade => ({
          student: grade.studentId,
          score: grade.totalScore,
          grade: grade.grade,
          gradePoint: grade.gradePoint,
        })),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get course analysis error:', error);
    next(error);
  }
};

// Helper function to calculate CGPA
async function calculateCGPA(grades) {
  let totalCredits = 0;
  let totalGradePoints = 0;

  grades.forEach(grade => {
    const credits = grade.courseId.credits;
    totalCredits += credits;
    totalGradePoints += grade.gradePoint * credits;
  });

  return totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;
}

// Helper function to calculate median
function calculateMedian(scores) {
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Helper function to calculate standard deviation
function calculateStandardDeviation(scores) {
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const squaredDiffs = scores.map(score => Math.pow(score - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / scores.length;
  return Math.round(Math.sqrt(avgSquaredDiff) * 100) / 100;
}

// Helper function to generate PDF transcript
async function generatePDFTranscript(transcriptData) {
  // This would integrate with a PDF generation library like puppeteer or pdfkit
  // For now, return a placeholder
  return Buffer.from('PDF generation not implemented yet');
}