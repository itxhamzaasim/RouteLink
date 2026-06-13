import { Schema, model, models, Document, Types } from "mongoose";

export interface ICommunityPost extends Document {
  authorId: Types.ObjectId;
  authorName: string;
  authorRole: string;
  title: string;
  content: string;
  category: "discussion" | "announcement";
  createdAt: Date;
}

const CommunityPostSchema = new Schema<ICommunityPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author user ID is required"],
    },
    authorName: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    authorRole: {
      type: String,
      required: [true, "Author role is required"],
    },
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["discussion", "announcement"],
      default: "discussion",
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.authorId = ret.authorId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.authorId = ret.authorId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const CommunityPost =
  models.CommunityPost || model<ICommunityPost>("CommunityPost", CommunityPostSchema);
