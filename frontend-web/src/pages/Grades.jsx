import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Grades = () => {
  const { user } = useAuth();
  const [selectedSemester] = useState(6);
  const [subjects] = useState([
    { id: '1', name: 'Database Management Systems', code: 'CS601', credits: 4, grade: 'A+', gradePoint: 10, semester: 6, type: 'core' },
    { id: '2', name: 'Software Engineering', code: 'CS602', credits: 3, grade: 'A', gradePoint: 9, semester: 6, type: 'core' },
    { id: '3', name: 'Machine Learning', code: 'CS603', credits: 4, grade: 'A+', gradePoint: 10, semester: 6, type: 'elective' },
    { id: '4', name: 'Web Technologies', code: 'CS604', credits: 3, grade: 'A', gradePoint: 9, semester: 6, type: 'elective' },
    { id: '5', name: 'Project Work', code: 'CS691', credits: 2, grade: 'A+', gradePoint: 10, semester: 6, type: 'lab' }
  ]);

  const cgpa = user?.profile?.cgpa || 0;
  const sgpa = user?.profile?.sgpa || 0;

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': return 'text-green-600 bg-green-100';
      case 'A': return 'text-green-600 bg-green-100';
      case 'B+': return 'text-blue-600 bg-blue-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
  <div className="p-6 space-y-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Academic Grades
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your academic performance
          </p>
        </motion.div>
      </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Overall CGPA
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{cgpa}</div>
        </div>
        
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
            Current SGPA
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{sgpa}</div>
        </div>
        
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            Total Credits
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">156</div>
        </div>
      </div>

  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
  <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Semester {selectedSemester} Grades
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {subject.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {subject.code}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {subject.credits}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(subject.grade)}`}>
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
