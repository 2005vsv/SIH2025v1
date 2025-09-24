const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const User = require('../models/User');

// Student routes

// Get exam timetable for student
exports.getExamTimetable = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const exams = await Exam.find({
      department: user.profile && user.profile.department,
      semester: user.profile && user.profile.semester,
      status: 'scheduled'
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: { exams }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam timetable',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get exam results for student
exports.getExamResults = async (req, res) => {
  try {
    const userId = req.user && req.user.id;

    const results = await ExamResult.find({ studentId: userId })
      .populate('examId', 'title subject date totalMarks')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { results }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam results',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get transcript for student
exports.getTranscript = async (req, res) => {
  try {
    const userId = req.user && req.user.id;

    const user = await User.findById(userId);
    const results = await ExamResult.find({ studentId: userId })
      .populate('examId', 'title subject semester credits totalMarks')
      .sort({ 'examId.semester': 1 });

    // Calculate CGPA and semester-wise GPA
    let totalCredits = 0;
    let totalGradePoints = 0;
    const semesterWiseData = {};

    results.forEach((result) => {
      const semester = result.examId.semester;
      const credits = result.examId.credits || 3;
      const gradePoints = calculateGradePoints(result.marksObtained, result.examId.totalMarks);

      if (!semesterWiseData[semester]) {
        semesterWiseData[semester] = {
          subjects: [],
          totalCredits: 0,
          totalGradePoints: 0
        };
      }

      semesterWiseData[semester].subjects.push({
        subject: result.examId.subject,
        credits,
        grade: calculateGrade(result.marksObtained, result.examId.totalMarks),
        gradePoints
      });

      semesterWiseData[semester].totalCredits += credits;
      semesterWiseData[semester].totalGradePoints += gradePoints * credits;

      totalCredits += credits;
      totalGradePoints += gradePoints * credits;
    });

    const cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    res.json({
      success: true,
      data: {
        student: {
          name: user && user.name,
          studentId: user && user.studentId,
          department: user && user.profile && user.profile.department,
          admissionYear: user && user.profile && user.profile.admissionYear
        },
        cgpa: parseFloat(cgpa.toFixed(2)),
        totalCredits,
        semesterWiseData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate transcript',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get assignments for student
exports.getAssignments = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Mock assignments data - in real app, would have Assignment model
    const assignments = [
      {
        id: '1',
        title: 'Data Structures Assignment 1',
        subject: 'Data Structures',
        description: 'Implement binary search tree operations',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxMarks: 100,
        status: 'pending',
        submittedAt: null
      },
      {
        id: '2',
        title: 'Database Project',
        subject: 'Database Management',
        description: 'Design and implement a library management system',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        maxMarks: 100,
        status: 'submitted',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        marksObtained: 85
      }
    ];

    res.json({
      success: true,
      data: { assignments }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { submissionText, fileUrl } = req.body;
    const userId = req.user && req.user.id;

    // Mock submission - in real app, would save to Assignment model
    res.json({
      success: true,
      message: 'Assignment submitted successfully',
      data: {
        assignmentId: id,
        submittedAt: new Date(),
        submissionText,
        fileUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get course content
exports.getCourseContent = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Mock course content - in real app, would have CourseContent model
    const courseContent = [
      {
        id: '1',
        subject: 'Data Structures',
        title: 'Introduction to Arrays',
        type: 'video',
        url: '/content/ds-arrays.mp4',
        description: 'Basic concepts of arrays and their implementation',
        duration: '45 minutes',
        uploadedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        subject: 'Database Management',
        title: 'SQL Basics',
        type: 'pdf',
        url: '/content/sql-basics.pdf',
        description: 'Introduction to SQL queries and database operations',
        pages: 25,
        uploadedAt: new Date('2024-01-20')
      }
    ];

    res.json({
      success: true,
      data: { courseContent }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course content',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Admin routes

// Get all exams
exports.getExams = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, semester, status } = req.query;

    const query = {};
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    if (status) query.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-date'
    };

    const exams = await Exam.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await Exam.countDocuments(query);

    res.json({
      success: true,
      data: {
        exams,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total,
          limit: options.limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get exam by ID
exports.getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id);

    if (!exam) {
      res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
      return;
    }

    res.json({
      success: true,
      data: { exam }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Create new exam
exports.createExam = async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: { exam }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create exam',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update exam
exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!exam) {
      res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: { exam }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update exam',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Delete exam
exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findByIdAndDelete(id);

    if (!exam) {
      res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete exam',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Submit exam result
exports.submitExamResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { results } = req.body; // Array of {studentId, marksObtained}

    const exam = await Exam.findById(id);
    if (!exam) {
      res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
      return;
    }

    const examResults = [];
    for (const result of results) {
      const examResult = new ExamResult({
        examId: id,
        studentId: result.studentId,
        marksObtained: result.marksObtained,
        grade: calculateGrade(result.marksObtained, exam.totalMarks),
        remarks: result.remarks || ''
      });

      await examResult.save();
      examResults.push(examResult);
    }

    res.json({
      success: true,
      message: 'Exam results submitted successfully',
      data: { results: examResults }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit exam results',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    // Mock assignment creation - in real app, would save to Assignment model
    const assignment = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: { assignment }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Upload course content
exports.uploadCourseContent = async (req, res) => {
  try {
    // Mock content upload - in real app, would save to CourseContent model
    const content = {
      id: Date.now().toString(),
      ...req.body,
      uploadedAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Course content uploaded successfully',
      data: { content }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload course content',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Helper functions
function calculateGradePoints(marksObtained, maxMarks) {
  const percentage = (marksObtained / maxMarks) * 100;

  if (percentage >= 90) return 10;
  if (percentage >= 80) return 9;
  if (percentage >= 70) return 8;
  if (percentage >= 60) return 7;
  if (percentage >= 50) return 6;
  if (percentage >= 40) return 5;
  return 0;
}

function calculateGrade(marksObtained, maxMarks) {
  const percentage = (marksObtained / maxMarks) * 100;

  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}