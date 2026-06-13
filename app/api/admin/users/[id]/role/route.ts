import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { User } from "@/lib/models/User";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    const authResult = await requireAuth(req, ["admin"]);
    if (isNextResponse(authResult)) {
      return authResult;
    }

    await connectDB();
    const { role, isVerified } = await req.json();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (role && ["admin", "driver", "passenger"].includes(role)) {
      user.role = role as any;
    }

    if (isVerified !== undefined) {
      user.isVerified = !!isVerified;
    }

    await user.save();
    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    console.error("Update user role error:", error);
    return NextResponse.json(
      { message: "Failed to update user profile." },
      { status: 500 }
    );
  }
}
