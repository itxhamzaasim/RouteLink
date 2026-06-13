import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { Notification } from "@/lib/models/Notification";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();

    const notifications = await Notification.find({ userId: user._id })
      .sort({ isRead: 1, createdAt: -1 })
      .limit(30);

    return NextResponse.json(notifications, { status: 200 });
  } catch (error: any) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { message: "Failed to fetch notifications." },
      { status: 500 }
    );
  }
}
