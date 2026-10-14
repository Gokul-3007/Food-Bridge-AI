import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI?.trim();

    if (process.env.NODE_ENV === 'production' && !mongoUri) {
          throw new Error('MONGODB_URI is required in production.');
    }

    if (mongoUri) {
          try {
                  console.log('Connecting to provided MONGODB_URI...');
                  await mongoose.connect(mongoUri);
                  console.log('MongoDB connected successfully via MONGODB_URI');
                  return;
          } catch (error) {
                  console.error(`MongoDB connection error: ${error.message}`);
                  if (process.env.NODE_ENV === 'production') {
                            throw error;
                  }
          }
    }

    console.log('Initializing MongoMemoryServer for local development and tests...');
    try {
          mongoMemoryServer = await MongoMemoryServer.create({
                  instance: { dbName: 'foodbridge_ai' }
          });
          await mongoose.connect(mongoMemoryServer.getUri());
          console.log('Connected to in-memory MongoDB');
    } catch (error) {
          console.error('Failed to start in-memory MongoDB:', error);
          throw error;
    }
};

export const disconnectDB = async () => {
    try {
          await mongoose.disconnect();
          if (mongoMemoryServer) {
                  await mongoMemoryServer.stop();
          }
          console.log('MongoDB disconnected successfully');
    } catch (error) {
          console.error('Error disconnecting MongoDB:', error);
    }
};
