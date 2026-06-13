import { Response } from "express";
import { Notification } from "../models/Notification.js";
import { AuthRequest } from "../middleware/auth.js";

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ isRead: 1, createdAt: -1 })
      .limit(30);

    res.status(200).json(notifications);
  } catch (error: any) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
}

export async function markNotificationRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const notification = await Notification.findById(id);
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
  } catch (error: any) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ message: "Failed to update notification." });
  }
}
