import { Request, Response } from 'express';
import Exam, { IExam } from '../models/Exam';
import ExamResult, { IExamResult } from '../models/ExamResult';
import User, { IUser } from '../models/User';
import { AuthenticatedRequest } from '../types';

export class APIError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError';
  }
}

// Create exam (admin only)
export const createExam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const examData = req.body;
    
    const exam = new Exam({
      ...examData,
      createdBy: req.user?.id
    });
    
    await exam.save();
    
    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: exam
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get all exams
export const getAllExams = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      subject, 
      semester, 
      status,
      examType 
    } = req.query;

    const filter: any = {};
    
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (semester) filter.semester = semester;
    if (status) filter.isActive = status === 'active';
    if (examType) filter.examType = examType;

    // Students can only see active exams
    if (req.user?.role === 'student') {
      filter.isActive = true;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const exams = await Exam.find(filter)
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Exam.countDocuments(filter);

    res.json({
      success: true,
      data: {
        exams,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get exam by ID
export const getExamById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const exam = await Exam.findById(id)
      .populate('createdBy', 'name email');

    if (!exam) {
      throw new APIError('Exam not found', 404);
    }

    // Students can only view active exams
    if (req.user?.role === 'student' && !exam.isActive) {
      throw new APIError('Exam not available', 403);
    }

    res.json({
      success: true,
      data: exam
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Update exam (admin only)
export const updateExam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const exam = await Exam.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!exam) {
      throw new APIError('Exam not found', 404);
    }

    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: exam
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Delete exam (admin only)
export const deleteExam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const exam = await Exam.findByIdAndDelete(id);

    if (!exam) {
      throw new APIError('Exam not found', 404);
    }

    // Also delete related exam results
    await ExamResult.deleteMany({ examId: id });

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Publish exam (admin only)
export const publishExam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const exam = await Exam.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!exam) {
      throw new APIError('Exam not found', 404);
    }

    res.json({
      success: true,
      message: 'Exam published successfully',
      data: exam
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Add exam result (admin only)
export const addExamResult = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { examId, userId, marksObtained, grade } = req.body;

    // Verify exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new APIError('Exam not found', 404);
    }

    // Verify student exists
    const student = await User.findById(userId);
    if (!student || student.role !== 'student') {
      throw new APIError('Student not found', 404);
    }

    // Check if result already exists
    const existingResult = await ExamResult.findOne({ examId, userId });
    if (existingResult) {
      throw new APIError('Result already exists for this student and exam', 400);
    }

    // Calculate percentage
    const percentage = (marksObtained / exam.totalMarks) * 100;

    const examResult = new ExamResult({
      examId,
      userId,
      marksObtained,
      grade,
      percentage,
      isPublished: false
    });

    await examResult.save();

    res.status(201).json({
      success: true,
      message: 'Exam result added successfully',
      data: examResult
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get exam results
export const getExamResults = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      examId, 
      userId, 
      semester, 
      subject,
      page = 1, 
      limit = 10 
    } = req.query;

    const filter: any = {};
    
    if (examId) filter.examId = examId;

    // Students can only see their own results
    if (req.user?.role === 'student') {
      filter.userId = req.user.id;
    } else if (userId) {
      filter.userId = userId;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const results = await ExamResult.find(filter)
      .populate('userId', 'name email studentId')
      .populate('examId', 'name code examType totalMarks')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ExamResult.countDocuments(filter);

    res.json({
      success: true,
      data: {
        results,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Update exam result (admin only)
export const updateExamResult = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Calculate percentage if marksObtained is updated
    if (updateData.marksObtained) {
      const result = await ExamResult.findById(id).populate('examId');
      if (result && result.examId) {
        updateData.percentage = (updateData.marksObtained / (result.examId as any).totalMarks) * 100;
      }
    }

    const result = await ExamResult.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email studentId')
     .populate('examId', 'name code examType totalMarks');

    if (!result) {
      throw new APIError('Exam result not found', 404);
    }

    res.json({
      success: true,
      message: 'Exam result updated successfully',
      data: result
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Delete exam result (admin only)
export const deleteExamResult = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await ExamResult.findByIdAndDelete(id);

    if (!result) {
      throw new APIError('Exam result not found', 404);
    }

    res.json({
      success: true,
      message: 'Exam result deleted successfully'
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get student grade summary
export const getStudentGradeSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.role === 'student' ? req.user.id : req.params.userId;

    if (!userId) {
      throw new APIError('User ID required', 400);
    }

    const results = await ExamResult.find({ userId, isPublished: true })
      .populate('examId', 'name code examType totalMarks department semester')
      .sort({ createdAt: -1 });

    // Group by semester and department
    const groupedResults = results.reduce((acc: any, result) => {
      const exam = result.examId as any;
      const key = `${exam.department}-${exam.semester}`;
      
      if (!acc[key]) {
        acc[key] = {
          department: exam.department,
          semester: exam.semester,
          exams: [],
          totalMarks: 0,
          totalPossible: 0,
          averagePercentage: 0
        };
      }

      acc[key].exams.push(result);
      acc[key].totalMarks += result.marksObtained;
      acc[key].totalPossible += exam.totalMarks;

      return acc;
    }, {});

    // Calculate averages
    Object.values(groupedResults).forEach((group: any) => {
      group.averagePercentage = group.totalPossible > 0 
        ? (group.totalMarks / group.totalPossible * 100).toFixed(2)
        : 0;
    });

    const overallStats = {
      totalExams: results.length,
      totalMarks: results.reduce((sum, r) => sum + r.marksObtained, 0),
      totalPossible: results.reduce((sum, r) => sum + (r.examId as any).totalMarks, 0),
      overallPercentage: 0
    };

    overallStats.overallPercentage = overallStats.totalPossible > 0
      ? Number((overallStats.totalMarks / overallStats.totalPossible * 100).toFixed(2))
      : 0;

    res.json({
      success: true,
      data: {
        userId,
        semesterWise: Object.values(groupedResults),
        overall: overallStats
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get exam statistics (admin only)
export const getExamStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new APIError('Exam not found', 404);
    }

    const results = await ExamResult.find({ examId })
      .populate('userId', 'name email studentId');

    if (results.length === 0) {
      res.json({
        success: true,
        data: {
          exam,
          statistics: {
            totalStudents: 0,
            averageMarks: 0,
            highestMarks: 0,
            lowestMarks: 0,
            passPercentage: 0,
            gradeDistribution: {}
          },
          results: []
        }
      });
      return;
    }

    const marks = results.map(r => r.marksObtained);
    const passMarks = exam.passingMarks;
    const passedStudents = results.filter(r => r.marksObtained >= passMarks).length;

    const gradeDistribution = results.reduce((acc: any, result) => {
      const grade = result.grade;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    const statistics = {
      totalStudents: results.length,
      averageMarks: Number((marks.reduce((sum, mark) => sum + mark, 0) / marks.length).toFixed(2)),
      highestMarks: Math.max(...marks),
      lowestMarks: Math.min(...marks),
      passPercentage: Number(((passedStudents / results.length) * 100).toFixed(2)),
      gradeDistribution
    };

    res.json({
      success: true,
      data: {
        exam,
        statistics,
        results: results.sort((a, b) => b.marksObtained - a.marksObtained)
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Bulk upload exam results (admin only)
export const bulkUploadResults = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { examId, results } = req.body;

    if (!Array.isArray(results) || results.length === 0) {
      throw new APIError('Results array is required', 400);
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new APIError('Exam not found', 404);
    }

    const uploadResults: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < results.length; i++) {
      try {
        const { userId, marksObtained, grade } = results[i];

        // Verify student exists
        const student = await User.findById(userId);
        if (!student || student.role !== 'student') {
          errors.push(`Row ${i + 1}: Student not found`);
          continue;
        }

        // Check if result already exists
        const existingResult = await ExamResult.findOne({ examId, userId });
        if (existingResult) {
          errors.push(`Row ${i + 1}: Result already exists for student ${student.email}`);
          continue;
        }

        // Calculate percentage
        const percentage = (marksObtained / exam.totalMarks) * 100;

        const examResult = new ExamResult({
          examId,
          userId,
          marksObtained,
          grade,
          percentage,
          isPublished: false
        });

        await examResult.save();
        uploadResults.push(examResult);

      } catch (error: any) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Uploaded ${uploadResults.length} results successfully`,
      data: {
        uploaded: uploadResults.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};