import { motion } from 'framer-motion';
import { Award, Briefcase, Building2, Calendar, Clock, MapPin, Search, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const StudentPlacements = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('opportunities');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchPlacementData();
  }, []);

  const fetchPlacementData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Mock data for development
      setOpportunities([
        {
          _id: '1',
          companyId: {
            _id: '1',
            name: 'TechCorp Solutions',
            description: 'Leading technology company',
            website: 'https://techcorp.com',
            location: 'Bangalore',
            industry: 'Software'
          },
          title: 'Software Engineer',
          description: 'Develop cutting-edge software solutions',
          requirements: ['JavaScript', 'React', 'Node.js'],
          salary: { min, max: 10 },
          location: 'Bangalore',
          type: 'full-time',
          deadline: '2025-10-15',
          status: 'open',
          eligibilityCriteria: {
            minCGPA: 7.0,
            allowedBranches: ['CSE', 'IT'],
            passingYear: 2025
          }
        }
      ]);
      
      setApplications([]);
      setStats({
        totalOpportunities,
        appliedCount,
        shortlistedCount,
        selectedCount,
        averagePackage: 8.5,
        placementRate: 85
      });
      
      setCompanies([
        {
          _id: '1',
          name: 'TechCorp Solutions',
          description: 'Leading technology company',
          website: 'https://techcorp.com',
          location: 'Bangalore',
          industry: 'Software'
        }
      ]);
    } catch (error) {
      console.error('Error fetching placement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToOpportunity = async (opportunityId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/placements/apply/${opportunityId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        fetchPlacementData();
        alert('Application submitted successfully!');
      } else {
        alert(data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error applying to opportunity:', error);
      alert('Failed to submit application');
    }
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.companyId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || opportunity.type === filterType;
    return matchesSearch && matchesType && opportunity.status === 'open';
  });

  const isApplied = (opportunityId) => {
    return applications.some(app => app.opportunityId._id === opportunityId);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      shortlisted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      selected: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      filled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return colors[status] || colors.pending;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'full-time': return <Briefcase className="w-4 h-4" />;
      case 'part-time': return <Clock className="w-4 h-4" />;
      case 'internship': return <Users className="w-4 h-4" />;
      case 'contract': return <Calendar className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Placements</h1>
        <p className="text-blue-100">Explore job opportunities and track your applications</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Available Jobs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOpportunities}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Applications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.appliedCount}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Avg. Package</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.averagePackage}L</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Placement Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.placementRate}%</p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'opportunities'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Job Opportunities ({filteredOpportunities.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              My Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'companies'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Companies ({companies.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'opportunities' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search opportunities..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              {/* Opportunities Grid */}
              <div className="grid gap-6">
                {filteredOpportunities.map((opportunity) => (
                  <motion.div
                    key={opportunity._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {opportunity.title}
                          </h3>
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                            {getTypeIcon(opportunity.type)}
                            {opportunity.type.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                          {opportunity.companyId.name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {opportunity.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{opportunity.description}</p>
                        
                        {/* Salary Range */}
                        <div className="mb-4">
                          <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                            ₹{opportunity.salary.min}L - ₹{opportunity.salary.max}L
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">per annum</span>
                        </div>

                        {/* Requirements */}
                        {opportunity.requirements.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Requirements:</p>
                            <div className="flex flex-wrap gap-2">
                              {opportunity.requirements.slice(0, 3).map((req, index) => (
                                <span
                                  key={index}
                                  className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded"
                                >
                                  {req}
                                </span>
                              ))}
                              {opportunity.requirements.length > 3 && (
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  +{opportunity.requirements.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                          {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
                        </span>
                        <button
                          onClick={() => handleApplyToOpportunity(opportunity._id)}
                          disabled={isApplied(opportunity._id) || opportunity.status !== 'open'}
                          className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
                            isApplied(opportunity._id) || opportunity.status !== 'open'
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                          }`}
                        >
                          {isApplied(opportunity._id) ? 'Applied' : 'Apply Now'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredOpportunities.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No opportunities found</p>
                  <p className="text-gray-500 dark:text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div className="grid gap-6">
                {applications.map((application) => (
                  <motion.div
                    key={application._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {application.opportunityId.title}
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                          {application.opportunityId.companyId.name}
                        </p>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>Applied: {new Date(application.appliedAt).toLocaleDateString()}</p>
                          {application.interviewDate && (
                            <p>Interview: {new Date(application.interviewDate).toLocaleDateString()}</p>
                          )}
                        </div>
                        {application.feedback && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Feedback:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{application.feedback}</p>
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {applications.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No applications yet</p>
                  <p className="text-gray-500 dark:text-gray-500">Browse opportunities and apply to start your placement journey!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="space-y-6">
              <div className="grid gap-6">
                {companies.map((company) => (
                  <motion.div
                    key={company._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {company.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {company.industry}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {company.location}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{company.description}</p>
                      </div>
                    </div>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Visit Website →
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>

              {companies.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No companies listed</p>
                  <p className="text-gray-500 dark:text-gray-500">Companies will appear here when they start posting opportunities.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPlacements;
