// frontend-web/src/components/CertificateCard.tsx

import React, { useState } from 'react';
import { blockchainService } from '../services/blockchainService';

interface Certificate {
  id: string;
  studentId: string;
  certificateType: string;
  grade: string;
  issueDate: string;
  qrCode?: string;
  verificationUrl?: string;
  blockchainTxHash?: string;
  isBlockchainIssued: boolean;
}

interface CertificateCardProps {
  certificate: Certificate;
  onUpdate?: (updatedCertificate: Certificate) => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate, onUpdate }) => {
  const [showQR, setShowQR] = useState(false);
  const [issuingOnBlockchain, setIssuingOnBlockchain] = useState(false);

  // Issue certificate on blockchain
  const handleBlockchainIssuance = async () => {
    setIssuingOnBlockchain(true);
    try {
      // Issue on blockchain
      const result = await blockchainService.issueCertificate(
        certificate.studentId,
        certificate.certificateType,
        certificate.grade
      );

      if (result.success) {
        // Update backend with blockchain data
        const response = await fetch(`/api/certificates/${certificate.id}/blockchain`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blockchainTxHash: result.transactionHash
          })
        });

        if (response.ok) {
          const updatedCert = {
            ...certificate,
            blockchainTxHash: result.transactionHash,
            isBlockchainIssued: true
          };
          
          onUpdate?.(updatedCert);
          alert(`🎉 Certificate issued on blockchain!\nTransaction: ${result.transactionHash}`);
        }
      }
    } catch (error) {
      console.error('Blockchain issuance failed:', error);
      alert(`❌ Failed to issue on blockchain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIssuingOnBlockchain(false);
    }
  };

  // Download QR code
  const downloadQR = () => {
    if (!certificate.qrCode) return;

    const link = document.createElement('a');
    link.href = certificate.qrCode;
    link.download = `${certificate.certificateType}-QR-${certificate.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy verification link
  const copyLink = async () => {
    if (certificate.verificationUrl) {
      try {
        await navigator.clipboard.writeText(certificate.verificationUrl);
        alert('📋 Verification link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  // Share certificate
  const shareLink = async () => {
    if (navigator.share && certificate.verificationUrl) {
      try {
        await navigator.share({
          title: `${certificate.certificateType} Certificate`,
          text: `Verify this certificate for ${certificate.studentId}`,
          url: certificate.verificationUrl,
        });
      } catch (error) {
        copyLink(); // Fallback to copy
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-4">
      <div className="flex justify-between items-start">
        {/* Certificate Info */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            🎓 {certificate.certificateType}
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Student ID:</label>
              <p className="text-gray-800">{certificate.studentId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Grade:</label>
              <p className="text-lg font-semibold text-green-600">{certificate.grade}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Issue Date:</label>
              <p className="text-gray-800">{new Date(certificate.issueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status:</label>
              {certificate.isBlockchainIssued ? (
                <div className="flex items-center text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  ✅ Blockchain Verified
                </div>
              ) : (
                <div className="flex items-center text-yellow-600">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  📝 Database Only
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mb-4">
            {!certificate.isBlockchainIssued && blockchainService.isWalletConnected() && (
              <button
                onClick={handleBlockchainIssuance}
                disabled={issuingOnBlockchain}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded text-sm"
              >
                {issuingOnBlockchain ? '⏳ Issuing...' : '🔗 Issue on Blockchain'}
              </button>
            )}

            {certificate.blockchainTxHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${certificate.blockchainTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm"
              >
                🔍 View Transaction
              </a>
            )}
          </div>
        </div>

        {/* QR Code Section */}
        {certificate.qrCode && (
          <div className="ml-6">
            <button
              onClick={() => setShowQR(!showQR)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-3"
            >
              {showQR ? '🙈 Hide QR' : '📱 Show QR Code'}
            </button>

            {showQR && (
              <div className="bg-gray-50 p-4 rounded-lg text-center border">
                <img
                  src={certificate.qrCode}
                  alt="Certificate QR Code"
                  className="mx-auto mb-3 border-2 border-gray-300 rounded"
                  width="150"
                  height="150"
                />
                
                <p className="text-xs text-gray-600 mb-3">
                  📱 Scan to verify authenticity
                </p>
                
                <div className="space-y-2">
                  <button
                    onClick={downloadQR}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    💾 Download QR
                  </button>
                  
                  <button
                    onClick={shareLink}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                  >
                    📤 Share Link
                  </button>
                  
                  <button
                    onClick={copyLink}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                  >
                    📋 Copy URL
                  </button>
                </div>

                {certificate.verificationUrl && (
                  <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600 break-all">
                    {certificate.verificationUrl}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateCard;