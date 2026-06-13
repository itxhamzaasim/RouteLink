"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
const admin_controller_js_1 = require("../controllers/admin.controller.js");
const router = (0, express_1.Router)();
// Secure all endpoints under this router for authenticated admin role only
router.use(auth_js_1.authenticate, (0, auth_js_1.requireRole)(["admin"]));
// Stats routes
router.get("/stats", admin_controller_js_1.getStats);
// User management routes
router.get("/users", admin_controller_js_1.getUsers);
router.patch("/users/:id/role", admin_controller_js_1.updateUserRole);
router.delete("/users/:id", admin_controller_js_1.deleteUser);
// Ride management routes
router.get("/rides", admin_controller_js_1.getRides);
router.delete("/rides/:id", admin_controller_js_1.deleteRide);
// Booking reports
router.get("/bookings", admin_controller_js_1.getBookings);
exports.default = router;
