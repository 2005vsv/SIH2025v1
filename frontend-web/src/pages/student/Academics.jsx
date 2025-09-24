import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Award,
  FileText,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Academics = () => {
  const [activeTab, setActiveTab] = useState('subjects');
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    try {
      setLoading(true);
      setSubjects([
        {
          id: '1',
          name: 'Data Structures and Algorithms',
          code: 'CS301',
          credits: 4,
          instructor: 'Dr. Smith',
          schedule: ['Monday 10:00 AM', 'Wednesday 10:00 AM', 'Friday 10:00 AM'],
          attendance: 92,
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
          attendance: 84,
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
    } catch (error) {
      console.error('Failed to fetch academic data:', error);
      toast.error('Failed to load academic data');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': return 'text-green-700 bg-green-100';
      case 'A': return 'text-green-600 bg-green-50';
      case 'B+': return 'text-blue-700 bg-blue-100';
      case 'B': return 'text-blue-600 bg-blue-50';
      case 'C': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAttendanceColor = (attendance) => {
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
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-500" />
          Academics
        </h1>
        <div className="text-gray-500">Track your academic progress and performance</div>
      </motion.div>

      {/* Academic Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6 text-center"
        >
          <div className="font-semibold text-gray-600 mb-1">Current CGPA</div>
          <div className="text-2xl font-bold">8.6</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6 text-center"
        >
          <div className="font-semibold text-gray-600 mb-1">Credits Earned</div>
          <div className="text-2xl font-bold">152</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6 text-center"
        >
          <div className="font-semibold text-gray-600 mb-1">Avg Attendance</div>
          <div className="text-2xl font-bold">88%</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow p-6 text-center"
        >
          <div className="font-semibold text-gray-600 mb-1">Semester Rank</div>
          <div className="text-2xl font-bold">12</div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'subjects' && (
          <div className="space-y-4">
            {subjects.map((subject) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-lg">{subject.name}</span>
                    <span className="ml-2 text-gray-500">{subject.code} • {subject.credits} Credits</span>
                    <div className="text-sm text-gray-500">Instructor: {subject.instructor}</div>
                  </div>
                  {subject.grade && (
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${getGradeColor(subject.grade)}`}>
                      {subject.grade}
                    </span>
                  )}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Schedule:</span>
                  <ul className="list-disc ml-6">
                    {subject.schedule.map((time, idx) => (
                      <li key={idx}>{time}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold">Attendance:</span>
                  <span className={`ml-2 ${getAttendanceColor(subject.attendance)}`}>{subject.attendance}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="text-center text-gray-500 mt-8">
            <div className="font-semibold mb-1">No assignments available</div>
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
                <div className="font-bold text-lg mb-2">{exam.subject}</div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  <div>
                    <span className="font-semibold">Type:</span> {exam.type.charAt(0).toUpperCase() + exam.type.slice(1)}
                  </div>
                  <div>
                    <span className="font-semibold">Date:</span> {new Date(exam.date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold">Time:</span> {exam.time}
                  </div>
                  <div>
                    <span className="font-semibold">Venue:</span> {exam.venue}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="font-semibold text-gray-600 mb-1">Current Semester</div>
                <div className="text-sm">GPA: <span className="font-bold">8.8</span></div>
                <div className="text-sm">Credits: <span className="font-bold">24</span></div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="font-semibold text-gray-600 mb-1">Overall</div>
                <div className="text-sm">CGPA: <span className="font-bold">8.6</span></div>
                <div className="text-sm">Total Credits: <span className="font-bold">152</span></div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2">Subject Grades</div>
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between border-b py-2">
                    <div>
                      <span className="font-bold">{subject.name}</span>
                      <span className="ml-2 text-gray-500">{subject.code} • {subject.credits} Credits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= (subject.grade === 'A+' ? 5 : subject.grade === 'A' ? 4 : subject.grade === 'B+' ? 3 : subject.grade === 'B' ? 2 : 1) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill={star <= (subject.grade === 'A+' ? 5 : subject.grade === 'A' ? 4 : subject.grade === 'B+' ? 3 : subject.grade === 'B' ? 2 : 1) ? 'currentColor' : 'none'}
                        />
                      ))}
                      {subject.grade && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getGradeColor(subject.grade)}`}>
                          {subject.grade}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Academics;