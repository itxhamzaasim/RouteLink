"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRide = createRide;
exports.updateRide = updateRide;
exports.deleteRide = deleteRide;
exports.getDriverRides = getDriverRides;
exports.searchRides = searchRides;
exports.getRideById = getRideById;
const Ride_js_1 = require("../models/Ride.js");
const Booking_js_1 = require("../models/Booking.js");
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function createRide(req, res) {
    try {
        const { origin, destination, departureTime, availableSeats, pricePerSeat, vehicleDetails } = req.body;
        if (!req.user) {
            res.status(401).json({ message: "Authentication required." });
            return;
        }
        // Validation
        if (!origin?.address || !origin?.city || !destination?.address || !destination?.city || !departureTime || !availableSeats || pricePerSeat === undefined || !vehicleDetails?.make || !vehicleDetails?.model || !vehicleDetails?.licensePlate) {
            res.status(400).json({ message: "Required ride management fields are missing or invalid." });
            return;
        }
        const driverName = `${req.user.firstName} ${req.user.lastName}`;
        const ride = new Ride_js_1.Ride({
            driverId: req.user._id,
            driverName,
            driverRating: 5.0, // Default for prototyping
            origin,
            destination,
            departureTime: new Date(departureTime),
            availableSeats: Number(availableSeats),
            pricePerSeat: Number(pricePerSeat),
            status: "scheduled",
            vehicleDetails,
        });
        await ride.save();
        res.status(201).json(ride);
    }
    catch (error) {
        console.error("Create ride error:", error);
        res.status(500).json({ message: error.message || "Failed to create ride." });
    }
}
async function updateRide(req, res) {
    try {
        const { id } = req.params;
        const { origin, destination, departureTime, availableSeats, pricePerSeat, vehicleDetails, status } = req.body;
        if (!req.user) {
            res.status(401).json({ message: "Authentication required." });
            return;
        }
        const ride = await Ride_js_1.Ride.findById(id);
        if (!ride) {
            res.status(404).json({ message: "Ride not found." });
            return;
        }
        // Authorization: verify user is the driver who owns this ride
        if (ride.driverId.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: "Access forbidden: you are not the driver of this ride." });
            return;
        }
        // Update fields
        if (origin)
            ride.origin = origin;
        if (destination)
            ride.destination = destination;
        if (departureTime)
            ride.departureTime = new Date(departureTime);
        if (availableSeats !== undefined)
            ride.availableSeats = Number(availableSeats);
        if (pricePerSeat !== undefined)
            ride.pricePerSeat = Number(pricePerSeat);
        if (vehicleDetails)
            ride.vehicleDetails = vehicleDetails;
        if (status)
            ride.status = status;
        await ride.save();
        res.status(200).json(ride);
    }
    catch (error) {
        console.error("Update ride error:", error);
        res.status(500).json({ message: error.message || "Failed to update ride." });
    }
}
async function deleteRide(req, res) {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({ message: "Authentication required." });
            return;
        }
        const ride = await Ride_js_1.Ride.findById(id);
        if (!ride) {
            res.status(404).json({ message: "Ride not found." });
            return;
        }
        // Authorization Check
        if (ride.driverId.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: "Access forbidden: you are not the driver of this ride." });
            return;
        }
        // Cascade delete associated bookings
        await Booking_js_1.Booking.deleteMany({ rideId: ride._id });
        await Ride_js_1.Ride.findByIdAndDelete(id);
        res.status(204).end();
    }
    catch (error) {
        console.error("Delete ride error:", error);
        res.status(500).json({ message: error.message || "Failed to delete ride." });
    }
}
async function getDriverRides(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Authentication required." });
            return;
        }
        const rides = await Ride_js_1.Ride.find({ driverId: req.user._id }).sort({ departureTime: 1 });
        res.status(200).json(rides);
    }
    catch (error) {
        console.error("Get driver rides error:", error);
        res.status(500).json({ message: "Failed to fetch driver rides." });
    }
}
async function searchRides(req, res) {
    try {
        const { originCity, destinationCity, date, seats, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
        const pageNumber = Math.max(1, Number(page));
        const limitNumber = Math.max(1, Number(limit));
        const skip = (pageNumber - 1) * limitNumber;
        // Build filter query object
        const query = { status: "scheduled" };
        if (originCity && String(originCity).trim()) {
            const escaped = escapeRegExp(String(originCity).trim());
            query["origin.city"] = { $regex: new RegExp(escaped, "i") };
        }
        if (destinationCity && String(destinationCity).trim()) {
            const escaped = escapeRegExp(String(destinationCity).trim());
            query["destination.city"] = { $regex: new RegExp(escaped, "i") };
        }
        if (seats) {
            query.availableSeats = { $gte: Math.max(1, Number(seats)) };
        }
        else {
            query.availableSeats = { $gte: 1 };
        }
        // Departure time check
        if (date && String(date).trim()) {
            const startOfDay = new Date(`${date}T00:00:00.000Z`);
            const endOfDay = new Date(`${date}T23:59:59.999Z`);
            query.departureTime = { $gte: startOfDay, $lte: endOfDay };
        }
        else {
            // Future rides only if no date is specified
            query.departureTime = { $gte: new Date() };
        }
        // Sorting
        const sortField = sortBy === "price" ? "pricePerSeat" : "departureTime";
        const sortDir = sortOrder === "desc" ? -1 : 1;
        const sortOptions = { [sortField]: sortDir };
        // Execute queries in parallel
        const [total, results] = await Promise.all([
            Ride_js_1.Ride.countDocuments(query),
            Ride_js_1.Ride.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNumber),
        ]);
        res.status(200).json({
            rides: results,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(total / limitNumber),
            },
        });
    }
    catch (error) {
        console.error("Search rides error:", error);
        res.status(500).json({ message: error.message || "Failed to query rides database." });
    }
}
async function getRideById(req, res) {
    try {
        const { id } = req.params;
        const ride = await Ride_js_1.Ride.findById(id);
        if (!ride) {
            res.status(404).json({ message: "Ride not found." });
            return;
        }
        res.status(200).json(ride);
    }
    catch (error) {
        console.error("Get ride error:", error);
        res.status(500).json({ message: "Failed to fetch ride details." });
    }
}
