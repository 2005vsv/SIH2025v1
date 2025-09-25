// frontend-web/src/services/blockchainService.ts

import { createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import CONTRACT_ABI from '../config/CertificateRegistryABI.json';
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;

class BlockchainService {
  private publicClient;
  private walletClient;

  constructor() {
    // Public client for reading blockchain data
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`)
    });

    // Wallet client for writing transactions (only if private key is available)
    if (PRIVATE_KEY) {
      const account = privateKeyToAccount(`0x${PRIVATE_KEY.replace('0x', '')}` as `0x${string}`);
      this.walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`)
      });
    }
  }

  // Issue certificate on blockchain
  async issueCertificate(studentId: string, certificateType: string, grade: string) {
    if (!this.walletClient) {
      throw new Error('Wallet not configured. Private key required for issuing certificates.');
    }

    try {
      console.log('📝 Issuing certificate on blockchain...');
      
      const hash = await this.walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'issueCertificate',
        args: [studentId, certificateType, grade],
      });

      console.log('⏳ Transaction sent:', hash);

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      
      console.log('✅ Transaction confirmed:', receipt);

      return {
        success: true,
        transactionHash: hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        etherscanUrl: `https://sepolia.etherscan.io/tx/${hash}`
      };

    } catch (error) {
      console.error('❌ Blockchain issuance failed:', error);
      throw new Error(`Blockchain issuance failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Verify certificate on blockchain
  async verifyCertificate(certificateId: string) {
    try {
      console.log('🔍 Verifying certificate on blockchain...');
      
      const result = await this.publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getCertificate',
        args: [certificateId],
      }) as [boolean, string, string, string, bigint];

      const [exists, studentId, certificateType, grade, timestamp] = result;

      return {
        exists,
        studentId,
        certificateType,
        grade,
        timestamp: Number(timestamp),
        isValid: exists && studentId !== '' && certificateType !== '',
      };

    } catch (error) {
      console.error('❌ Blockchain verification failed:', error);
      return {
        exists: false,
        studentId: '',
        certificateType: '',
        grade: '',
        timestamp: 0,
        isValid: false,
      };
    }
  }

  // Get wallet balance
  async getWalletBalance() {
    if (!this.walletClient) return '0';

    try {
      const balance = await this.publicClient.getBalance({
        address: this.walletClient.account.address
      });
      return (Number(balance) / 1e18).toFixed(4); // Convert wei to ETH
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  // Check if wallet is connected
  isWalletConnected(): boolean {
    return !!this.walletClient;
  }

  // Get wallet address
  getWalletAddress(): string {
    return this.walletClient?.account?.address || '';
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();