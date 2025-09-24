import {
  GraduationCap,
  Calendar,
  BookOpen,
  FileText,
  Award,
  Clock,
  Download,
  Upload,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Star,
  TrendingUp,
  BarChart3,
  Target,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Send,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  PieChart,
  Calendar as CalendarIcon,
  Clock as ClockIcon
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const DEFAULT_SEMESTER = 6;
const DEFAULT_CREDITS = 4;
const DEFAULT_GRADE_POINT = 10;
const DEFAULT_MAX_MARKS = 100;
const DEFAULT_DURATION = 180;

const Academics = () => {
  const { user, updateUser } = useAuth();
  const [academicRecords, setAcademicRecords] = useState([]);
  const [examSchedule, setExamSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courseContent, setCourseContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grades');
  const [selectedSemester, setSelectedSemester] = useState(DEFAULT_SEMESTER);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(null);

  // Get current CGPA/SGPA from user profile or default values
  const currentCGPA = user?.profile?.cgpa ?? 0;
  const currentSGPA = user?.profile?.sgpa ?? 0;
  const totalCredits = 180;
  const completedCredits = 150;

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const userData = await response.json();
        if (userData.user && userData.user.profile) {
          await updateUser(userData.user);
        }
      }
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    fetchAcademicData();
    fetchUserProfile();
    // eslint-disable-next-line
  }, []);

  const fetchAcademicData = async () => {
    try {
      setLoading(true);
      setAcademicRecords([
        {
          semester: DEFAULT_SEMESTER,
          sgpa: 9.6,
          totalCredits,
          status: 'ongoing',
          subjects: [
            { _id: '1', name: 'Database Management Systems', code: 'CS601', credits: DEFAULT_CREDITS, grade: 'A+', gradePoint: DEFAULT_GRADE_POINT, semester: DEFAULT_SEMESTER, type: 'core', instructor: 'Dr. Smith', maxMarks: DEFAULT_MAX_MARKS, obtainedMarks: 95 },
            { _id: '2', name: 'Software Engineering', code: 'CS602', credits: DEFAULT_CREDITS, grade: 'A', gradePoint: 9, semester: DEFAULT_SEMESTER, type: 'core', instructor: 'Prof. Johnson', maxMarks: DEFAULT_MAX_MARKS, obtainedMarks: 88 },
            { _id: '3', name: 'Machine Learning', code: 'CS603', credits: DEFAULT_CREDITS, grade: 'A+', gradePoint: DEFAULT_GRADE_POINT, semester: DEFAULT_SEMESTER, type: 'elective', instructor: 'Dr. Davis', maxMarks: DEFAULT_MAX_MARKS, obtainedMarks: 92 },
            { _id: '4', name: 'Web Technologies', code: 'CS604', credits: DEFAULT_CREDITS, grade: 'A', gradePoint: 9, semester: DEFAULT_SEMESTER, type: 'elective', instructor: 'Prof. Wilson', maxMarks: DEFAULT_MAX_MARKS, obtainedMarks: 85 },
            { _id: '5', name: 'Project Work', code: 'CS691', credits: DEFAULT_CREDITS, grade: 'A+', gradePoint: DEFAULT_GRADE_POINT, semester: DEFAULT_SEMESTER, type: 'lab', instructor: 'Dr. Brown', maxMarks: DEFAULT_MAX_MARKS, obtainedMarks: 98 }
          ]
        },
        {
          semester: DEFAULT_SEMESTER - 1,
          sgpa: 8.8,
          totalCredits,
          status: 'completed',
          subjects: [
            { _id: '6', name: 'Computer Networks', code: 'CS501', credits: DEFAULT_CREDITS, grade: 'A', gradePoint: 9, semester: DEFAULT_SEMESTER - 1, type: 'core' },
            { _id: '7', name: 'Operating Systems', code: 'CS502', credits: DEFAULT_CREDITS, grade: 'A+', gradePoint: DEFAULT_GRADE_POINT, semester: DEFAULT_SEMESTER - 1, type: 'core' },
            { _id: '8', name: 'Compiler Design', code: 'CS503', credits: DEFAULT_CREDITS, grade: 'B+', gradePoint: 8, semester: DEFAULT_SEMESTER - 1, type: 'core' }
          ]
        }
      ]);

      setExamSchedule([
        {
          _id: '1',
          subjectId: '1',
          subjectName: 'Database Management Systems',
          subjectCode: 'CS601',
          examDate: '2024-02-15',
          startTime: '09:00',
          endTime: '12:00',
          duration: DEFAULT_DURATION,
          roomNumber: 'A-101',
          examType: 'end-term',
          instructions: 'Bring calculator and rough sheets',
          syllabusTopics: ['SQL Queries', 'Database Design', 'Normalization', 'Transactions']
        },
        {
          _id: '2',
          subjectId: '2',
          subjectName: 'Software Engineering',
          subjectCode: 'CS602',
          examDate: '2024-02-18',
          startTime: '14:00',
          endTime: '17:00',
          duration: DEFAULT_DURATION,
          roomNumber: 'B-205',
          examType: 'end-term',
          syllabusTopics: ['SDLC', 'Testing', 'Requirements Engineering', 'Design Patterns']
        }
      ]);

      setAssignments([
        {
          _id: '1',
          title: 'Database Design Project',
          description: 'Design and implement a complete database system for a library management system',
          subjectId: '1',
          subjectName: 'Database Management Systems',
          subjectCode: 'CS601',
          dueDate: '2024-02-10',
          maxMarks: DEFAULT_MAX_MARKS,
          status: 'submitted',
          submissionDate: '2024-02-08',
          obtainedMarks: 90,
          feedback: 'Excellent work on database normalization and query optimization'
        },
        {
          _id: '2',
          title: 'ML Algorithm Implementation',
          description: 'Implement and compare different machine learning algorithms on a given dataset',
          subjectId: '3',
          subjectName: 'Machine Learning',
          subjectCode: 'CS603',
          dueDate: '2024-02-20',
          maxMarks: DEFAULT_MAX_MARKS,
          status: 'pending'
        }
      ]);

      setCourseContent([
        {
          _id: '1',
          title: 'Introduction to Database Systems',
          description: 'Basic concepts of database management systems',
          subjectId: '1',
          subjectName: 'Database Management Systems',
          type: 'lecture',
          fileUrl: '/content/db-intro.pdf',
          uploadDate: '2024-01-15',
          downloadCount: 45
        },
        {
          _id: '2',
          title: 'SQL Tutorial Video',
          description: 'Comprehensive SQL tutorial covering basic to advanced concepts',
          subjectId: '1',
          subjectName: 'Database Management Systems',
          type: 'video',
          fileUrl: '/content/sql-tutorial.mp4',
          uploadDate: '2024-01-20',
          downloadCount: 67
        }
      ]);

    } catch (error) {
      toast.error('Failed to load academic data');
    } finally {
      setLoading(false);
    }
  };

  const submitAssignment = async (assignmentId, file) => {
    try {
      const updatedAssignments = assignments.map(assignment =>
        assignment._id === assignmentId
          ? { ...assignment, status: 'submitted', submissionDate: new Date().toISOString().split('T')[0] }
          : assignment
      );
      setAssignments(updatedAssignments);
      setShowSubmissionModal(null);
      toast.success('Assignment submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit assignment');
    }
  };

  const downloadTranscript = () => {
    toast.success('Transcript download started!');
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': return 'text-green-600 bg-green-100 border-green-200';
      case 'A': return 'text-green-600 bg-green-100 border-green-200';
      case 'B+': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'B': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'C+': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'C': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-red-600 bg-red-100 border-red-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': case 'graded': case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': case 'ongoing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': case 'graded': case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500 inline mr-1" />;
      case 'pending': case 'ongoing':
        return <Clock className="w-4 h-4 text-yellow-500 inline mr-1" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500 inline mr-1" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400 inline mr-1" />;
    }
  };

  const currentSemesterData = academicRecords.find(record => record.semester === selectedSemester);
  const filteredContent = courseContent.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-500" />
          Academic Management
        </h1>
        <div className="text-gray-500">Track grades, exams, assignments, and course content</div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center"
        >
          <div className="font-semibold text-gray-600 mb-1">Current CGPA</div>
          <div className="text-2xl font-bold">{currentCGPA}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center"
        >
          <div className="font-semibold text-gray-600 mb-1">Current SGPA</div>
          <div className="text-2xl font-bold">{currentSGPA}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center"
        >
          <div className="font-semibold text-gray-600 mb-1">Credits Completed</div>
          <div className="text-2xl font-bold">{completedCredits}/{totalCredits}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center"
        >
          <div className="font-semibold text-gray-600 mb-1">Pending Assignments</div>
          <div className="text-2xl font-bold">{assignments.filter(a => a.status === 'pending').length}</div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('grades')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'grades'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Grades & Transcript
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'exams'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Exam Timetable
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'assignments'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Assignments
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'content'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Course Content
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'grades' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Semester Selector and Actions */}
          <div className="flex items-center gap-4 mb-4">
            <div>
              <span className="font-semibold">Semester:</span>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="ml-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {academicRecords.map(record => (
                  <option key={record.semester} value={record.semester}>
                    Semester {record.semester}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowTranscriptModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="w-4 h-4 mr-1 inline" />
              Download Transcript
            </button>
          </div>

          {/* Grades Table */}
          {currentSemesterData && (
            <div className="overflow-x-auto">
              <div className="font-semibold mb-2">
                Semester {currentSemesterData.semester} - Grades
              </div>
              <div className="mb-2 text-sm text-gray-500">
                SGPA: {currentSemesterData.sgpa} | Credits: {currentSemesterData.totalCredits}
              </div>
              <table className="min-w-full bg-white border rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 text-left">Subject</th>
                    <th className="py-2 px-3 text-left">Code</th>
                    <th className="py-2 px-3 text-left">Credits</th>
                    <th className="py-2 px-3 text-left">Type</th>
                    <th className="py-2 px-3 text-left">Marks</th>
                    <th className="py-2 px-3 text-left">Grade</th>
                    <th className="py-2 px-3 text-left">Grade Point</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSemesterData.subjects.map((subject, index) => (
                    <tr key={subject._id} className="hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <span className="font-semibold">{subject.name}</span>
                        {subject.instructor && (
                          <span className="block text-xs text-gray-500">by {subject.instructor}</span>
                        )}
                      </td>
                      <td className="py-2 px-3">{subject.code}</td>
                      <td className="py-2 px-3">{subject.credits}</td>
                      <td className="py-2 px-3 capitalize">{subject.type}</td>
                      <td className="py-2 px-3">
                        {subject.obtainedMarks && subject.maxMarks
                          ? `${subject.obtainedMarks}/${subject.maxMarks}`
                          : 'N/A'}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getGradeColor(subject.grade)}`}>
                          {subject.grade}
                        </span>
                      </td>
                      <td className="py-2 px-3">{subject.gradePoint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Academic Progress Chart */}
          <div>
            <div className="font-semibold mb-2">Academic Progress</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="font-medium mb-1">Semester-wise SGPA</div>
                {academicRecords.map((record, index) => (
                  <div key={record.semester} className="mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-24">Semester {record.semester}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${(record.sgpa / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold">{record.sgpa}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div className="font-medium mb-1">Credit Progress</div>
                <div className="mb-1">Completed Credits: {completedCredits}/{totalCredits}</div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full"
                    style={{ width: `${(completedCredits / totalCredits) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((completedCredits / totalCredits) * 100)}% completed
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'exams' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="font-semibold mb-2">Upcoming Exams</div>
          <div className="mb-2 text-sm text-gray-500">{examSchedule.length} exams scheduled</div>
          {examSchedule.map((exam, index) => (
            <motion.div
              key={exam._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <span className="font-semibold">{exam.subjectName}</span>
                <span className="text-xs text-gray-500">{exam.subjectCode}</span>
                <span className="ml-auto px-2 py-1 rounded text-xs font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200">
                  {exam.examType.replace('-', ' ')}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-2">
                <span>
                  <CalendarIcon className="inline w-4 h-4 mr-1" />
                  {new Date(exam.examDate).toLocaleDateString()}
                </span>
                <span>
                  <ClockIcon className="inline w-4 h-4 mr-1" />
                  {exam.startTime} - {exam.endTime} ({exam.duration} mins)
                </span>
                <span>
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Room {exam.roomNumber}
                </span>
              </div>
              {exam.instructions && (
                <div className="text-xs text-gray-500 mb-1">
                  <span className="font-semibold">Instructions:</span> {exam.instructions}
                </div>
              )}
              {exam.syllabusTopics && exam.syllabusTopics.length > 0 && (
                <div className="text-xs text-gray-500">
                  <span className="font-semibold">Syllabus Topics:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {exam.syllabusTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {examSchedule.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <div className="font-semibold mb-1">No exams scheduled</div>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'assignments' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="font-semibold mb-2">Assignments</div>
          <div className="mb-2 text-sm text-gray-500">
            {assignments.filter(a => a.status === 'pending').length} pending assignments
          </div>
          {assignments.map((assignment, index) => (
            <motion.div
              key={assignment._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span className="font-semibold">{assignment.title}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(assignment.status)}`}>
                  {getStatusIcon(assignment.status)}
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </span>
              </div>
              <div className="mb-1 text-gray-700">{assignment.description}</div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                <span>
                  Subject: {assignment.subjectName} ({assignment.subjectCode})
                </span>
                <span>
                  Due Date: {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
                <span>
                  Max Marks: {assignment.maxMarks}
                </span>
                {assignment.obtainedMarks && (
                  <span>
                    Obtained: {assignment.obtainedMarks}/{assignment.maxMarks}
                  </span>
                )}
              </div>
              {assignment.feedback && (
                <div className="bg-gray-50 rounded p-2 text-xs mb-1">
                  <span className="font-semibold">Feedback:</span> {assignment.feedback}
                </div>
              )}
              {assignment.status === 'pending' && (
                <button
                  onClick={() => setShowSubmissionModal(assignment)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Upload className="w-4 h-4 mr-1 inline" />
                  Submit
                </button>
              )}
              {assignment.status === 'submitted' && (
                <div className="text-xs text-green-700 mt-2">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Submitted on {assignment.submissionDate && new Date(assignment.submissionDate).toLocaleDateString()}
                </div>
              )}
            </motion.div>
          ))}
          {assignments.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <div className="font-semibold mb-1">No assignments available</div>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'content' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search course content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredContent.map((content, index) => (
              <motion.div
                key={content._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  {content.type === 'lecture' && <BookOpen className="w-5 h-5 text-indigo-500" />}
                  {content.type === 'video' && <VideoIcon className="w-5 h-5 text-red-500" />}
                  {content.type === 'notes' && <FileText className="w-5 h-5 text-blue-500" />}
                  {content.type === 'assignment' && <Award className="w-5 h-5 text-green-500" />}
                  {content.type === 'quiz' && <Target className="w-5 h-5 text-orange-500" />}
                  <span className="font-semibold capitalize">{content.type}</span>
                </div>
                <div className="font-bold mb-1">{content.title}</div>
                <div className="text-gray-700 mb-1">{content.description}</div>
                <div className="text-xs text-gray-500 mb-2">{content.subjectName}</div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                  <span>
                    Uploaded: {new Date(content.uploadDate).toLocaleDateString()}
                  </span>
                  {content.downloadCount && (
                    <span>{content.downloadCount} downloads</span>
                  )}
                </div>
                <button
                  onClick={() => toast.success('Download started!')}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Download className="w-4 h-4 mr-1 inline" />
                  Download
                </button>
              </motion.div>
            ))}
          </div>
          {filteredContent.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <div className="font-semibold mb-1">No course content found</div>
            </div>
          )}
        </motion.div>
      )}

      {/* Assignment Submission Modal */}
      {showSubmissionModal && (
        <AssignmentSubmissionModal
          assignment={showSubmissionModal}
          onClose={() => setShowSubmissionModal(null)}
          onSubmit={submitAssignment}
        />
      )}

      {/* Transcript Modal */}
      {showTranscriptModal && (
        <TranscriptModal
          isOpen={showTranscriptModal}
          onClose={() => setShowTranscriptModal(false)}
          onDownload={downloadTranscript}
          academicRecords={academicRecords}
          cgpa={currentCGPA}
        />
      )}
    </div>
  );
};

// Helper icon for video
const VideoIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="3" y="5" width="15" height="14" rx="2" strokeWidth="2" />
    <polygon points="16,12 10,16 10,8" fill="currentColor" />
  </svg>
);

// Assignment Submission Modal Component
const AssignmentSubmissionModal = ({ assignment, onClose, onSubmit }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    onSubmit(assignment._id, selectedFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <motion.form
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <div className="text-xl font-bold mb-4">Submit Assignment</div>
        <div className="mb-2 font-semibold">{assignment.title}</div>
        <div className="mb-2 text-sm text-gray-500">{assignment.subjectName}</div>
        <div className="mb-2 text-xs text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Upload File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            accept=".pdf,.doc,.docx,.txt"
            required
          />
          <div className="text-xs text-gray-400 mt-1">Accepted formats: PDF, DOC, DOCX, TXT</div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>
        </div>
      </motion.form>
    </div>
  );
};

// Transcript Modal Component
const TranscriptModal = ({ isOpen, onClose, onDownload, academicRecords, cgpa }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <div className="text-2xl font-bold mb-4">Academic Transcript</div>
        {/* Student Info */}
        <div className="mb-4">
          <div className="font-semibold mb-1">Student Information</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Name:</span> John Doe
            </div>
            <div>
              <span className="font-medium">Student ID:</span> CS20210001
            </div>
            <div>
              <span className="font-medium">Program:</span> B.Tech Computer Science
            </div>
            <div>
              <span className="font-medium">CGPA:</span> {cgpa}
            </div>
          </div>
        </div>
        {/* Semester Records */}
        {academicRecords.map((record) => (
          <div key={record.semester} className="mb-6">
            <div className="font-semibold mb-1">
              Semester {record.semester}
              <span className="ml-2 text-xs text-gray-500">
                SGPA: {record.sgpa} | Credits: {record.totalCredits}
              </span>
            </div>
            <table className="min-w-full bg-white border rounded-lg mb-2">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-3 text-left">Subject</th>
                  <th className="py-2 px-3 text-left">Code</th>
                  <th className="py-2 px-3 text-left">Credits</th>
                  <th className="py-2 px-3 text-left">Grade</th>
                  <th className="py-2 px-3 text-left">Grade Points</th>
                </tr>
              </thead>
              <tbody>
                {record.subjects.map((subject) => (
                  <tr key={subject._id}>
                    <td className="py-2 px-3">{subject.name}</td>
                    <td className="py-2 px-3">{subject.code}</td>
                    <td className="py-2 px-3">{subject.credits}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${getGradeColor(subject.grade)}`}>
                        {subject.grade}
                      </span>
                    </td>
                    <td className="py-2 px-3">{subject.gradePoint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
          <button
            onClick={onDownload}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="w-4 h-4 mr-1 inline" />
            Download PDF
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Academics;