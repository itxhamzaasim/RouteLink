import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import rideRoutes from "./routes/ride.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { connectDB, healthCheck } from "./lib/database.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// Middlewares
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// Main Root endpoint for checking server status
app.get("/health", async (_req, res) => {
  const dbHealth = await healthCheck();
  res.status(dbHealth.status === "healthy" ? 200 : 503).json({
    status: dbHealth.status === "healthy" ? "OK" : "UNHEALTHY",
    service: "RouteLink Backend",
    database: dbHealth,
  });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ code: "UNKNOWN", message: err.message || "An unexpected error occurred" });
});

// Database connection & Server Startup
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`RouteLink server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failure on startup:", err);
    process.exit(1);
  });
