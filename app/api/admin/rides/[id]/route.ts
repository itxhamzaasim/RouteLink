import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { Ride } from "@/lib/models/Ride";
import { Booking } from "@/lib/models/Booking";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function DELETE(
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

    const ride = await Ride.findById(id);
    if (!ride) {
      return NextResponse.json({ message: "Ride not found." }, { status: 404 });
    }

    // Cascade delete any bookings for this ride
    await Booking.deleteMany({ rideId: ride._id });

    await Ride.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Ride and matching bookings successfully removed." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete ride error:", error);
    return NextResponse.json(
      { message: "Failed to delete ride listing." },
      { status: 500 }
    );
  }
}
