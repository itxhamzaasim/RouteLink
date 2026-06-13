import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { Ride } from "@/lib/models/Ride";
import { Booking } from "@/lib/models/Booking";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

// GET /api/rides/[id] — get ride by ID
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }

    await connectDB();

    const ride = await Ride.findById(id);
    if (!ride) {
      return NextResponse.json({ message: "Ride not found." }, { status: 404 });
    }

    return NextResponse.json(ride, { status: 200 });
  } catch (error: any) {
    console.error("Get ride error:", error);
    return NextResponse.json(
      { message: "Failed to fetch ride details." },
      { status: 500 }
    );
  }
}

// PUT /api/rides/[id] — update ride
export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    const authResult = await requireAuth(req, ["driver", "admin"]);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();
    const { origin, destination, departureTime, availableSeats, pricePerSeat, vehicleDetails, status } = await req.json();

    const ride = await Ride.findById(id);
    if (!ride) {
      return NextResponse.json({ message: "Ride not found." }, { status: 404 });
    }

    // Authorization check
    if (ride.driverId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "Access forbidden: you are not the driver of this ride." },
        { status: 403 }
      );
    }

    // Update fields
    if (origin) ride.origin = origin;
    if (destination) ride.destination = destination;
    if (departureTime) ride.departureTime = new Date(departureTime);
    if (availableSeats !== undefined) ride.availableSeats = Number(availableSeats);
    if (pricePerSeat !== undefined) ride.pricePerSeat = Number(pricePerSeat);
    if (vehicleDetails) ride.vehicleDetails = vehicleDetails;
    if (status) ride.status = status;

    await ride.save();
    return NextResponse.json(ride, { status: 200 });
  } catch (error: any) {
    console.error("Update ride error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update ride." },
      { status: 500 }
    );
  }
}

// DELETE /api/rides/[id] — delete ride
export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    const authResult = await requireAuth(req, ["driver", "admin"]);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();

    const ride = await Ride.findById(id);
    if (!ride) {
      return NextResponse.json({ message: "Ride not found." }, { status: 404 });
    }

    // Authorization check
    if (ride.driverId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "Access forbidden: you are not the driver of this ride." },
        { status: 403 }
      );
    }

    // Cascade delete associated bookings
    await Booking.deleteMany({ rideId: ride._id });

    await Ride.findByIdAndDelete(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Delete ride error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete ride." },
      { status: 500 }
    );
  }
}
