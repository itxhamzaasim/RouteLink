"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Recipient user ID is required"],
        index: true,
    },
    title: {
        type: String,
        required: [true, "Notification title is required"],
        trim: true,
    },
    message: {
        type: String,
        required: [true, "Notification message is required"],
        trim: true,
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true,
    },
}, {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            ret.userId = ret.userId.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            ret.userId = ret.userId.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
// Compound index to quickly fetch unread notifications for a user sorted by creation time
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
exports.Notification = (0, mongoose_1.model)("Notification", NotificationSchema);
