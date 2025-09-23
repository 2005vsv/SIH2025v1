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
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Subject {
  _id: string;
  name: string;
  code: string;
  credits: number;
  grade: string;
  gradePoint: number;
  semester: number;
  type: 'core' | 'elective' | 'lab';
  instructor?: string;
  maxMarks?: number;
  obtainedMarks?: number;
}

interface ExamSchedule {
  _id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  roomNumber: string;
  examType: 'mid-term' | 'end-term' | 'quiz' | 'practical';
  instructions?: string;
  syllabusTopics?: string[];
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  dueDate: string;
  maxMarks: number;
  submissionDate?: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  obtainedMarks?: number;
  feedback?: string;
  attachments?: string[];
}

interface CourseContent {
  _id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  type: 'lecture' | 'notes' | 'video' | 'assignment' | 'quiz';
  fileUrl?: string;
  uploadDate: string;
  downloadCount?: number;
}

interface AcademicRecord {
  semester: number;
  subjects: Subject[];
  sgpa: number;
  totalCredits: number;
  status: 'completed' | 'ongoing';
}

const StudentAcademics: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [examSchedule, setExamSchedule] = useState<ExamSchedule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courseContent, setCourseContent] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'grades' | 'exams' | 'assignments' | 'content'>('grades');
  const [selectedSemester, setSelectedSemester] = useState<number>(6);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState<Assignment | null>(null);

  // Get current CGPA/SGPA from user profile or default values
  const currentCGPA = user?.profile?.cgpa ?? 0;
  const currentSGPA = user?.profile?.sgpa ?? 0;
  const totalCredits = 180;
  const completedCredits = 150;

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Academics - No token found for profile fetch');
        return;
      }

      console.log('Academics - Fetching user profile for CGPA/SGPA...');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Academics - Fresh profile data:', userData);
        
        if (userData.user && userData.user.profile) {
          console.log('Academics - Updating user context with fresh profile data...');
          // Update the AuthContext with fresh data
          await updateUser(userData.user);
        }
      } else {
        console.error('Academics - Failed to fetch profile:', response.status);
      }
    } catch (error) {
      console.error('Academics - Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    fetchAcademicData();
    // Fetch fresh profile data when component mounts
    fetchUserProfile();
  }, []);

  const fetchAcademicData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setAcademicRecords([
        {
          semester: 6,
          sgpa: 9.6,
          totalCredits: 22,
          status: 'ongoing',
          subjects: [
            { _id: '1', name: 'Database Management Systems', code: 'CS601', credits: 4, grade: 'A+', gradePoint: 10, semester: 6, type: 'core', instructor: 'Dr. Smith', maxMarks: 100, obtainedMarks: 95 },
            { _id: '2', name: 'Software Engineering', code: 'CS602', credits: 3, grade: 'A', gradePoint: 9, semester: 6, type: 'core', instructor: 'Prof. Johnson', maxMarks: 100, obtainedMarks: 88 },
            { _id: '3', name: 'Machine Learning', code: 'CS603', credits: 4, grade: 'A+', gradePoint: 10, semester: 6, type: 'elective', instructor: 'Dr. Davis', maxMarks: 100, obtainedMarks: 92 },
            { _id: '4', name: 'Web Technologies', code: 'CS604', credits: 3, grade: 'A', gradePoint: 9, semester: 6, type: 'elective', instructor: 'Prof. Wilson', maxMarks: 100, obtainedMarks: 85 },
            { _id: '5', name: 'Project Work', code: 'CS691', credits: 2, grade: 'A+', gradePoint: 10, semester: 6, type: 'lab', instructor: 'Dr. Brown', maxMarks: 100, obtainedMarks: 98 }
          ]
        },
        {
          semester: 5,
          sgpa: 8.8,
          totalCredits: 20,
          status: 'completed',
          subjects: [
            { _id: '6', name: 'Computer Networks', code: 'CS501', credits: 4, grade: 'A', gradePoint: 9, semester: 5, type: 'core' },
            { _id: '7', name: 'Operating Systems', code: 'CS502', credits: 4, grade: 'A+', gradePoint: 10, semester: 5, type: 'core' },
            { _id: '8', name: 'Compiler Design', code: 'CS503', credits: 3, grade: 'B+', gradePoint: 8, semester: 5, type: 'core' }
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
          duration: 180,
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
          duration: 180,
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
          maxMarks: 100,
          status: 'submitted',
          submissionDate: '2024-02-08',
          obtainedMarks: 95,
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
          maxMarks: 100,
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
      console.error('Error fetching academic data:', error);
      toast.error('Failed to load academic data');
    } finally {
      setLoading(false);
    }
  };

  const submitAssignment = async (assignmentId: string, file: File) => {
    try {
      // Mock API call for assignment submission
      const updatedAssignments = assignments.map(assignment => 
        assignment._id === assignmentId 
          ? { ...assignment, status: 'submitted' as const, submissionDate: new Date().toISOString().split('T')[0] }
          : assignment
      );
      setAssignments(updatedAssignments);
      setShowSubmissionModal(null);
      toast.success('Assignment submitted successfully!');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    }
  };

  const downloadTranscript = () => {
    toast.success('Transcript download started!');
    // In a real implementation, this would trigger a PDF download
  };

  const getGradeColor = (grade: string) => {
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

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': case 'graded': case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending': case 'ongoing':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const currentSemesterData = academicRecords.find(record => record.semester === selectedSemester);
  const filteredContent = courseContent.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Academic Management</h1>
          <p className="text-gray-600">Track grades, exams, assignments, and course content</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100">
                <GraduationCap className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current CGPA</p>
                <p className="text-2xl font-bold text-gray-900">{currentCGPA}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current SGPA</p>
                <p className="text-2xl font-bold text-gray-900">{currentSGPA}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-pink-100">
                <Target className="w-8 h-8 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Credits Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedCredits}/{totalCredits}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignments.filter(a => a.status === 'pending').length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
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
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'grades' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Semester Selector and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Semester:</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                <Download className="w-4 h-4 mr-2 inline" />
                Download Transcript
              </button>
            </div>

            {/* Grades Table */}
            {currentSemesterData && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Semester {currentSemesterData.semester} - Grades
                    </h2>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-600">SGPA: <span className="font-semibold text-indigo-600">{currentSemesterData.sgpa}</span></span>
                      <span className="text-gray-600">Credits: <span className="font-semibold">{currentSemesterData.totalCredits}</span></span>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Point</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentSemesterData.subjects.map((subject, index) => (
                        <motion.tr
                          key={subject._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                              {subject.instructor && (
                                <div className="text-sm text-gray-500">by {subject.instructor}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.code}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.credits}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
                              {subject.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {subject.obtainedMarks && subject.maxMarks ? (
                              `${subject.obtainedMarks}/${subject.maxMarks}`
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getGradeColor(subject.grade)}`}>
                              {subject.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {subject.gradePoint}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Academic Progress Chart */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Progress</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Semester-wise SGPA</h4>
                  {academicRecords.map((record, index) => (
                    <div key={record.semester} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">Semester {record.semester}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${(record.sgpa / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-indigo-600">{record.sgpa}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Credit Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completed Credits</span>
                      <span>{completedCredits}/{totalCredits}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full" 
                        style={{ width: `${(completedCredits / totalCredits) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((completedCredits / totalCredits) * 100)}% completed
                    </div>
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Exams</h2>
              <div className="text-sm text-gray-600">
                {examSchedule.length} exams scheduled
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {examSchedule.map((exam, index) => (
                <motion.div
                  key={exam._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{exam.subjectName}</h3>
                      <p className="text-gray-600">{exam.subjectCode}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 capitalize">
                      {exam.examType.replace('-', ' ')}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(exam.examDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{exam.startTime} - {exam.endTime} ({exam.duration} mins)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Room {exam.roomNumber}</span>
                    </div>
                  </div>

                  {exam.instructions && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Instructions:</strong> {exam.instructions}
                      </p>
                    </div>
                  )}

                  {exam.syllabusTopics && exam.syllabusTopics.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Syllabus Topics:</h4>
                      <div className="flex flex-wrap gap-1">
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
            </div>

            {examSchedule.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No exams scheduled</p>
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
              <div className="text-sm text-gray-600">
                {assignments.filter(a => a.status === 'pending').length} pending assignments
              </div>
            </div>

            <div className="space-y-4">
              {assignments.map((assignment, index) => (
                <motion.div
                  key={assignment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(assignment.status)}`}>
                          {getStatusIcon(assignment.status)}
                          <span className="ml-1 capitalize">{assignment.status}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{assignment.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Subject:</span>
                          <div>{assignment.subjectName} ({assignment.subjectCode})</div>
                        </div>
                        <div>
                          <span className="font-medium">Due Date:</span>
                          <div>{new Date(assignment.dueDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="font-medium">Max Marks:</span>
                          <div>{assignment.maxMarks}</div>
                        </div>
                        {assignment.obtainedMarks && (
                          <div>
                            <span className="font-medium">Obtained:</span>
                            <div className="text-indigo-600 font-semibold">{assignment.obtainedMarks}/{assignment.maxMarks}</div>
                          </div>
                        )}
                      </div>
                      {assignment.feedback && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Feedback:</strong> {assignment.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      {assignment.status === 'pending' && (
                        <button
                          onClick={() => setShowSubmissionModal(assignment)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Upload className="w-4 h-4 mr-2 inline" />
                          Submit
                        </button>
                      )}
                      {assignment.status === 'submitted' && (
                        <div className="text-center">
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">
                            Submitted on {assignment.submissionDate && new Date(assignment.submissionDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {assignments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No assignments available</p>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search course content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((content, index) => (
                <motion.div
                  key={content._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-indigo-100">
                      {content.type === 'lecture' && <BookOpen className="w-6 h-6 text-indigo-600" />}
                      {content.type === 'video' && <Eye className="w-6 h-6 text-indigo-600" />}
                      {content.type === 'notes' && <FileText className="w-6 h-6 text-indigo-600" />}
                      {content.type === 'assignment' && <Edit className="w-6 h-6 text-indigo-600" />}
                      {content.type === 'quiz' && <Target className="w-6 h-6 text-indigo-600" />}
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
                      {content.type}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{content.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{content.description}</p>
                  <p className="text-xs text-gray-500 mb-4">{content.subjectName}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Uploaded: {new Date(content.uploadDate).toLocaleDateString()}</span>
                    {content.downloadCount && (
                      <span>{content.downloadCount} downloads</span>
                    )}
                  </div>

                  <button
                    onClick={() => toast.success('Download started!')}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Download className="w-4 h-4 mr-2 inline" />
                    Download
                  </button>
                </motion.div>
              ))}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No course content found</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Assignment Submission Modal */}
      <AnimatePresence>
        {showSubmissionModal && (
          <AssignmentSubmissionModal
            assignment={showSubmissionModal}
            onClose={() => setShowSubmissionModal(null)}
            onSubmit={submitAssignment}
          />
        )}
      </AnimatePresence>

      {/* Transcript Modal */}
      <AnimatePresence>
        {showTranscriptModal && (
          <TranscriptModal
            isOpen={showTranscriptModal}
            onClose={() => setShowTranscriptModal(false)}
            onDownload={downloadTranscript}
            academicRecords={academicRecords}
            cgpa={currentCGPA}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Assignment Submission Modal Component
const AssignmentSubmissionModal: React.FC<{
  assignment: Assignment;
  onClose: () => void;
  onSubmit: (assignmentId: string, file: File) => void;
}> = ({ assignment, onClose, onSubmit }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    onSubmit(assignment._id, selectedFile);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Submit Assignment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900">{assignment.title}</h4>
          <p className="text-sm text-gray-600">{assignment.subjectName}</p>
          <p className="text-sm text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              accept=".pdf,.doc,.docx,.txt"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: PDF, DOC, DOCX, TXT
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
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
        </form>
      </motion.div>
    </div>
  );
};

// Transcript Modal Component
const TranscriptModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  academicRecords: AcademicRecord[];
  cgpa: number;
}> = ({ isOpen, onClose, onDownload, academicRecords, cgpa }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Academic Transcript</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2">John Doe</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Student ID:</span>
                <span className="ml-2">CS20210001</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Program:</span>
                <span className="ml-2">B.Tech Computer Science</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">CGPA:</span>
                <span className="ml-2 font-semibold text-indigo-600">{cgpa}</span>
              </div>
            </div>
          </div>

          {/* Semester Records */}
          {academicRecords.map((record) => (
            <div key={record.semester} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Semester {record.semester}</h4>
                <div className="text-sm text-gray-600">
                  SGPA: <span className="font-semibold">{record.sgpa}</span> | 
                  Credits: <span className="font-semibold">{record.totalCredits}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Subject</th>
                      <th className="text-left py-2">Code</th>
                      <th className="text-left py-2">Credits</th>
                      <th className="text-left py-2">Grade</th>
                      <th className="text-left py-2">Grade Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.subjects.map((subject) => (
                      <tr key={subject._id} className="border-b border-gray-100">
                        <td className="py-2">{subject.name}</td>
                        <td className="py-2">{subject.code}</td>
                        <td className="py-2">{subject.credits}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getGradeColor(subject.grade)}`}>
                            {subject.grade}
                          </span>
                        </td>
                        <td className="py-2">{subject.gradePoint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="flex space-x-3 pt-4">
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
              <Download className="w-4 h-4 mr-2 inline" />
              Download PDF
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Helper function to get grade colors
const getGradeColor = (grade: string) => {
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

export default StudentAcademics;