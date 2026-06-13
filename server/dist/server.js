"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const ride_routes_js_1 = __importDefault(require("./routes/ride.routes.js"));
const booking_routes_js_1 = __importDefault(require("./routes/booking.routes.js"));
const notification_routes_js_1 = __importDefault(require("./routes/notification.routes.js"));
const admin_routes_js_1 = __importDefault(require("./routes/admin.routes.js"));
const database_js_1 = require("./lib/database.js");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
// Middlewares
app.use((0, cors_1.default)({
    origin: CORS_ORIGIN,
    credentials: true,
}));
app.use(express_1.default.json());
// Main Root endpoint for checking server status
app.get("/health", async (_req, res) => {
    const dbHealth = await (0, database_js_1.healthCheck)();
    res.status(dbHealth.status === "healthy" ? 200 : 503).json({
        status: dbHealth.status === "healthy" ? "OK" : "UNHEALTHY",
        service: "RouteLink Backend",
        database: dbHealth,
    });
});
// Mount routes
app.use("/api/auth", auth_routes_js_1.default);
app.use("/api/rides", ride_routes_js_1.default);
app.use("/api/bookings", booking_routes_js_1.default);
app.use("/api/notifications", notification_routes_js_1.default);
app.use("/api/admin", admin_routes_js_1.default);
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ code: "UNKNOWN", message: err.message || "An unexpected error occurred" });
});
// Database connection & Server Startup
(0, database_js_1.connectDB)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`RouteLink server is running on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error("Database connection failure on startup:", err);
    process.exit(1);
});
