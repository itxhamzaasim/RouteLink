import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { User } from "@/lib/models/User";
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
    const { user: currentAdmin } = authResult;

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Protect active user from deleting themselves
    if (currentAdmin._id.toString() === id) {
      return NextResponse.json(
        { message: "You cannot delete your own admin account." },
        { status: 400 }
      );
    }

    // Cascade operations: delete all rides hosted by this user
    await Ride.deleteMany({ driverId: user._id });

    // Cancel or delete bookings associated with this user
    await Booking.deleteMany({ passengerId: user._id });

    await User.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "User and associated data successfully removed." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { message: "Failed to delete user." },
      { status: 500 }
    );
  }
}
