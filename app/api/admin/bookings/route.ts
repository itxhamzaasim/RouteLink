import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { Booking } from "@/lib/models/Booking";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req, ["admin"]);
    if (isNextResponse(authResult)) {
      return authResult;
    }

    await connectDB();

    const bookings = await Booking.find().sort({ createdAt: -1 });
    return NextResponse.json(bookings, { status: 200 });
  } catch (error: any) {
    console.error("Get admin bookings report error:", error);
    return NextResponse.json(
      { message: "Failed to retrieve booking reports." },
      { status: 500 }
    );
  }
}
