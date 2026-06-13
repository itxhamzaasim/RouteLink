"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
exports.updateBookingStatus = updateBookingStatus;
exports.getPassengerBookings = getPassengerBookings;
exports.getDriverRidesBookings = getDriverRidesBookings;
const Booking_js_1 = require("../models/Booking.js");
const Ride_js_1 = require("../models/Ride.js");
const Notification_js_1 = require("../models/Notification.js");
async function createBooking(req, res) {
    try {
        const { rideId, seatsBooked = 1 } = req.body;
        if (!req.user) {
            res.status(401).json({ message: "Authentication required." });
            return;
        }
        const ride = await Ride_js_1.Ride.findById(rideId);
        if (!ride) {
            res.status(404).json({ message: "Ride not found." });
            return;
        }
        // A driver cannot request seats on their own ride
        if (ride.driverId.toString() === req.user._id.toString()) {
            res.status(400).json({ message: "You cannot request seats on a ride you are offering." });
            return;
        }
        if (ride.status !== "scheduled") {
            res.status(400).json({ message: "This ride is no longer accepting requests." });
            return;
        }
        if (ride.availableSeats < seatsBooked) {
            res.status(400).json({ message: `Only ${ride.availableSeats} seat(s) are available.` });
            return;
        }
        const passengerName = `${req.user.firstName} ${req.user.lastName}`;
        const totalPrice = seatsBooked * ride.pricePerSeat;
        const booking = new Booking_js_1.Booking({
            rideId: ride._id,
            passengerId: req.user._id,
            passengerName,
            seatsBooked,
            totalPrice,
            status: "pending",
            rideDetails: {
                origin: ride.origin,
                destination: ride.destination,
                departureTime: ride.departureTime,
                driverName: ride.driverName,
            },
        });
        await booking.save();
        // Create Notification for the driver
        const driverNotification = new Notification_js_1.Notification({
            userId: ride.driverId,
            title: "New Ride Request",
            message: `${passengerName} requested ${seatsBooked} seat(s) on your ride from ${ride.origin.city} to ${ride.destination.city}.`,
        });
        await driverNotification.save();
        res.status(201).json(booking);
    }
    catch (error) {
        console.error("Create booking error:", error);
        res.status(500).json({ message: error.message || "Failed to submit booking request." });
    }
}
async function updateBookingStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'accepted' | 'rejected' | 'cancelled'
        if (!req.user) {
            res.status(401).json({ message: "Authentication required." });
            return;
        }
        if (!["accepted", "rejected", "cancelled"].includes(status)) {
            res.status(400).json({ message: "Invalid status state transition requested." });
            return;
        }
        const booking = await Booking_js_1.Booking.findById(id);
        if (!booking) {
            res.status(404).json({ message: "Booking not found." });
            return;
        }
        const ride = await Ride_js_1.Ride.findById(booking.rideId);
        if (!ride) {
            res.status(404).json({ message: "Associated ride not found." });
            return;
        }
        // Role check and ownership validations
        const isDriver = ride.driverId.toString() === req.user._id.toString();
        const isPassenger = booking.passengerId.toString() === req.user._id.toString();
        if (status === "accepted" || status === "rejected") {
            if (!isDriver) {
                res.status(403).json({ message: "Only the driver can accept or decline bookings." });
                return;
            }
        }
        if (status === "cancelled") {
            if (!isDriver && !isPassenger) {
                res.status(403).json({ message: "You are not authorized to cancel this booking." });
                return;
            }
        }
        // Verify current state is not final
        if (["cancelled", "rejected"].includes(booking.status)) {
            res.status(400).json({ message: `Cannot change status. Booking is already ${booking.status}.` });
            return;
        }
        const oldStatus = booking.status;
        // Transition logical modifications
        if (status === "accepted") {
            if (oldStatus === "accepted") {
                res.status(400).json({ message: "Booking is already accepted." });
                return;
            }
            // Decrement seats atomically to prevent race conditions
            const updatedRide = await Ride_js_1.Ride.findOneAndUpdate({ _id: booking.rideId, availableSeats: { $gte: booking.seatsBooked } }, { $inc: { availableSeats: -booking.seatsBooked } }, { new: true });
            if (!updatedRide) {
                res.status(400).json({ message: "Insufficient available seats on this ride to accept." });
                return;
            }
            // Notify passenger
            const notification = new Notification_js_1.Notification({
                userId: booking.passengerId,
                title: "Ride Request Confirmed",
                message: `Your request for ${booking.seatsBooked} seat(s) on the ride from ${updatedRide.origin.city} to ${updatedRide.destination.city} has been accepted.`,
            });
            await notification.save();
        }
        else if (status === "rejected") {
            if (oldStatus === "accepted") {
                res.status(400).json({ message: "Cannot decline a booking that has already been accepted." });
                return;
            }
            // Notify passenger
            const notification = new Notification_js_1.Notification({
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
                const notification = new Notification_js_1.Notification({
                    userId: ride.driverId,
                    title: "Passenger Booking Cancelled",
                    message: `${booking.passengerName} has cancelled their booking on your ride from ${ride.origin.city} to ${ride.destination.city}.`,
                });
                await notification.save();
            }
            else if (isDriver) {
                // Notify passenger
                const notification = new Notification_js_1.Notification({
                    userId: booking.passengerId,
                    title: "Booking Cancelled by Driver",
                    message: `The driver has cancelled your booking on the ride from ${ride.origin.city} to ${ride.destination.city}.`,
                });
                await notification.save();
            }
        }
        booking.status = status;
        await booking.save();
        res.status(200).json(booking);
    }
    catch (error) {
        console.error("Update booking error:", error);
        res.status(500).json({ message: error.message || "Failed to update booking status." });
    }
}
async function getPassengerBookings(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Authentication required." });
            return;
        }
        const bookings = await Booking_js_1.Booking.find({ passengerId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(bookings);
    }
    catch (error) {
        console.error("Get passenger bookings error:", error);
        res.status(500).json({ message: "Failed to fetch bookings." });
    }
}
async function getDriverRidesBookings(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Authentication required." });
            return;
        }
        // Find all rides belonging to this driver
        const rides = await Ride_js_1.Ride.find({ driverId: req.user._id }, "_id");
        const rideIds = rides.map((r) => r._id);
        // Find all bookings for these rides
        const bookings = await Booking_js_1.Booking.find({ rideId: { $in: rideIds } }).sort({ createdAt: -1 });
        res.status(200).json(bookings);
    }
    catch (error) {
        console.error("Get driver rides bookings error:", error);
        res.status(500).json({ message: "Failed to fetch passenger requests." });
    }
}
