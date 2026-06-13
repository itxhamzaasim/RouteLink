import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { DirectMessage } from "@/lib/models/DirectMessage";
import { CommunityMessage } from "@/lib/models/CommunityMessage";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();
    const userId = user._id.toString();

    // 1. Count unread direct messages (DMs) where user is recipient
    const unreadDMsCount = await DirectMessage.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    // 2. Count unread community messages based on last seen timestamp sent by client
    const { searchParams } = new URL(req.url);
    const lastCommunitySeenStr = searchParams.get("lastCommunitySeen");
    let unreadCommunityCount = 0;

    if (lastCommunitySeenStr) {
      const lastCommunitySeen = new Date(lastCommunitySeenStr);
      const now = new Date();
      // Enforce the 6-hour limit for passenger/driver, or 12-hour for admin
      const limitHours = user.role === "admin" ? 12 : 6;
      const cutoffTime = new Date(now.getTime() - limitHours * 60 * 60 * 1000);
      const actualCutoff = lastCommunitySeen > cutoffTime ? lastCommunitySeen : cutoffTime;

      unreadCommunityCount = await CommunityMessage.countDocuments({
        senderId: { $ne: user._id }, // Don't count self messages
        createdAt: { $gt: actualCutoff },
      });
    }

    return NextResponse.json(
      {
        unreadDMsCount,
        unreadCommunityCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get unread counts error:", error);
    return NextResponse.json(
      { message: "Failed to fetch unread counts." },
      { status: 500 }
    );
  }
}
