import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { Booking } from "@/lib/models/Booking";
import { Ride } from "@/lib/models/Ride";
import { Notification } from "@/lib/models/Notification";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

// GET /api/bookings — get passenger bookings
export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();

    const bookings = await Booking.find({ passengerId: user._id }).sort({ createdAt: -1 });

    const bookingsWithDriverId = await Promise.all(
      bookings.map(async (b) => {
        const obj = b.toJSON();
        if (!obj.rideDetails.driverId) {
          const ride = await Ride.findById(b.rideId);
          if (ride) {
            obj.rideDetails.driverId = ride.driverId.toString();
          }
        }
        return obj;
      })
    );
    return NextResponse.json(bookingsWithDriverId, { status: 200 });
  } catch (error: any) {
    console.error("Get passenger bookings error:", error);
    return NextResponse.json(
      { message: "Failed to fetch bookings." },
      { status: 500 }
    );
  }
}

// POST /api/bookings — create booking
export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();
    const { rideId, seatsBooked = 1 } = await req.json();

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return NextResponse.json({ message: "Ride not found." }, { status: 404 });
    }

    // A driver cannot request seats on their own ride
    if (ride.driverId.toString() === user._id.toString()) {
      return NextResponse.json(
        { message: "You cannot request seats on a ride you are offering." },
        { status: 400 }
      );
    }

    if (ride.status !== "scheduled") {
      return NextResponse.json(
        { message: "This ride is no longer accepting requests." },
        { status: 400 }
      );
    }

    if (ride.availableSeats < seatsBooked) {
      return NextResponse.json(
        { message: `Only ${ride.availableSeats} seat(s) are available.` },
        { status: 400 }
      );
    }

    const passengerName = `${user.firstName} ${user.lastName}`;
    const totalPrice = seatsBooked * ride.pricePerSeat;

    const booking = new Booking({
      rideId: ride._id,
      passengerId: user._id,
      passengerName,
      seatsBooked,
      totalPrice,
      status: "pending",
      rideDetails: {
        origin: ride.origin,
        destination: ride.destination,
        departureTime: ride.departureTime,
        driverName: ride.driverName,
        driverId: ride.driverId,
      },
    });

    await booking.save();

    // Create Notification for the driver
    const driverNotification = new Notification({
      userId: ride.driverId,
      title: "New Ride Request",
      message: `${passengerName} requested ${seatsBooked} seat(s) on your ride from ${ride.origin.city} to ${ride.destination.city}.`,
    });
    await driverNotification.save();

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to submit booking request." },
      { status: 500 }
    );
  }
}
