import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Attempting to connect to:', uri);
    
    await mongoose.connect(uri!);
    console.log('Successfully connected to MongoDB!');
    
    // Test creating a collection
    const testSchema = new mongoose.Schema({ name: String });
    const Test = mongoose.model('Test', testSchema);
    await Test.createCollection();
    console.log('Successfully created test collection!');
    
    process.exit(0);
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  }
}

testConnection();
