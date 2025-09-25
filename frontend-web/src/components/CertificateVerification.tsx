// frontend-web/src/components/CertificateVerification.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { blockchainService } from '../services/blockchainService';

interface CertificateData {
  id: string;
  studentId: string;
  certificateType: string;
  grade: string;
  issueDate: string;
  isBlockchainIssued: boolean;
  blockchainTxHash?: string;
}

interface BlockchainVerification {
  exists: boolean;
  studentId: string;
  certificateType: string;
  grade: string;
  timestamp: number; // unix seconds (0 if unknown)
  isValid: boolean;
}

const CertificateVerification: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [blockchainData, setBlockchainData] = useState<BlockchainVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationStep, setVerificationStep] = useState<'database' | 'blockchain' | 'done'>('database');

  useEffect(() => {
    if (certificateId) {
      verifyCertificate(certificateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificateId]);

  const verifyCertificate = async (certId: string) => {
    try {
      setLoading(true);
      setError('');
      setVerificationStep('database');

      // 1. Check database first
      const response = await fetch(`/api/certificates/verify/${certId}`);
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Certificate not found in database');
      }

      const data = await response.json();
      const cert: CertificateData = data.certificate;
      setCertificateData(cert);

      // 2. If certificate claims to be on blockchain, verify it
      if (cert?.isBlockchainIssued) {
        setVerificationStep('blockchain');

        // flexible calling to support different export styles of blockchainService:
        // - default function: blockchainService(certId)
        // - object with method: blockchainService.verifyCertificate(certId)
        // - object exposing getContract(): call contract.verifyCertificate(certId)
        let onChainResult: any = null;

        try {
          if (typeof blockchainService === 'function') {
            onChainResult = await (blockchainService as any)(certId);
          } else if (typeof (blockchainService as any).verifyCertificate === 'function') {
            onChainResult = await (blockchainService as any).verifyCertificate(certId);
          } else if (typeof (blockchainService as any).verify === 'function') {
            onChainResult = await (blockchainService as any).verify(certId);
          } else if (typeof (blockchainService as any).getContract === 'function') {
            const contract = await (blockchainService as any).getContract();
            onChainResult = await contract.verifyCertificate(certId);
          } else {
            throw new Error('blockchainService does not expose a verification function. Check your service exports.');
          }
        } catch (chainErr: any) {
          // treat as "not found on chain" but still show DB record and error
          console.error('On-chain verification error:', chainErr);
          setBlockchainData({
            exists: false,
            studentId: '',
            certificateType: '',
            grade: '',
            timestamp: 0,
            isValid: false,
          });
          setVerificationStep('done');
          setError(chainErr?.message || 'On-chain verification failed');
          return;
        }

        // if contract returns nothing / null
        if (!onChainResult) {
          setBlockchainData({
            exists: false,
            studentId: '',
            certificateType: '',
            grade: '',
            timestamp: 0,
            isValid: false,
          });
          setVerificationStep('done');
          return;
        }

        // parse returned on-chain tuple/object flexibly
        const studentId =
          (Array.isArray(onChainResult) ? onChainResult[0] : onChainResult.studentId ?? onChainResult.studentName) ??
          cert.studentId ??
          '';
        const certificateType =
          (Array.isArray(onChainResult) ? onChainResult[1] : onChainResult.certificateType ?? onChainResult.courseName) ??
          cert.certificateType ??
          '';
        const grade =
          (Array.isArray(onChainResult) ? onChainResult[2] : onChainResult.grade) ??
          cert.grade ??
          '';
        const issueDateStr =
          (Array.isArray(onChainResult) ? onChainResult[3] : onChainResult.issueDate) ?? cert.issueDate ?? '';

        // Attempt to derive timestamp:
        // 1) If certificate record contains blockchainTxHash and service exposes a helper to get timestamp by tx hash, use it
        // 2) Else, fall back to parsing the issueDate string (if parseable)
        let timestamp = 0;
        try {
          if (cert.blockchainTxHash) {
            // prefer well-known helper names if available on blockchainService
            if (typeof (blockchainService as any).getTransactionTimestamp === 'function') {
              timestamp = await (blockchainService as any).getTransactionTimestamp(cert.blockchainTxHash);
            } else if (typeof (blockchainService as any).getTxTimestamp === 'function') {
              timestamp = await (blockchainService as any).getTxTimestamp(cert.blockchainTxHash);
            } else if (typeof (blockchainService as any).getTransactionReceipt === 'function' && typeof (blockchainService as any).getBlockTimestampByNumber === 'function') {
              // advanced fallback (if your service exposes both helpers)
              const receipt = await (blockchainService as any).getTransactionReceipt(cert.blockchainTxHash);
              if (receipt?.blockNumber) {
                timestamp = await (blockchainService as any).getBlockTimestampByNumber(receipt.blockNumber);
              }
            }
          }
        } catch (tsErr) {
          console.warn('Could not resolve tx timestamp via blockchainService helpers', tsErr);
        }

        // fallback: parse issueDate string
        if (!timestamp && issueDateStr) {
          const parsed = Date.parse(issueDateStr);
          if (!Number.isNaN(parsed)) {
            timestamp = Math.floor(parsed / 1000);
          }
        }

        // final validity check: compare DB record vs on-chain fields (best-effort)
        const isValid =
          !!(
            cert &&
            studentId &&
            certificateType &&
            grade &&
            cert.studentId === studentId &&
            cert.certificateType === certificateType &&
            cert.grade === grade
          );

        setBlockchainData({
          exists: true,
          studentId,
          certificateType,
          grade,
          timestamp,
          isValid,
        });
      }

      setVerificationStep('done');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (ts: number) => {
    if (!ts || ts <= 0) return 'Unknown';
    return new Date(ts * 1000).toLocaleString();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Certificate Verification</h2>

      {loading && <p>⏳ Verifying {verificationStep}...</p>}
      {error && <p className="text-red-500">❌ {error}</p>}

      {!loading && !certificateData && !error && <p>No certificate data found.</p>}

      {certificateData && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Database Record</h3>
          <p><strong>ID:</strong> {certificateData.id}</p>
          <p><strong>Student ID:</strong> {certificateData.studentId}</p>
          <p><strong>Type:</strong> {certificateData.certificateType}</p>
          <p><strong>Grade:</strong> {certificateData.grade}</p>
          <p><strong>Issued:</strong> {certificateData.issueDate}</p>
          <p><strong>On-chain:</strong> {certificateData.isBlockchainIssued ? 'Yes' : 'No'}</p>
          {certificateData.blockchainTxHash && (
            <p><strong>TX Hash:</strong> {certificateData.blockchainTxHash}</p>
          )}
        </div>
      )}

      {certificateData?.isBlockchainIssued && blockchainData && (
        <div className="mb-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Blockchain Verification</h3>

          {!blockchainData.exists && <p className="text-yellow-600">Certificate not found on-chain.</p>}

          {blockchainData.exists && (
            <>
              <p><strong>Student ID (on-chain):</strong> {blockchainData.studentId}</p>
              <p><strong>Type (on-chain):</strong> {blockchainData.certificateType}</p>
              <p><strong>Grade (on-chain):</strong> {blockchainData.grade}</p>
              <p><strong>Timestamp:</strong> {formatTimestamp(blockchainData.timestamp)}</p>
              <p>
                <strong>Matches DB:</strong>{' '}
                {blockchainData.isValid ? (
                  <span className="text-green-600">Yes ✅</span>
                ) : (
                  <span className="text-red-600">No ❌</span>
                )}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateVerification;
