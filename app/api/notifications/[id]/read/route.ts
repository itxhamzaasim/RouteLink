import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { Notification } from "@/lib/models/Notification";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();

    const notification = await Notification.findById(id);
    if (!notification) {
      return NextResponse.json({ message: "Notification not found." }, { status: 404 });
    }

    if (notification.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Access forbidden." }, { status: 403 });
    }

    notification.isRead = true;
    await notification.save();

    return NextResponse.json(notification, { status: 200 });
  } catch (error: any) {
    console.error("Mark notification read error:", error);
    return NextResponse.json(
      { message: "Failed to update notification." },
      { status: 500 }
    );
  }
}
