"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ride = void 0;
const mongoose_1 = require("mongoose");
const RideSchema = new mongoose_1.Schema({
    driverId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Driver ID is required"],
        index: true,
    },
    driverName: {
        type: String,
        required: [true, "Driver name is required"],
        trim: true,
    },
    driverRating: {
        type: Number,
        default: 5.0,
    },
    origin: {
        address: {
            type: String,
            required: [true, "Origin address is required"],
            trim: true,
        },
        city: {
            type: String,
            required: [true, "Origin city is required"],
            trim: true,
            index: true,
        },
    },
    destination: {
        address: {
            type: String,
            required: [true, "Destination address is required"],
            trim: true,
        },
        city: {
            type: String,
            required: [true, "Destination city is required"],
            trim: true,
            index: true,
        },
    },
    departureTime: {
        type: Date,
        required: [true, "Departure time is required"],
    },
    availableSeats: {
        type: Number,
        required: [true, "Available seats count is required"],
        min: [1, "Seats count must be at least 1"],
    },
    pricePerSeat: {
        type: Number,
        required: [true, "Price per seat is required"],
        min: [0, "Price cannot be negative"],
    },
    status: {
        type: String,
        enum: ["scheduled", "in_progress", "completed", "cancelled"],
        default: "scheduled",
    },
    vehicleDetails: {
        make: {
            type: String,
            required: [true, "Vehicle make is required"],
            trim: true,
        },
        model: {
            type: String,
            required: [true, "Vehicle model is required"],
            trim: true,
        },
        licensePlate: {
            type: String,
            required: [true, "Vehicle license plate is required"],
            trim: true,
        },
        color: {
            type: String,
            trim: true,
            default: "",
        },
    },
}, {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            ret.driverId = ret.driverId.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            ret.driverId = ret.driverId.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
// Compound index to optimize passenger search queries (anchored matching by city + time + seats)
RideSchema.index({ "origin.city": 1, "destination.city": 1, departureTime: 1, availableSeats: 1 });
exports.Ride = (0, mongoose_1.model)("Ride", RideSchema);
