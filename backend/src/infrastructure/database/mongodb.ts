import mongoose from 'mongoose';
import env from '../../env.js';

const environment = env.NODE_ENV;
const logHeader = `[MongoDB:${environment}] `;

async function connectDB() {
  try {
    console.log(logHeader + 'Connecting...');
    await mongoose.connect(env.MONGODB_URI);
    console.log(logHeader + 'Connected to database');
  } catch (error) {
    console.error(logHeader + 'An error occured while connecting to database!');
    throw error;
  }
}

export { connectDB };
