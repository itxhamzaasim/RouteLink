"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ride_controller_js_1 = require("../controllers/ride.controller.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Secure all endpoints with basic authentication (passengers, drivers, and admins can access)
router.use(auth_js_1.authenticate);
// Driver / Admin CRUD Routes (Restricted)
router.get("/driver", (0, auth_js_1.requireRole)(["driver", "admin"]), ride_controller_js_1.getDriverRides);
// General Query Paths
router.get("/", ride_controller_js_1.searchRides);
router.get("/:id", ride_controller_js_1.getRideById);
router.post("/", (0, auth_js_1.requireRole)(["driver", "admin"]), ride_controller_js_1.createRide);
router.put("/:id", (0, auth_js_1.requireRole)(["driver", "admin"]), ride_controller_js_1.updateRide);
router.delete("/:id", (0, auth_js_1.requireRole)(["driver", "admin"]), ride_controller_js_1.deleteRide);
exports.default = router;
