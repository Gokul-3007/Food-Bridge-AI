import serverless from 'serverless-http';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import { seedDatabase } from '../../src/utils/seedData.js';

const expressHandler = serverless(app);

// Reuse the MongoDB connection across warm invocations
let connection = null;

const connect = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  if (!connection) {
    connection = mongoose
      .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
      .then(async () => {
        // Auto-seed demo accounts if database is clean (mirrors local server startup)
        if ((await User.countDocuments()) === 0) {
          await seedDatabase();
        }
      })
      .catch((error) => {
        connection = null;
        throw error;
      });
  }
  return connection;
};

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connect();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Database unavailable. Please try again shortly.'
      })
    };
  }
  // Express routes are mounted under /api; normalize direct function URLs
  if (event.path?.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace('/.netlify/functions/api', '/api');
  }
  return expressHandler(event, context);
};
