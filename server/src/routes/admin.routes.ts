import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getRides,
  deleteRide,
  getBookings,
} from "../controllers/admin.controller.js";

const router = Router();

// Secure all endpoints under this router for authenticated admin role only
router.use(authenticate, requireRole(["admin"]));

// Stats routes
router.get("/stats", getStats);

// User management routes
router.get("/users", getUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Ride management routes
router.get("/rides", getRides);
router.delete("/rides/:id", deleteRide);

// Booking reports
router.get("/bookings", getBookings);

export default router;
