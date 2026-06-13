"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.healthCheck = healthCheck;
const mongoose_1 = __importDefault(require("mongoose"));
let isConnecting = false;
/**
 * Establishes a cached connection to MongoDB Atlas.
 * Prevents multiple active connections during hot-reloading.
 */
async function connectDB() {
    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
        throw new Error("MONGODB_URI environment variable is not defined inside .env file.");
    }
    // If already connected, return the cached connection
    if (mongoose_1.default.connection.readyState === 1) {
        return mongoose_1.default;
    }
    // If connection is in progress, wait for it to complete
    if (mongoose_1.default.connection.readyState === 2 || isConnecting) {
        console.log("MongoDB connection is already in progress. Waiting...");
        return new Promise((resolve, reject) => {
            const checkConnection = setInterval(() => {
                if (mongoose_1.default.connection.readyState === 1) {
                    clearInterval(checkConnection);
                    resolve(mongoose_1.default);
                }
                else if (mongoose_1.default.connection.readyState === 0) {
                    clearInterval(checkConnection);
                    reject(new Error("MongoDB connection failed while waiting."));
                }
            }, 100);
        });
    }
    try {
        isConnecting = true;
        console.log("Initiating MongoDB connection to Atlas...");
        const conn = await mongoose_1.default.connect(mongodbUri, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s
        });
        console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);
        return conn;
    }
    catch (error) {
        console.error("Error connecting to MongoDB Atlas:", error);
        throw error;
    }
    finally {
        isConnecting = false;
    }
}
/**
 * Performs a health check on the database, including latency measurement.
 */
async function healthCheck() {
    const readyState = mongoose_1.default.connection.readyState;
    if (readyState === 2) {
        return { status: "connecting" };
    }
    if (readyState !== 1) {
        return { status: "disconnected", message: "Database is not connected." };
    }
    try {
        const start = Date.now();
        // Use admin ping command to verify database availability and latency
        await mongoose_1.default.connection.db?.admin().ping();
        const latencyMs = Date.now() - start;
        return { status: "healthy", latencyMs };
    }
    catch (error) {
        return { status: "unhealthy", message: error.message || "Ping failed." };
    }
}
