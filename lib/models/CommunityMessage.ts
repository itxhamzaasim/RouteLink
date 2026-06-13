import { Schema, model, models, Document, Types } from "mongoose";

export interface ICommunityMessage extends Document {
  senderId: Types.ObjectId;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: Date;
}

const CommunityMessageSchema = new Schema<ICommunityMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender user ID is required"],
    },
    senderName: {
      type: String,
      required: [true, "Sender name is required"],
      trim: true,
    },
    senderRole: {
      type: String,
      required: [true, "Sender role is required"],
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: 43200 }, // 12 hours in seconds (12 * 60 * 60 = 43200)
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.senderId = ret.senderId.toString();
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
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const CommunityMessage =
  models.CommunityMessage || model<ICommunityMessage>("CommunityMessage", CommunityMessageSchema);
