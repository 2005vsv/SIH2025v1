import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  FileText,
  Download,
  Eye,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  instructor: string;
  schedule: string[];
  attendance: number;
  grade?: string;
  assignments: Assignment[];
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  marks?: number;
  totalMarks: number;
}

interface Exam {
  id: string;
  subject: string;
  type: 'midterm' | 'final' | 'quiz';
  date: string;
  time: string;
  duration: string;
  venue: string;
  syllabus?: string;
}

const Academics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subjects' | 'assignments' | 'exams' | 'grades'>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setSubjects([
        {
          id: '1',
          name: 'Data Structures and Algorithms',
          code: 'CS301',
          credits: 4,
          instructor: 'Dr. Smith',
          schedule: ['Monday 10:00 AM', 'Wednesday 10:00 AM', 'Friday 10:00 AM'],
          attendance: 85,
          grade: 'A',
          assignments: [
            {
              id: '1',
              title: 'Binary Tree Implementation',
              dueDate: '2025-09-30',
              status: 'submitted',
              marks: 18,
              totalMarks: 20
            }
          ]
        },
        {
          id: '2',
          name: 'Database Management Systems',
          code: 'CS302',
          credits: 3,
          instructor: 'Prof. Johnson',
          schedule: ['Tuesday 2:00 PM', 'Thursday 2:00 PM'],
          attendance: 92,
          grade: 'A+',
          assignments: []
        }
      ]);

      setExams([
        {
          id: '1',
          subject: 'Data Structures and Algorithms',
          type: 'midterm',
          date: '2025-10-15',
          time: '10:00 AM',
          duration: '3 hours',
          venue: 'Room 101'
        },
        {
          id: '2',
          subject: 'Database Management Systems',
          type: 'final',
          date: '2025-12-10',
          time: '2:00 PM',
          duration: '3 hours',
          venue: 'Room 205'
        }
      ]);

    } catch (error: any) {
      console.error('Failed to fetch academic data:', error);
      toast.error('Failed to load academic data');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-green-700 bg-green-100';
      case 'A': return 'text-green-600 bg-green-50';
      case 'B+': return 'text-blue-700 bg-blue-100';
      case 'B': return 'text-blue-600 bg-blue-50';
      case 'C': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return 'text-green-600';
    if (attendance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const tabs = [
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'exams', label: 'Exams', icon: Calendar },
    { id: 'grades', label: 'Grades', icon: Award }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Academics</h1>
          <p className="mt-2 text-gray-600">Track your academic progress and performance</p>
        </motion.div>

        {/* Academic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current CGPA</p>
                <p className="text-2xl font-bold text-gray-900">8.6</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Credits Earned</p>
                <p className="text-2xl font-bold text-gray-900">152</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                <p className="text-2xl font-bold text-gray-900">88%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <Award className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Semester Rank</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'subjects' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {subjects.map((subject) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                        <p className="text-sm text-gray-600">{subject.code} • {subject.credits} Credits</p>
                        <p className="text-sm text-gray-600">Instructor: {subject.instructor}</p>
                      </div>
                      {subject.grade && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(subject.grade)}`}>
                          {subject.grade}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Schedule:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {subject.schedule.map((time, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Attendance:</span>
                        <span className={`text-sm font-medium ${getAttendanceColor(subject.attendance)}`}>
                          {subject.attendance}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No assignments available</p>
                </div>
              </div>
            )}

            {activeTab === 'exams' && (
              <div className="space-y-4">
                {exams.map((exam) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{exam.subject}</h3>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Type:</span>
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
                              {exam.type}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <span className="ml-2 font-medium">{new Date(exam.date).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Time:</span>
                            <span className="ml-2 font-medium">{exam.time}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Venue:</span>
                            <span className="ml-2 font-medium">{exam.venue}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'grades' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Current Semester</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>GPA:</span>
                        <span className="font-bold">8.8</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Credits:</span>
                        <span className="font-bold">24</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Overall</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>CGPA:</span>
                        <span className="font-bold">8.6</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Credits:</span>
                        <span className="font-bold">152</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Subject Grades</h3>
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{subject.name}</h4>
                        <p className="text-sm text-gray-600">{subject.code} • {subject.credits} Credits</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        {subject.grade && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(subject.grade)}`}>
                            {subject.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Academics;