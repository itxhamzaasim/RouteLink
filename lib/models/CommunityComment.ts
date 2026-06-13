import { Schema, model, models, Document, Types } from "mongoose";

export interface ICommunityComment extends Document {
  postId: Types.ObjectId;
  authorId: Types.ObjectId;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: Date;
}

const CommunityCommentSchema = new Schema<ICommunityComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "CommunityPost",
      required: [true, "Post ID is required"],
      index: true,
    },
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
    content: {
      type: String,
      required: [true, "Comment content cannot be empty"],
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.postId = ret.postId.toString();
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
        ret.postId = ret.postId.toString();
        ret.authorId = ret.authorId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const CommunityComment =
  models.CommunityComment || model<ICommunityComment>("CommunityComment", CommunityCommentSchema);
