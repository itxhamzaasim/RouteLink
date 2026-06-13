import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { Booking } from "@/lib/models/Booking";
import { Ride } from "@/lib/models/Ride";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req, ["driver", "admin"]);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();

    // Find all rides belonging to this driver
    const rides = await Ride.find({ driverId: user._id }, "_id");
    const rideIds = rides.map((r) => r._id);

    // Find all bookings for these rides
    const bookings = await Booking.find({ rideId: { $in: rideIds } }).sort({ createdAt: -1 });
    return NextResponse.json(bookings, { status: 200 });
  } catch (error: any) {
    console.error("Get driver rides bookings error:", error);
    return NextResponse.json(
      { message: "Failed to fetch passenger requests." },
      { status: 500 }
    );
  }
}
