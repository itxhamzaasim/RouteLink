import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { RideRequest } from "@/lib/models/RideRequest";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

// GET /api/rides/requests
// Passengers get their own requests, drivers get all pending requests
export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();

    if (user.role === "passenger") {
      // Return requests made by this passenger
      const requests = await RideRequest.find({ passengerId: user._id }).sort({ departureTime: 1 });
      return NextResponse.json(requests, { status: 200 });
    } else {
      // Drivers/Admins get all pending requests from passengers, or requests accepted by them
      const { searchParams } = new URL(req.url);
      const acceptedByMe = searchParams.get("acceptedByMe") === "true";

      let query: any = {};
      if (acceptedByMe) {
        query = { driverId: user._id };
      } else {
        query = { status: "pending" };
      }

      const requests = await RideRequest.find(query).sort({ departureTime: 1 });
      return NextResponse.json(requests, { status: 200 });
    }
  } catch (error: any) {
    console.error("Get ride requests error:", error);
    return NextResponse.json(
      { message: "Failed to fetch ride requests." },
      { status: 500 }
    );
  }
}

// POST /api/rides/requests
// Passengers create a new request
export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();
    const { origin, destination, departureTime, seatsNeeded, proposedPrice } = await req.json();

    // Validation
    if (!origin?.address || !origin?.city || !destination?.address || !destination?.city || !departureTime || !seatsNeeded || proposedPrice === undefined) {
      return NextResponse.json(
        { message: "Required fields are missing or invalid." },
        { status: 400 }
      );
    }

    const passengerName = `${user.firstName} ${user.lastName}`;

    const request = new RideRequest({
      passengerId: user._id,
      passengerName,
      passengerRating: 5.0,
      origin,
      destination,
      departureTime: new Date(departureTime),
      seatsNeeded: Number(seatsNeeded),
      proposedPrice: Number(proposedPrice),
      status: "pending",
    });

    await request.save();
    return NextResponse.json(request, { status: 201 });
  } catch (error: any) {
    console.error("Create ride request error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create ride request." },
      { status: 500 }
    );
  }
}
