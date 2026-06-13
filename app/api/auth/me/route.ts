import { NextResponse } from "next/server";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;
    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { code: "UNKNOWN", message: error.message || "Server error retrieving user" },
      { status: 500 }
    );
  }
}
