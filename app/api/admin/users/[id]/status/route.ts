import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { User } from "@/lib/models/User";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(req, ["admin"]);
    if (isNextResponse(authResult)) {
      return authResult;
    }

    const { id } = await params;
    const { action } = await req.json();

    if (action !== "suspend" && action !== "ban" && action !== "restore") {
      return NextResponse.json(
        { message: "Invalid action. Must be 'suspend', 'ban', or 'restore'." },
        { status: 400 }
      );
    }

    await connectDB();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (action === "suspend") {
      targetUser.isSuspended = true;
    } else if (action === "ban") {
      targetUser.isBanned = true;
    } else if (action === "restore") {
      targetUser.isSuspended = false;
      targetUser.isBanned = false;
    }

    await targetUser.save();
    return NextResponse.json(targetUser, { status: 200 });
  } catch (error: any) {
    console.error("User moderation status error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update user moderation status." },
      { status: 500 }
    );
  }
}
