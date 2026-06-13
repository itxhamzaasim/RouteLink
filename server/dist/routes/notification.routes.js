"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_js_1 = require("../controllers/notification.controller.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Secure all notification endpoints
router.use(auth_js_1.authenticate);
router.get("/", notification_controller_js_1.getNotifications);
router.patch("/:id/read", notification_controller_js_1.markNotificationRead);
exports.default = router;
