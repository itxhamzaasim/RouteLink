import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { Booking } from "@/lib/models/Booking";
import { Ride } from "@/lib/models/Ride";
import { RideRequest } from "@/lib/models/RideRequest";
import { User } from "@/lib/models/User";
import { DirectMessage } from "@/lib/models/DirectMessage";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();

    const partners = new Map<string, { id: string; name: string; role: string; unreadCount?: number }>();
    const userId = user._id.toString();

    // Fetch unread messages to count them per partner
    const unreadMessages = await DirectMessage.find({ recipientId: userId, isRead: false });
    const unreadCounts = new Map<string, number>();
    for (const msg of unreadMessages) {
      const sender = msg.senderId.toString();
      unreadCounts.set(sender, (unreadCounts.get(sender) || 0) + 1);
    }

    if (user.role === "passenger") {
      // 1. Fetch accepted bookings where logged-in user is passenger
      const bookings = await Booking.find({ passengerId: userId, status: "accepted" });
      for (const booking of bookings) {
        const ride = await Ride.findById(booking.rideId);
        if (ride) {
          partners.set(ride.driverId.toString(), {
            id: ride.driverId.toString(),
            name: ride.driverName || "Driver",
            role: "driver",
            unreadCount: unreadCounts.get(ride.driverId.toString()) || 0,
          });
        }
      }

      // 2. Fetch accepted ride requests where logged-in user is passenger
      const requests = await RideRequest.find({ passengerId: userId, status: "accepted" });
      for (const reqObj of requests) {
        if (reqObj.driverId) {
          const driverUser = await User.findById(reqObj.driverId);
          if (driverUser) {
            partners.set(reqObj.driverId.toString(), {
              id: reqObj.driverId.toString(),
              name: `${driverUser.firstName} ${driverUser.lastName}`,
              role: "driver",
              unreadCount: unreadCounts.get(reqObj.driverId.toString()) || 0,
            });
          }
        }
      }
    } else if (user.role === "driver") {
      // 1. Fetch rides offered by this driver
      const rides = await Ride.find({ driverId: userId });
      const rideIds = rides.map((r) => r._id);

      // Find accepted bookings on those rides
      if (rideIds.length > 0) {
        const bookings = await Booking.find({ rideId: { $in: rideIds }, status: "accepted" });
        for (const booking of bookings) {
          partners.set(booking.passengerId.toString(), {
            id: booking.passengerId.toString(),
            name: booking.passengerName || "Passenger",
            role: "passenger",
            unreadCount: unreadCounts.get(booking.passengerId.toString()) || 0,
          });
        }
      }

      // 2. Fetch accepted ride requests where this driver accepted it
      const requests = await RideRequest.find({ driverId: userId, status: "accepted" });
      for (const reqObj of requests) {
        const passengerUser = await User.findById(reqObj.passengerId);
        if (passengerUser) {
          partners.set(reqObj.passengerId.toString(), {
            id: reqObj.passengerId.toString(),
            name: `${passengerUser.firstName} ${passengerUser.lastName}`,
            role: "passenger",
            unreadCount: unreadCounts.get(reqObj.passengerId.toString()) || 0,
          });
        }
      }
    } else if (user.role === "admin") {
      // Admins can view/chat with any active users or all drivers/passengers
      // Let's populate some active drivers and passengers for admin to chat with
      const activeUsers = await User.find({ role: { $ne: "admin" } }).limit(20);
      for (const u of activeUsers) {
        partners.set(u._id.toString(), {
          id: u._id.toString(),
          name: `${u.firstName} ${u.lastName}`,
          role: u.role,
          unreadCount: unreadCounts.get(u._id.toString()) || 0,
        });
      }
    }

    return NextResponse.json(Array.from(partners.values()), { status: 200 });
  } catch (error: any) {
    console.error("Get chat partners error:", error);
    return NextResponse.json(
      { message: "Failed to fetch chat partners." },
      { status: 500 }
    );
  }
}
