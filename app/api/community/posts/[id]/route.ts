import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { CommunityPost } from "@/lib/models/CommunityPost";
import { CommunityComment } from "@/lib/models/CommunityComment";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(req, ["admin"]);
    if (isNextResponse(authResult)) {
      return authResult;
    }

    const { id } = await params;

    await connectDB();

    const post = await CommunityPost.findByIdAndDelete(id);
    if (!post) {
      return NextResponse.json({ message: "Post not found." }, { status: 404 });
    }

    // Delete all associated comments for this post
    await CommunityComment.deleteMany({ postId: id });

    return NextResponse.json({ message: "Post and its comments deleted successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Delete community post error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete community post." },
      { status: 500 }
    );
  }
}
