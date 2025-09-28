import { useState } from 'react';
import toast from 'react-hot-toast';
import { placementAPI } from '../../services/api';

const ResumeUploadModal = ({ job, onClose, onSubmit }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.error('Please select a resume file');
      return;
    }
    setUploading(true);
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('coverLetter', coverLetter);
      // Call API to apply for job with resume upload
      await placementAPI.applyJob(job._id, formData);
      toast.success('Application submitted successfully');
      onSubmit();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to apply');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Apply for {job.title}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
          <textarea
            className="input"
            rows={3}
            placeholder="Cover Letter (optional)"
            value={coverLetter}
            onChange={e => setCoverLetter(e.target.value)}
          />
          <div className="flex gap-4 mt-4 justify-end">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold" disabled={uploading}>
              {uploading ? 'Submitting...' : 'Submit Application'}
            </button>
            <button type="button" className="px-6 py-2 bg-gray-300 rounded-lg font-semibold" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResumeUploadModal;
