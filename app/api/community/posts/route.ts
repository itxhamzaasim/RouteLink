import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { CommunityPost } from "@/lib/models/CommunityPost";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function GET(req: Request) {
  try {
    await connectDB();
    const posts = await CommunityPost.find().sort({ createdAt: -1 });
    return NextResponse.json(posts, { status: 200 });
  } catch (error: any) {
    console.error("Get community posts error:", error);
    return NextResponse.json(
      { message: "Failed to fetch community posts." },
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
    const { title, content, category } = await req.json();

    if (!title || !title.trim() || !content || !content.trim()) {
      return NextResponse.json(
        { message: "Title and content cannot be empty." },
        { status: 400 }
      );
    }

    const authorName = `${user.firstName} ${user.lastName}`;

    const post = new CommunityPost({
      authorId: user._id,
      authorName,
      authorRole: user.role,
      title: title.trim(),
      content: content.trim(),
      category: category || "discussion",
    });

    await post.save();
    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error("Create community post error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create community post." },
      { status: 500 }
    );
  }
}
