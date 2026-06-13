import mongoose from "mongoose";

type MongooseConnection = typeof mongoose;

// Declare global type for caching
declare global {
  var mongoose: {
    conn: MongooseConnection | null;
    promise: Promise<MongooseConnection> | null;
  } | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Establishes a cached connection to MongoDB Atlas.
 * Prevents multiple active connections during serverless invocations and hot-reloads.
 */
export async function connectDB(): Promise<MongooseConnection> {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error("MONGODB_URI environment variable is not defined.");
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
    };

    console.log("Initiating MongoDB connection to Atlas (Serverless)...");
    cached!.promise = mongoose.connect(mongodbUri, opts).then((m) => {
      console.log(`Connected to MongoDB Atlas`);
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

/**
 * Performs a health check on the database, including latency measurement.
 */
export async function healthCheck(): Promise<{
  status: "healthy" | "unhealthy" | "connecting" | "disconnected";
  latencyMs?: number;
  message?: string;
}> {
  const readyState = mongoose.connection.readyState;

  if (readyState === 2) {
    return { status: "connecting" };
  }

  if (readyState !== 1) {
    return { status: "disconnected", message: "Database is not connected." };
  }

  try {
    const start = Date.now();
    await mongoose.connection.db?.admin().ping();
    const latencyMs = Date.now() - start;
    return { status: "healthy", latencyMs };
  } catch (error: any) {
    return { status: "unhealthy", message: error.message || "Ping failed." };
  }
}
