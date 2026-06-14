import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { Booking } from "@/lib/models/Booking";
import { Ride } from "@/lib/models/Ride";
import { Notification } from "@/lib/models/Notification";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function PATCH(
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
    const { user } = authResult;

    await connectDB();
    const { status } = await req.json(); // 'accepted' | 'rejected' | 'cancelled'

    if (!["accepted", "rejected", "cancelled"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status state transition requested." },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ message: "Booking not found." }, { status: 404 });
    }

    const ride = await Ride.findById(booking.rideId);
    if (!ride) {
      return NextResponse.json({ message: "Associated ride not found." }, { status: 404 });
    }

    // Role check and ownership validations
    const isDriver = ride.driverId.toString() === user._id.toString();
    const isPassenger = booking.passengerId.toString() === user._id.toString();

    if (status === "accepted" || status === "rejected") {
      if (!isDriver) {
        return NextResponse.json(
          { message: "Only the driver can accept or decline bookings." },
          { status: 403 }
        );
      }
    }

    if (status === "cancelled") {
      if (!isDriver && !isPassenger) {
        return NextResponse.json(
          { message: "You are not authorized to cancel this booking." },
          { status: 403 }
        );
      }
    }

    // Verify current state is not final
    if (["cancelled", "rejected"].includes(booking.status)) {
      return NextResponse.json(
        { message: `Cannot change status. Booking is already ${booking.status}.` },
        { status: 400 }
      );
    }

    const oldStatus = booking.status;

    // Transition logical modifications
    if (status === "accepted") {
      if (oldStatus === "accepted") {
        return NextResponse.json({ message: "Booking is already accepted." }, { status: 400 });
      }

      // Decrement the available seats by the number of seats booked
      const updatedRide = await Ride.findById(booking.rideId);
      if (!updatedRide) {
        return NextResponse.json(
          { message: "Associated ride not found." },
          { status: 400 }
        );
      }

      if (updatedRide.availableSeats < booking.seatsBooked) {
        return NextResponse.json(
          { message: `Not enough available seats left. Only ${updatedRide.availableSeats} seat(s) left.` },
          { status: 400 }
        );
      }

      updatedRide.availableSeats -= booking.seatsBooked;
      await updatedRide.save();

      // Notify accepted passenger
      const notification = new Notification({
        userId: booking.passengerId,
        title: "Ride Request Confirmed",
        message: `Your request for ${booking.seatsBooked} seat(s) on the ride from ${updatedRide.origin.city} to ${updatedRide.destination.city} has been accepted.`,
      });
      await notification.save();

      // Reject other pending bookings for this same ride that exceed the remaining available seats
      const otherPendingBookings = await Booking.find({
        rideId: booking.rideId,
        _id: { $ne: booking._id },
        status: "pending",
        seatsBooked: { $gt: updatedRide.availableSeats },
      });

      for (const pendingBk of otherPendingBookings) {
        pendingBk.status = "rejected";
        await pendingBk.save();

        // Notify other passenger that they were declined
        const declineNotif = new Notification({
          userId: pendingBk.passengerId,
          title: "Ride Request Declined",
          message: `Your request for ${pendingBk.seatsBooked} seat(s) on the ride from ${updatedRide.origin.city} to ${updatedRide.destination.city} was declined because not enough available seats remain.`,
        });
        await declineNotif.save();
      }
    } 

    
    else if (status === "rejected") {
      if (oldStatus === "accepted") {
        return NextResponse.json(
          { message: "Cannot decline a booking that has already been accepted." },
          { status: 400 }
        );
      }

      // Notify passenger
      const notification = new Notification({
        userId: booking.passengerId,
        title: "Ride Request Declined",
        message: `Your request for ${booking.seatsBooked} seat(s) on the ride from ${ride.origin.city} to ${ride.destination.city} was declined.`,
      });
      await notification.save();
    } 
    
    else if (status === "cancelled") {
      // If accepted, restore available seats
      if (oldStatus === "accepted") {
        ride.availableSeats += booking.seatsBooked;
        await ride.save();
      }

      // Send cancellation notifications
      if (isPassenger) {
        // Notify driver
        const notification = new Notification({
          userId: ride.driverId,
          title: "Passenger Booking Cancelled",
          message: `${booking.passengerName} has cancelled their booking on your ride from ${ride.origin.city} to ${ride.destination.city}.`,
        });
        await notification.save();
      } else if (isDriver) {
        // Notify passenger
        const notification = new Notification({
          userId: booking.passengerId,
          title: "Booking Cancelled by Driver",
          message: `The driver has cancelled your booking on the ride from ${ride.origin.city} to ${ride.destination.city}.`,
        });
        await notification.save();
      }
    }

    booking.status = status;
    await booking.save();

    return NextResponse.json(booking, { status: 200 });
  } catch (error: any) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update booking status." },
      { status: 500 }
    );
  }
}
