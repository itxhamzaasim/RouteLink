import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { Ride } from "@/lib/models/Ride";
import { Booking } from "@/lib/models/Booking";
import { RideRequest } from "@/lib/models/RideRequest";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();
    const userId = user._id;
    const now = new Date();

    if (user.role === "passenger") {
      // Fetch passenger history: past bookings and past ride requests
      const bookings = await Booking.find({
        passengerId: userId,
        "rideDetails.departureTime": { $lt: now },
      }).sort({ "rideDetails.departureTime": -1 });

      const requests = await RideRequest.find({
        passengerId: userId,
        departureTime: { $lt: now },
      }).sort({ departureTime: -1 });

      return NextResponse.json({ bookings, requests }, { status: 200 });
    } else {
      // Fetch driver/admin history: past offered rides and past accepted ride requests
      const rides = await Ride.find({
        driverId: userId,
        departureTime: { $lt: now },
      }).sort({ departureTime: -1 });

      const requests = await RideRequest.find({
        driverId: userId,
        departureTime: { $lt: now },
      }).sort({ departureTime: -1 });

      return NextResponse.json({ rides, requests }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Get history error:", error);
    return NextResponse.json(
      { message: "Failed to fetch ride history." },
      { status: 500 }
    );
  }
}
