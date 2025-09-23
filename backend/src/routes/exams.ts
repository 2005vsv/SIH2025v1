import express from 'express';
import {
    createAssignment,
    createExam,
    deleteExam,
    getAssignments,
    getCourseContent,
    getExamById,
    getExamResults,
    getExams,
    getExamTimetable,
    getTranscript,
    submitAssignment,
    submitExamResult,
    updateExam,
    uploadCourseContent,
} from '../controllers/examController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';

const router = express.Router();

// Student routes
router.get('/timetable', auth, getExamTimetable);
router.get('/results', auth, getExamResults);
router.get('/transcript', auth, getTranscript);
router.get('/assignments', auth, getAssignments);
router.post('/assignments/:id/submit', auth, submitAssignment);
router.get('/content', auth, getCourseContent);

// Admin routes
router.get('/', auth, requireRole('admin'), getExams);
router.get('/:id', auth, requireRole('admin'), getExamById);
router.post('/', auth, requireRole('admin'), createExam);
router.put('/:id', auth, requireRole('admin'), updateExam);
router.delete('/:id', auth, requireRole('admin'), deleteExam);
router.post('/:id/results', auth, requireRole('admin'), submitExamResult);
router.post('/assignments', auth, requireRole('admin'), createAssignment);
router.post('/content', auth, requireRole('admin'), uploadCourseContent);

export default router;