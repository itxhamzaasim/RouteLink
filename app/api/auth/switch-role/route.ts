import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { User } from "@/lib/models/User";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();

    const { role } = await req.json();

    if (role !== "passenger" && role !== "driver") {
      return NextResponse.json(
        { message: "Invalid role switch request." },
        { status: 400 }
      );
    }

    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // A passenger can switch to driver only if they are approved by an admin
    if (role === "driver" && !dbUser.isDriverApproved && dbUser.role !== "admin") {
      return NextResponse.json(
        { message: "You are not authorized to switch to Rider mode yet." },
        { status: 403 }
      );
    }

    dbUser.role = role;
    await dbUser.save();

    return NextResponse.json(dbUser, { status: 200 });
  } catch (error: any) {
    console.error("Switch role error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to switch role." },
      { status: 500 }
    );
  }
}
