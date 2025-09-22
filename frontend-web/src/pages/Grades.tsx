import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  grade: string;
  gradePoint: number;
  semester: number;
  type: 'core' | 'elective' | 'lab';
}

const Grades: React.FC = () => {
  const [selectedSemester] = useState<number>(6);
  const [subjects] = useState<Subject[]>([
    { id: '1', name: 'Database Management Systems', code: 'CS601', credits: 4, grade: 'A+', gradePoint: 10, semester: 6, type: 'core' },
    { id: '2', name: 'Software Engineering', code: 'CS602', credits: 3, grade: 'A', gradePoint: 9, semester: 6, type: 'core' },
    { id: '3', name: 'Machine Learning', code: 'CS603', credits: 4, grade: 'A+', gradePoint: 10, semester: 6, type: 'elective' },
    { id: '4', name: 'Web Technologies', code: 'CS604', credits: 3, grade: 'A', gradePoint: 9, semester: 6, type: 'elective' },
    { id: '5', name: 'Project Work', code: 'CS691', credits: 2, grade: 'A+', gradePoint: 10, semester: 6, type: 'lab' }
  ]);

  const cgpa = 8.5;
  const sgpa = 9.6;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-green-600 bg-green-100';
      case 'A': return 'text-green-600 bg-green-100';
      case 'B+': return 'text-blue-600 bg-blue-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Academic Grades</h1>
            <p className="text-gray-600 text-lg">Track your academic performance</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Overall CGPA</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{cgpa}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Current SGPA</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{sgpa}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Credits</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">16</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Semester {selectedSemester} - Grades
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{subject.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{subject.credits}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(subject.grade)}`}>
                        {subject.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grades;