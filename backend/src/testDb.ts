import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('Testing connection with URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ MongoDB connected successfully!');
    
    // Create test collection
    const test = await mongoose.connection.db.collection('test');
    await test.insertOne({ test: true, date: new Date() });
    console.log('✅ Test document created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
