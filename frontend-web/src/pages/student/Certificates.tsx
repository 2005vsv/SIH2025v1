import { Award, Calendar, Download, FileText, Search, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Certificate {
  _id: string;
  title: string;
  description: string;
  type: 'academic' | 'achievement' | 'participation' | 'completion' | 'merit';
  issuedBy: string;
  issuedDate: string;
  validUntil?: string;
  certificateUrl?: string;
  verificationCode: string;
  status: 'pending' | 'issued' | 'rejected';
  metadata?: {
    course?: string;
    grade?: string;
    cgpa?: number;
    rank?: number;
    event?: string;
  };
}

interface CertificateRequest {
  _id: string;
  certificateType: Certificate['type'];
  title: string;
  description: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

const StudentCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificateRequests, setCertificateRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | Certificate['type']>('all');
  const [activeTab, setActiveTab] = useState<'certificates' | 'requests'>('certificates');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    certificateType: 'academic' as Certificate['type'],
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchCertificateData();
  }, []);

  const fetchCertificateData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Fetch certificates
      const certificatesResponse = await fetch('/api/certificates/my-certificates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const certificatesData = await certificatesResponse.json();
      if (certificatesData.success) {
        setCertificates(certificatesData.data);
      }

      // Fetch certificate requests
      const requestsResponse = await fetch('/api/certificates/my-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const requestsData = await requestsResponse.json();
      if (requestsData.success) {
        setCertificateRequests(requestsData.data);
      }
    } catch (error) {
      console.error('Error fetching certificate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/certificates/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestForm),
      });
      const data = await response.json();
      if (data.success) {
        fetchCertificateData();
        setShowRequestForm(false);
        setRequestForm({ certificateType: 'academic', title: '', description: '' });
        alert('Certificate request submitted successfully!');
      } else {
        alert(data.message || 'Failed to submit certificate request');
      }
    } catch (error) {
      console.error('Error submitting certificate request:', error);
      alert('Failed to submit certificate request');
    }
  };

  const handleDownloadCertificate = async (certificateId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/certificates/download/${certificateId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificateId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download certificate');
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate');
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.issuedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || cert.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      achievement: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      participation: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      completion: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      merit: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[type as keyof typeof colors] || colors.academic;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      issued: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
    return colors[status as keyof typeof colors] || colors.pending;
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

  const stats = {
    totalCertificates: certificates.length,
    issuedCertificates: certificates.filter(c => c.status === 'issued').length,
    pendingRequests: certificateRequests.filter(r => r.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Certificates</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your academic certificates and achievements
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Certificates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCertificates}</p>
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
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Issued</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.issuedCertificates}</p>
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
                <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingRequests}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('certificates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'certificates'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                My Certificates ({stats.totalCertificates})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Certificate Requests ({certificateRequests.length})
              </button>
            </nav>
          </div>

          {activeTab === 'certificates' && (
            <div className="p-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search certificates..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                >
                  <option value="all">All Types</option>
                  <option value="academic">Academic</option>
                  <option value="achievement">Achievement</option>
                  <option value="participation">Participation</option>
                  <option value="completion">Completion</option>
                  <option value="merit">Merit</option>
                </select>
              </div>

              {/* Certificates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCertificates.map((certificate) => (
                  <motion.div
                    key={certificate._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-5 w-5 text-yellow-500" />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(certificate.type)}`}>
                            {certificate.type.charAt(0).toUpperCase() + certificate.type.slice(1)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {certificate.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Issued by: {certificate.issuedBy}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(certificate.status)}`}>
                        {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      {certificate.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        Issued: {new Date(certificate.issuedDate).toLocaleDateString()}
                      </div>
                      {certificate.validUntil && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          Valid Until: {new Date(certificate.validUntil).toLocaleDateString()}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Verification Code: {certificate.verificationCode}
                      </div>
                    </div>

                    {certificate.metadata && (
                      <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Details</h4>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          {certificate.metadata.course && <p>Course: {certificate.metadata.course}</p>}
                          {certificate.metadata.grade && <p>Grade: {certificate.metadata.grade}</p>}
                          {certificate.metadata.cgpa && <p>CGPA: {certificate.metadata.cgpa}</p>}
                          {certificate.metadata.rank && <p>Rank: {certificate.metadata.rank}</p>}
                          {certificate.metadata.event && <p>Event: {certificate.metadata.event}</p>}
                        </div>
                      </div>
                    )}

                    {certificate.status === 'issued' && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                          <Star className="h-4 w-4 mr-1" />
                          Verified
                        </div>
                        <button
                          onClick={() => handleDownloadCertificate(certificate._id)}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {filteredCertificates.length === 0 && (
                <div className="text-center py-12">
                  <Award className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No certificates found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter criteria.' : 'No certificates have been issued yet.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="p-6">
              <div className="mb-6">
                <button
                  onClick={() => setShowRequestForm(!showRequestForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Request New Certificate
                </button>
              </div>

              {showRequestForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Request New Certificate
                  </h3>
                  <form onSubmit={handleRequestCertificate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Certificate Type
                      </label>
                      <select
                        value={requestForm.certificateType}
                        onChange={(e) => setRequestForm({ ...requestForm, certificateType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="academic">Academic</option>
                        <option value="achievement">Achievement</option>
                        <option value="participation">Participation</option>
                        <option value="completion">Completion</option>
                        <option value="merit">Merit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={requestForm.title}
                        onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Enter certificate title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={requestForm.description}
                        onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Describe the certificate you need..."
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Submit Request
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRequestForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              <div className="space-y-4">
                {certificateRequests.map((request) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {request.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(request.certificateType)}`}>
                            {request.certificateType.charAt(0).toUpperCase() + request.certificateType.slice(1)}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Requested: {new Date(request.requestedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      {request.description}
                    </p>

                    {request.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Rejection Reason</h4>
                        <p className="text-sm text-red-700 dark:text-red-400">{request.rejectionReason}</p>
                      </div>
                    )}
                  </motion.div>
                ))}

                {certificateRequests.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No certificate requests</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Submit your first certificate request using the button above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCertificates;