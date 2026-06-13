import { Schema, model, models, Document, Types } from "mongoose";

export interface IDirectMessage extends Document {
  senderId: Types.ObjectId;
  recipientId: Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

const DirectMessageSchema = new Schema<IDirectMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender user ID is required"],
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient user ID is required"],
      index: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },

  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.senderId = ret.senderId.toString();
        ret.recipientId = ret.recipientId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.senderId = ret.senderId.toString();
        ret.recipientId = ret.recipientId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index to quickly fetch direct messages between two specific users
DirectMessageSchema.index({ senderId: 1, recipientId: 1, createdAt: 1 });

export const DirectMessage =
  models.DirectMessage || model<IDirectMessage>("DirectMessage", DirectMessageSchema);
