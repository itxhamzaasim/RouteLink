import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

export async function POST() {
  try {
    const response = new NextResponse(null, { status: 204 });
    
    // Clear cookie
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      maxAge: -1,
      path: "/",
    });
    
    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { code: "UNKNOWN", message: error.message || "Server error during logout" },
      { status: 500 }
    );
  }
}
