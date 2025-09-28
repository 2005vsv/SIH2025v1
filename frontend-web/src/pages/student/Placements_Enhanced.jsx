import { motion } from 'framer-motion';
import {
  ExternalLink
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { placementAPI } from '../../services/api';

// Helper function for status color
function getStatusColor(status) {
  switch (status) {
    case 'applied':
      return 'bg-yellow-100 text-yellow-800';
    case 'shortlisted':
      return 'bg-blue-100 text-blue-800';
    case 'selected':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

const StudentPlacements = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [showJobModal, setShowJobModal] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showInterviewModal, setShowInterviewModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      placementAPI.getJobs(),
      placementAPI.getMyApplications()
    ])
        .then(([jobsRes, applicationsRes]) => {
          // Correctly extract jobs and applications arrays from backend response
          setJobs(jobsRes.data.data?.jobs || []);
          setApplications(applicationsRes.data.data?.applications || []);
        })
      .catch((err) => {
        console.error('Placement API error:', err);
        toast.error('Failed to load placement data');
      })
      .finally(() => setLoading(false));
  }, []);
  // ...existing logic and functions...
  // Dummy canTakeInterview logic (replace with real logic as needed)
  const canTakeInterview = false;

  return (
    <div className="student-placements-wrapper">
      {/* ...existing header, tabs, etc... */}
      {activeTab === 'applications' && (
        <div className="applications-tab-wrapper">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {applications.map((application, index) => (
                <motion.div
                  key={application._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{application.jobTitle}</h3>
                    <div className="flex items-center mt-2">
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600">{application.company}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Applied Date:</span>
                        <span className="ml-1">{new Date(application.appliedDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Resume:</span>
                        <span className="ml-1">{application.resumeVersion}</span>
                      </div>
                    </div>
                    {application.interviewDetails && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Interview Scheduled</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                          <p>Date: {new Date(application.interviewDetails.date).toLocaleDateString()}</p>
                          <p>Time: {application.interviewDetails.time}</p>
                          <p>Mode: {application.interviewDetails.mode}</p>
                        </div>
                        {application.interviewDetails.instructions && (
                          <div className="mt-2 text-sm text-blue-700">
                            <span className="font-medium">Instructions:</span> {application.interviewDetails.instructions}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col gap-2 items-end">
                      {application.interviewDetails && application.interviewDetails.status === 'scheduled' && application.interviewDetails.meetingLink ? (
                        <button
                          onClick={() => window.open(application.interviewDetails.meetingLink, '_blank')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <ExternalLink className="h-4 w-4 mr-2 inline" /> Join Meeting
                        </button>
                      ) : null}
                      {canTakeInterview ? (
                        <button
                          onClick={() => setShowInterviewModal(application.interviewDetails)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Take Interview
                        </button>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
      {/* ...other tabs and content, all inside this parent div... */}
      {/* ...existing code for jobs, resumes, etc... */}
    </div>
  );
}

export default StudentPlacements;