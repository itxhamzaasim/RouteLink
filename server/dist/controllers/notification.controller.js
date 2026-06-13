"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.markNotificationRead = markNotificationRead;
const Notification_js_1 = require("../models/Notification.js");
async function getNotifications(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Authentication required." });
            return;
        }
        const notifications = await Notification_js_1.Notification.find({ userId: req.user._id })
            .sort({ isRead: 1, createdAt: -1 })
            .limit(30);
        res.status(200).json(notifications);
    }
    catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ message: "Failed to fetch notifications." });
    }
}
async function markNotificationRead(req, res) {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({ message: "Authentication required." });
            return;
        }
        const notification = await Notification_js_1.Notification.findById(id);
        if (!notification) {
            res.status(404).json({ message: "Notification not found." });
            return;
        }
        if (notification.userId.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: "Access forbidden." });
            return;
        }
        notification.isRead = true;
        await notification.save();
        res.status(200).json(notification);
    }
    catch (error) {
        console.error("Mark notification read error:", error);
        res.status(500).json({ message: "Failed to update notification." });
    }
}
