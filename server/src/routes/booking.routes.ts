import { Router } from "express";
import {
  createBooking,
  updateBookingStatus,
  getPassengerBookings,
  getDriverRidesBookings,
} from "../controllers/booking.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Secure all booking endpoints
router.use(authenticate as any);

router.post("/", createBooking as any);
router.get("/", getPassengerBookings as any);
router.get("/driver", getDriverRidesBookings as any);
router.patch("/:id/status", updateBookingStatus as any);

export default router;
