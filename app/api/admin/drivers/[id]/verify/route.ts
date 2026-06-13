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

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { message: "Invalid action. Must be 'approve' or 'reject'." },
        { status: 400 }
      );
    }

    await connectDB();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (action === "approve") {
      targetUser.isVerified = true;
      targetUser.isDriverApproved = true;
      targetUser.driverApplicationStatus = "approved";
      targetUser.role = "driver"; // Swaps active role to driver immediately upon approval
    } else {
      targetUser.isDriverApproved = false;
      targetUser.driverApplicationStatus = "rejected";
      targetUser.role = "passenger"; // Fallback to passenger role
    }

    await targetUser.save();
    return NextResponse.json(targetUser, { status: 200 });
  } catch (error: any) {
    console.error("Verify driver application error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to process driver verification." },
      { status: 500 }
    );
  }
}
