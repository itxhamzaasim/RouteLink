import { Router } from "express";
import { getNotifications, markNotificationRead } from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Secure all notification endpoints
router.use(authenticate as any);

router.get("/", getNotifications as any);
router.patch("/:id/read", markNotificationRead as any);

export default router;
