import { Router } from "express";
import { createRide, updateRide, deleteRide, getDriverRides, searchRides, getRideById } from "../controllers/ride.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

// Secure all endpoints with basic authentication (passengers, drivers, and admins can access)
router.use(authenticate as any);

// Driver / Admin CRUD Routes (Restricted)
router.get("/driver", requireRole(["driver", "admin"]) as any, getDriverRides as any);

// General Query Paths
router.get("/", searchRides as any);
router.get("/:id", getRideById as any);

router.post("/", requireRole(["driver", "admin"]) as any, createRide as any);
router.put("/:id", requireRole(["driver", "admin"]) as any, updateRide as any);
router.delete("/:id", requireRole(["driver", "admin"]) as any, deleteRide as any);

export default router;
