import { Response } from "express";
import { User } from "../models/User.js";
import { Ride } from "../models/Ride.js";
import { Booking } from "../models/Booking.js";
import { AuthRequest } from "../middleware/auth.js";

export async function getStats(req: AuthRequest, res: Response): Promise<void> {
  try {
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

    res.status(200).json({
      totalUsers,
      totalDrivers,
      totalPassengers,
      totalRides,
      activeRequests,
      usersTrend,
      ridesTrend,
      recentUsers: recentUsersList,
      recentRides: recentRidesList,
    });
  } catch (error: any) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ message: "Failed to load dashboard statistics." });
  }
}

export async function getUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error: any) {
    console.error("Get admin users error:", error);
    res.status(500).json({ message: "Failed to fetch user list." });
  }
}

export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role, isVerified } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (role && ["admin", "driver", "passenger"].includes(role)) {
      user.role = role as any;
    }

    if (isVerified !== undefined) {
      user.isVerified = !!isVerified;
    }

    await user.save();
    res.status(200).json(user);
  } catch (error: any) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Failed to update user profile." });
  }
}

export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Protect active user from deleting themselves
    if (req.user && req.user._id.toString() === id) {
      res.status(400).json({ message: "You cannot delete your own admin account." });
      return;
    }

    // Cascade operations: delete all rides hosted by this user
    await Ride.deleteMany({ driverId: user._id });

    // Cancel or delete bookings associated with this user
    await Booking.deleteMany({ passengerId: user._id });

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User and associated data successfully removed." });
  } catch (error: any) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user." });
  }
}

export async function getRides(req: AuthRequest, res: Response): Promise<void> {
  try {
    const rides = await Ride.find().sort({ createdAt: -1 });
    res.status(200).json(rides);
  } catch (error: any) {
    console.error("Get admin rides error:", error);
    res.status(500).json({ message: "Failed to fetch rides listing." });
  }
}

export async function deleteRide(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const ride = await Ride.findById(id);
    if (!ride) {
      res.status(404).json({ message: "Ride not found." });
      return;
    }

    // Cascade delete any bookings for this ride
    await Booking.deleteMany({ rideId: ride._id });

    await Ride.findByIdAndDelete(id);

    res.status(200).json({ message: "Ride and matching bookings successfully removed." });
  } catch (error: any) {
    console.error("Delete ride error:", error);
    res.status(500).json({ message: "Failed to delete ride listing." });
  }
}

export async function getBookings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error: any) {
    console.error("Get admin bookings report error:", error);
    res.status(500).json({ message: "Failed to retrieve booking reports." });
  }
}
