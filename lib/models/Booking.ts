import { Schema, model, models, Document, Types } from "mongoose";

export interface IBooking extends Document {
  rideId: Types.ObjectId;
  passengerId: Types.ObjectId;
  passengerName: string;
  seatsBooked: number;
  totalPrice: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  rideDetails: {
    origin: {
      address: string;
      city: string;
    };
    destination: {
      address: string;
      city: string;
    };
    departureTime: Date;
    driverName: string;
  };
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    rideId: {
      type: Schema.Types.ObjectId,
      ref: "Ride",
      required: [true, "Ride ID is required"],
      index: true,
    },
    passengerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Passenger ID is required"],
      index: true,
    },
    passengerName: {
      type: String,
      required: [true, "Passenger name is required"],
    },
    seatsBooked: {
      type: Number,
      required: [true, "Seats booked count is required"],
      min: [1, "Must book at least 1 seat"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    rideDetails: {
      origin: {
        address: { type: String, required: true },
        city: { type: String, required: true },
      },
      destination: {
        address: { type: String, required: true },
        city: { type: String, required: true },
      },
      departureTime: { type: Date, required: true },
      driverName: { type: String, required: true },
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.rideId = ret.rideId.toString();
        ret.passengerId = ret.passengerId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.rideId = ret.rideId.toString();
        ret.passengerId = ret.passengerId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index to speed up passenger list lookups
BookingSchema.index({ passengerId: 1, createdAt: -1 });

export const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);
