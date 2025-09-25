import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testConnection() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Attempting to connect with URI:', uri);
    
    await mongoose.connect(uri!);
    console.log('✅ MongoDB Connection Successful!');
    
    // Test creating a document
    const Test = mongoose.model('Test', new mongoose.Schema({ name: String }));
    await new Test({ name: 'test' }).save();
    console.log('✅ Test document created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection Error:', error);
    process.exit(1);
  }
}

testConnection();
