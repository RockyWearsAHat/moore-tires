import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connects to MongoDB using MONGODB_URI from the environment.
 * Subsequent calls are no-ops if already connected — safe to call at module init.
 */
export async function connectDb(): Promise<void> {
  if (isConnected) return;

  const uri = process.env['MONGODB_URI'];
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  await mongoose.connect(uri);
  isConnected = true;
}

/**
 * Closes the MongoDB connection. Primarily used in tests and scripts.
 */
export async function disconnectDb(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}
