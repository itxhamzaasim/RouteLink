import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { DirectMessage } from "@/lib/models/DirectMessage";
import { Booking } from "@/lib/models/Booking";
import { Ride } from "@/lib/models/Ride";
import { RideRequest } from "@/lib/models/RideRequest";
import { User } from "@/lib/models/User";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

// GET /api/messages?partnerId=...
// Fetches conversation history between logged-in user and the partner
export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get("partnerId");

    if (!partnerId) {
      return NextResponse.json(
        { message: "Partner ID is required." },
        { status: 400 }
      );
    }

    await connectDB();
    const userId = user._id.toString();

    // Mark all incoming messages from this partner as read
    await DirectMessage.updateMany(
      { senderId: partnerId, recipientId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    const messages = await DirectMessage.find({
      $or: [
        { senderId: userId, recipientId: partnerId },
        { senderId: partnerId, recipientId: userId },
      ],
    }).sort({ createdAt: 1 });

    return NextResponse.json(messages, { status: 200 });
  } catch (error: any) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { message: "Failed to fetch messages." },
      { status: 500 }
    );
  }
}


// POST /api/messages
// Sends a direct message to a partner
export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();
    const { recipientId, content } = await req.json();

    if (!recipientId || !content || !content.trim()) {
      return NextResponse.json(
        { message: "Recipient ID and message content are required." },
        { status: 400 }
      );
    }

    const userId = user._id.toString();

    // Enforce Chat Partner authorization (except for Admin)
    if (user.role !== "admin") {
      let isAllowed = false;

      if (user.role === "passenger") {
        // 1. Check if there's an accepted booking on a ride driven by recipientId
        const driverRides = await Ride.find({ driverId: recipientId });
        const driverRideIds = driverRides.map((r) => r._id);
        
        const bookingExists = await Booking.exists({
          passengerId: userId,
          rideId: { $in: driverRideIds },
          status: "accepted",
        });

        if (bookingExists) {
          isAllowed = true;
        } else {
          // 2. Check if there's an accepted ride request accepted by recipientId
          const requestExists = await RideRequest.exists({
            passengerId: userId,
            driverId: recipientId,
            status: "accepted",
          });
          if (requestExists) isAllowed = true;
        }
      } else if (user.role === "driver") {
        // 1. Check if there's an accepted booking on a ride driven by this driver
        const myRides = await Ride.find({ driverId: userId });
        const myRideIds = myRides.map((r) => r._id);

        const bookingExists = await Booking.exists({
          passengerId: recipientId,
          rideId: { $in: myRideIds },
          status: "accepted",
        });

        if (bookingExists) {
          isAllowed = true;
        } else {
          // 2. Check if there's an accepted ride request made by recipientId and accepted by me
          const requestExists = await RideRequest.exists({
            passengerId: recipientId,
            driverId: userId,
            status: "accepted",
          });
          if (requestExists) isAllowed = true;
        }
      }

      if (!isAllowed) {
        return NextResponse.json(
          { message: "Forbidden: You can only message users you have an accepted ride connection with." },
          { status: 403 }
        );
      }
    }

    const message = new DirectMessage({
      senderId: userId,
      recipientId,
      content: content.trim(),
    });

    await message.save();
    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error("Post direct message error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to send direct message." },
      { status: 500 }
    );
  }
}
