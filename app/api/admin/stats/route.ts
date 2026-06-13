import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { User } from "@/lib/models/User";
import { Ride } from "@/lib/models/Ride";
import { Booking } from "@/lib/models/Booking";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req, ["admin"]);
    if (isNextResponse(authResult)) {
      return authResult;
    }

    await connectDB();

    const totalUsers = await User.countDocuments();
    const totalDrivers = await User.countDocuments({ role: "driver" });
    const totalPassengers = await User.countDocuments({ role: "passenger" });
    const totalRides = await Ride.countDocuments();
    const activeRequests = await Booking.countDocuments({ status: "pending" });

    // Generate daily trend labels for the last 7 days
    const dailyLabels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyLabels.push(d.toISOString().split("T")[0]);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentUsersData = await User.find({ createdAt: { $gte: sevenDaysAgo } });
    const recentRidesData = await Ride.find({ createdAt: { $gte: sevenDaysAgo } });

    const usersTrend = dailyLabels.map((label) => {
      const count = recentUsersData.filter((u) => {
        const dateStr = new Date(u.createdAt).toISOString().split("T")[0];
        return dateStr === label;
      }).length;
      return { label, count };
    });

    const ridesTrend = dailyLabels.map((label) => {
      const count = recentRidesData.filter((r) => {
        const dateStr = new Date(r.createdAt).toISOString().split("T")[0];
        return dateStr === label;
      }).length;
      return { label, count };
    });

    // Recent lists for overview widgets
    const recentUsersList = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentRidesList = await Ride.find().sort({ createdAt: -1 }).limit(5);

    return NextResponse.json({
      totalUsers,
      totalDrivers,
      totalPassengers,
      totalRides,
      activeRequests,
      usersTrend,
      ridesTrend,
      recentUsers: recentUsersList,
      recentRides: recentRidesList,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Get admin stats error:", error);
    return NextResponse.json(
      { message: "Failed to load dashboard statistics." },
      { status: 500 }
    );
  }
}
