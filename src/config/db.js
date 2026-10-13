import mongoose from 'mongoose';

let mongoMemoryServer = null;

// Loaded lazily: mongodb-memory-server is a local-dev fallback only and is not
// installed in production (e.g. the Netlify Function bundle).
const createMemoryServer = async (options) => {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  return MongoMemoryServer.create(options);
};

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (mongoUri && mongoUri.trim().length > 0) {
      console.log('Connecting to provided MONGODB_URI...');
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully via MONGODB_URI');
      return;
    }

    console.log('No MONGODB_URI found. Initializing MongoMemoryServer for resilient zero-config setup...');
    mongoMemoryServer = await createMemoryServer({
      instance: {
        dbName: 'foodbridge_ai'
      }
    });
    mongoUri = mongoMemoryServer.getUri();
    await mongoose.connect(mongoUri);
    console.log(`Connected to in-memory MongoDB at: ${mongoUri}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // If external URI failed, try fallback to memory server
    if (!mongoMemoryServer) {
      try {
        console.log('Falling back to MongoMemoryServer...');
        mongoMemoryServer = await createMemoryServer();
        const fallbackUri = mongoMemoryServer.getUri();
        await mongoose.connect(fallbackUri);
        console.log(`Fallback in-memory MongoDB connected: ${fallbackUri}`);
        return;
      } catch (fallbackErr) {
        console.error('Failed to start fallback in-memory MongoDB:', fallbackErr);
        throw fallbackErr;
      }
    }
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
