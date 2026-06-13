import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { User } from "@/lib/models/User";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req, ["admin"]);
    if (isNextResponse(authResult)) {
      return authResult;
    }

    await connectDB();

    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("Get admin users error:", error);
    return NextResponse.json(
      { message: "Failed to fetch user list." },
      { status: 500 }
    );
  }
}
