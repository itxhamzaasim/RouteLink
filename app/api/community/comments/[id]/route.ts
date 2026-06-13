import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
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

    const comment = await CommunityComment.findByIdAndDelete(id);
    if (!comment) {
      return NextResponse.json({ message: "Comment not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Comment deleted successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Delete community comment error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete community comment." },
      { status: 500 }
    );
  }
}
