"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_js_1 = require("../controllers/booking.controller.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Secure all booking endpoints
router.use(auth_js_1.authenticate);
router.post("/", booking_controller_js_1.createBooking);
router.get("/", booking_controller_js_1.getPassengerBookings);
router.get("/driver", booking_controller_js_1.getDriverRidesBookings);
router.patch("/:id/status", booking_controller_js_1.updateBookingStatus);
exports.default = router;
