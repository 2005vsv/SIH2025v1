import { Award, Briefcase, Building2, Calendar, Clock, Filter, MapPin, Search, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Company {
  _id: string;
  name: string;
  description: string;
  website: string;
  location: string;
  industry: string;
}

interface PlacementOpportunity {
  _id: string;
  companyId: Company;
  title: string;
  description: string;
  requirements: string[];
  salary: {
    min: number;
    max: number;
  };
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  deadline: string;
  status: 'open' | 'closed' | 'filled';
  eligibilityCriteria: {
    minCGPA: number;
    allowedBranches: string[];
    passingYear: number;
  };
}

interface PlacementApplication {
  _id: string;
  opportunityId: PlacementOpportunity;
  status: 'pending' | 'shortlisted' | 'rejected' | 'selected';
  appliedAt: string;
  interviewDate?: string;
  feedback?: string;
}

interface PlacementStats {
  totalOpportunities: number;
  appliedCount: number;
  shortlistedCount: number;
  selectedCount: number;
  averagePackage: number;
  placementRate: number;
}

const StudentPlacements: React.FC = () => {
  const [opportunities, setOpportunities] = useState<PlacementOpportunity[]>([]);
  const [applications, setApplications] = useState<PlacementApplication[]>([]);
  const [stats, setStats] = useState<PlacementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'opportunities' | 'applications' | 'companies'>('opportunities');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'full-time' | 'part-time' | 'internship' | 'contract'>('all');
  const [companies, setCompanies] = useState<Company[]>([]);

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
          salary: { min: 6, max: 10 },
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
        totalOpportunities: 25,
        appliedCount: 5,
        shortlistedCount: 2,
        selectedCount: 1,
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

  const handleApplyToOpportunity = async (opportunityId: string) => {
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

  const isApplied = (opportunityId: string) => {
    return applications.some(app => app.opportunityId._id === opportunityId);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      shortlisted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      selected: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      filled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full-time': return <Briefcase className="h-4 w-4" />;
      case 'part-time': return <Clock className="h-4 w-4" />;
      case 'internship': return <Award className="h-4 w-4" />;
      case 'contract': return <Users className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Placements</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Explore job opportunities and track your applications
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Jobs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOpportunities}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.appliedCount}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Package</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.averagePackage}L</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Placement Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.placementRate}%</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
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

          {activeTab === 'opportunities' && (
            <div className="p-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search opportunities..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400 h-4 w-4" />
                  <select
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                  >
                    <option value="all">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
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
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {opportunity.title}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            {getTypeIcon(opportunity.type)}
                            <span className="capitalize">{opportunity.type.replace('-', ' ')}</span>
                          </div>
                        </div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {opportunity.companyId.name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{opportunity.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{opportunity.description}</p>
                        
                        {/* Salary Range */}
                        <div className="mb-4">
                          <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                            ₹{opportunity.salary.min}L - ₹{opportunity.salary.max}L
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">per annum</span>
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
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  +{opportunity.requirements.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Eligibility */}
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Eligibility:</p>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Min CGPA: {opportunity.eligibilityCriteria.minCGPA} | 
                            Passing Year: {opportunity.eligibilityCriteria.passingYear} | 
                            Branches: {opportunity.eligibilityCriteria.allowedBranches.join(', ')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(opportunity.status)}`}>
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
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No opportunities found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="p-6">
              <div className="space-y-4">
                {applications.map((application) => (
                  <motion.div
                    key={application._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {application.opportunityId.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {application.opportunityId.companyId.name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                          {application.interviewDate && (
                            <span>Interview: {new Date(application.interviewDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        {application.feedback && (
                          <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Feedback:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{application.feedback}</p>
                          </div>
                        )}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {applications.length === 0 && (
                <div className="text-center py-12">
                  <Award className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No applications yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Browse opportunities and apply to start your placement journey!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <motion.div
                    key={company._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {company.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <Building2 className="h-4 w-4" />
                          <span>{company.industry}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <MapPin className="h-4 w-4" />
                          <span>{company.location}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {company.description}
                        </p>
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
                  <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No companies listed</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Companies will appear here when they start posting opportunities.
                  </p>
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