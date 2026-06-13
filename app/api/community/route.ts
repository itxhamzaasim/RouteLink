import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { CommunityMessage } from "@/lib/models/CommunityMessage";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

// GET /api/community
// Fetches community messages.
// Regular users see messages from the last 6 hours.
// Admins see messages from the last 12 hours.
export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();

    const now = new Date();
    let cutoffTime: Date;

    if (user.role === "admin") {
      // Admins see up to 12 hours ago
      cutoffTime = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    } else {
      // Passengers and drivers see up to 6 hours ago
      cutoffTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    }

    const messages = await CommunityMessage.find({
      createdAt: { $gte: cutoffTime },
    }).sort({ createdAt: 1 });

    return NextResponse.json(messages, { status: 200 });
  } catch (error: any) {
    console.error("Get community messages error:", error);
    return NextResponse.json(
      { message: "Failed to fetch community messages." },
      { status: 500 }
    );
  }
}

// POST /api/community
// Post a message in the community chat
export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { message: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    const senderName = `${user.firstName} ${user.lastName}`;

    const message = new CommunityMessage({
      senderId: user._id,
      senderName,
      senderRole: user.role,
      content: content.trim(),
    });

    await message.save();
    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error("Post community message error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to post message." },
      { status: 500 }
    );
  }
}
