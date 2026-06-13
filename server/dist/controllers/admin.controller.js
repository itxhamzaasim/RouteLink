"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = getStats;
exports.getUsers = getUsers;
exports.updateUserRole = updateUserRole;
exports.deleteUser = deleteUser;
exports.getRides = getRides;
exports.deleteRide = deleteRide;
exports.getBookings = getBookings;
const User_js_1 = require("../models/User.js");
const Ride_js_1 = require("../models/Ride.js");
const Booking_js_1 = require("../models/Booking.js");
async function getStats(req, res) {
    try {
        const totalUsers = await User_js_1.User.countDocuments();
        const totalDrivers = await User_js_1.User.countDocuments({ role: "driver" });
        const totalPassengers = await User_js_1.User.countDocuments({ role: "passenger" });
        const totalRides = await Ride_js_1.Ride.countDocuments();
        const activeRequests = await Booking_js_1.Booking.countDocuments({ status: "pending" });
        // Generate daily trend labels for the last 7 days
        const dailyLabels = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dailyLabels.push(d.toISOString().split("T")[0]);
        }
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const recentUsersData = await User_js_1.User.find({ createdAt: { $gte: sevenDaysAgo } });
        const recentRidesData = await Ride_js_1.Ride.find({ createdAt: { $gte: sevenDaysAgo } });
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
        const recentUsersList = await User_js_1.User.find().sort({ createdAt: -1 }).limit(5);
        const recentRidesList = await Ride_js_1.Ride.find().sort({ createdAt: -1 }).limit(5);
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
    }
    catch (error) {
        console.error("Get admin stats error:", error);
        res.status(500).json({ message: "Failed to load dashboard statistics." });
    }
}
async function getUsers(req, res) {
    try {
        const users = await User_js_1.User.find().sort({ createdAt: -1 });
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Get admin users error:", error);
        res.status(500).json({ message: "Failed to fetch user list." });
    }
}
async function updateUserRole(req, res) {
    try {
        const { id } = req.params;
        const { role, isVerified } = req.body;
        const user = await User_js_1.User.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        if (role && ["admin", "driver", "passenger"].includes(role)) {
            user.role = role;
        }
        if (isVerified !== undefined) {
            user.isVerified = !!isVerified;
        }
        await user.save();
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Update user role error:", error);
        res.status(500).json({ message: "Failed to update user profile." });
    }
}
async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        const user = await User_js_1.User.findById(id);
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
        await Ride_js_1.Ride.deleteMany({ driverId: user._id });
        // Cancel or delete bookings associated with this user
        await Booking_js_1.Booking.deleteMany({ passengerId: user._id });
        await User_js_1.User.findByIdAndDelete(id);
        res.status(200).json({ message: "User and associated data successfully removed." });
    }
    catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: "Failed to delete user." });
    }
}
async function getRides(req, res) {
    try {
        const rides = await Ride_js_1.Ride.find().sort({ createdAt: -1 });
        res.status(200).json(rides);
    }
    catch (error) {
        console.error("Get admin rides error:", error);
        res.status(500).json({ message: "Failed to fetch rides listing." });
    }
}
async function deleteRide(req, res) {
    try {
        const { id } = req.params;
        const ride = await Ride_js_1.Ride.findById(id);
        if (!ride) {
            res.status(404).json({ message: "Ride not found." });
            return;
        }
        // Cascade delete any bookings for this ride
        await Booking_js_1.Booking.deleteMany({ rideId: ride._id });
        await Ride_js_1.Ride.findByIdAndDelete(id);
        res.status(200).json({ message: "Ride and matching bookings successfully removed." });
    }
    catch (error) {
        console.error("Delete ride error:", error);
        res.status(500).json({ message: "Failed to delete ride listing." });
    }
}
async function getBookings(req, res) {
    try {
        const bookings = await Booking_js_1.Booking.find().sort({ createdAt: -1 });
        res.status(200).json(bookings);
    }
    catch (error) {
        console.error("Get admin bookings report error:", error);
        res.status(500).json({ message: "Failed to retrieve booking reports." });
    }
}
