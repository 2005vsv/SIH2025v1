import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const testConnection = async () => {
  try {
    console.log('Attempting to connect...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
};

testConnection();
