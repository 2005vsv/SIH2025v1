import { Award, Calendar, Download, FileText, Search, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const StudentCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [certificateRequests, setCertificateRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('certificates');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    certificateType: 'academic',
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchCertificateData();
    // eslint-disable-next-line
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

  const handleRequestCertificate = async (e) => {
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

  const handleDownloadCertificate = async (certificateId) => {
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
    const matchesSearch = cert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuedBy?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || cert.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      achievement: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      participation: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      completion: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      merit: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[type] || colors.academic;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      issued: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  const stats = {
    totalCertificates: certificates.length,
    issuedCertificates: certificates.filter(c => c.status === 'issued').length,
    pendingRequests: certificateRequests.filter(r => r.status === 'pending').length,
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-500" />
          Certificates
        </h1>
        <div className="text-gray-500">Manage your academic certificates and achievements</div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center"
        >
          <div className="text-gray-500 font-medium mb-1">Total Certificates</div>
          <div className="text-2xl font-bold">{stats.totalCertificates}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center"
        >
          <div className="text-gray-500 font-medium mb-1">Issued</div>
          <div className="text-2xl font-bold">{stats.issuedCertificates}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center"
        >
          <div className="text-gray-500 font-medium mb-1">Pending Requests</div>
          <div className="text-2xl font-bold">{stats.pendingRequests}</div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
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
      </div>

      {/* Certificates Tab */}
      {activeTab === 'certificates' && (
        <div>
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search certificates..."
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
              <option value="academic">Academic</option>
              <option value="achievement">Achievement</option>
              <option value="participation">Participation</option>
              <option value="completion">Completion</option>
              <option value="merit">Merit</option>
            </select>
          </div>

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCertificates.map((certificate) => (
              <motion.div
                key={certificate._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 flex flex-col gap-2 shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(certificate.type)}`}>
                    {certificate.type?.charAt(0).toUpperCase() + certificate.type?.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(certificate.status)}`}>
                    {certificate.status?.charAt(0).toUpperCase() + certificate.status?.slice(1)}
                  </span>
                </div>
                <div className="font-bold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  {certificate.title}
                </div>
                <div className="text-sm text-gray-500 mb-1">Issued by: {certificate.issuedBy}</div>
                <div className="text-gray-700 dark:text-gray-200 mb-2">{certificate.description}</div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                  <span>
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Issued: {certificate.issuedDate ? new Date(certificate.issuedDate).toLocaleDateString() : 'N/A'}
                  </span>
                  {certificate.validUntil && (
                    <span>
                      <Star className="inline w-4 h-4 mr-1" />
                      Valid Until: {new Date(certificate.validUntil).toLocaleDateString()}
                    </span>
                  )}
                  <span>
                    <Award className="inline w-4 h-4 mr-1" />
                    Verification Code: {certificate.verificationCode}
                  </span>
                </div>
                {certificate.metadata && (
                  <div className="bg-white dark:bg-gray-800 rounded p-2 text-xs mb-2">
                    <div className="font-semibold mb-1">Details</div>
                    <ul className="list-disc ml-4">
                      {certificate.metadata.course && <li>Course: {certificate.metadata.course}</li>}
                      {certificate.metadata.grade && <li>Grade: {certificate.metadata.grade}</li>}
                      {certificate.metadata.cgpa && <li>CGPA: {certificate.metadata.cgpa}</li>}
                      {certificate.metadata.rank && <li>Rank: {certificate.metadata.rank}</li>}
                      {certificate.metadata.event && <li>Event: {certificate.metadata.event}</li>}
                    </ul>
                  </div>
                )}
                {certificate.status === 'issued' && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <Award className="w-4 h-4" /> Verified
                    </span>
                    <button
                      onClick={() => handleDownloadCertificate(certificate._id)}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          {filteredCertificates.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <div className="font-semibold mb-1">No certificates found</div>
              <div>
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No certificates have been issued yet.'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          <div className="mb-4">
            <button
              onClick={() => setShowRequestForm(!showRequestForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Request New Certificate
            </button>
          </div>
          {showRequestForm && (
            <motion.form
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6"
              onSubmit={handleRequestCertificate}
            >
              <div className="text-lg font-semibold mb-4">Request New Certificate</div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Certificate Type</label>
                <select
                  value={requestForm.certificateType}
                  onChange={(e) => setRequestForm({ ...requestForm, certificateType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="academic">Academic</option>
                  <option value="achievement">Achievement</option>
                  <option value="participation">Participation</option>
                  <option value="completion">Completion</option>
                  <option value="merit">Merit</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter certificate title"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Description</label>
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
            </motion.form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {certificateRequests.map((request) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 flex flex-col gap-2 shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(request.certificateType)}`}>
                    {request.certificateType?.charAt(0).toUpperCase() + request.certificateType?.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(request.status)}`}>
                    {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    Requested: {request.requestedDate ? new Date(request.requestedDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="font-bold text-lg">{request.title}</div>
                <div className="text-gray-700 dark:text-gray-200 mb-2">{request.description}</div>
                {request.rejectionReason && (
                  <div className="bg-red-100 text-red-700 rounded p-2 text-xs">
                    <div className="font-semibold mb-1">Rejection Reason</div>
                    {request.rejectionReason}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          {certificateRequests.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <div className="font-semibold mb-1">No certificate requests</div>
              <div>Submit your first certificate request using the button above.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;