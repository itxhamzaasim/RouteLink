import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { CommunityComment } from "@/lib/models/CommunityComment";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { message: "Post ID is required." },
        { status: 400 }
      );
    }

    const comments = await CommunityComment.find({ postId }).sort({ createdAt: 1 });
    return NextResponse.json(comments, { status: 200 });
  } catch (error: any) {
    console.error("Get community comments error:", error);
    return NextResponse.json(
      { message: "Failed to fetch community comments." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();
    const { postId, content } = await req.json();

    if (!postId || !content || !content.trim()) {
      return NextResponse.json(
        { message: "Post ID and content are required." },
        { status: 400 }
      );
    }

    const authorName = `${user.firstName} ${user.lastName}`;

    const comment = new CommunityComment({
      postId,
      authorId: user._id,
      authorName,
      authorRole: user.role,
      content: content.trim(),
    });

    await comment.save();
    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error("Create community comment error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to post community comment." },
      { status: 500 }
    );
  }
}
