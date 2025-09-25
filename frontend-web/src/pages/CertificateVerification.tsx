import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface CertificateData {
  certificate: {
    studentId: string;
    certificateType: string;
    grade: string;
    issueDate: string;
  };
  blockchainVerification: {
    isValid: boolean;
    studentId: string;
    certificateType: string;
    issueDate: string;
  };
  isAuthentic: boolean;
}

const CertificateVerification: React.FC = () => {
  const { certificateId } = useParams();
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const response = await fetch(`/api/certificates/verify/${certificateId}`);
        if (!response.ok) throw new Error('Certificate not found');
        
        const data = await response.json();
        setCertificateData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin text-4xl">⏳</div>
        <p className="ml-4">Verifying certificate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-bold text-red-600 mb-4">❌ Verification Failed</h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <div className={`p-6 rounded-lg ${certificateData?.isAuthentic ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
        
        <div className="text-center mb-6">
          {certificateData?.isAuthentic ? (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-green-600">Certificate Verified</h1>
              <p className="text-green-700">This certificate is authentic and verified on the blockchain</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-red-600">Invalid Certificate</h1>
              <p className="text-red-700">This certificate could not be verified</p>
            </>
          )}
        </div>

        {certificateData?.isAuthentic && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">📜 Certificate Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-gray-600">Student ID:</label>
                <p className="text-gray-800">{certificateData.certificate.studentId}</p>
              </div>
              
              <div>
                <label className="font-semibold text-gray-600">Certificate Type:</label>
                <p className="text-gray-800">{certificateData.certificate.certificateType}</p>
              </div>
              
              <div>
                <label className="font-semibold text-gray-600">Grade:</label>
                <p className="text-gray-800">{certificateData.certificate.grade}</p>
              </div>
              
              <div>
                <label className="font-semibold text-gray-600">Issue Date:</label>
                <p className="text-gray-800">{new Date(certificateData.certificate.issueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                🔐 This certificate is secured on the Ethereum blockchain and cannot be forged or tampered with.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateVerification;