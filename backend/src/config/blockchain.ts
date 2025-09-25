import { createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`)
});

export const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`)
});

export const CONTRACT_ADDRESS = 'YOUR_SMART_CONTRACT_ADDRESS';

export const CONTRACT_ABI = [
  // Your smart contract ABI here
  // This will be an array of objects describing your smart contract interface
];