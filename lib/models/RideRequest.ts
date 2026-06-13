import { Schema, model, models, Document, Types } from "mongoose";

export interface IRideRequest extends Document {
  passengerId: Types.ObjectId;
  passengerName: string;
  passengerRating: number;
  origin: {
    address: string;
    city: string;
  };
  destination: {
    address: string;
    city: string;
  };
  departureTime: Date;
  seatsNeeded: number;
  proposedPrice: number;
  status: "pending" | "accepted" | "cancelled";
  driverId?: Types.ObjectId;
  createdAt: Date;
}

const RideRequestSchema = new Schema<IRideRequest>(
  {
    passengerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Passenger ID is required"],
      index: true,
    },
    passengerName: {
      type: String,
      required: [true, "Passenger name is required"],
      trim: true,
    },
    passengerRating: {
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
    seatsNeeded: {
      type: Number,
      required: [true, "Seats count is required"],
      min: [1, "Seats count must be at least 1"],
    },
    proposedPrice: {
      type: Number,
      required: [true, "Proposed price is required"],
      min: [0, "Proposed price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "cancelled"],
      default: "pending",
      index: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.passengerId = ret.passengerId.toString();
        if (ret.driverId) ret.driverId = ret.driverId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.passengerId = ret.passengerId.toString();
        if (ret.driverId) ret.driverId = ret.driverId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const RideRequest = models.RideRequest || model<IRideRequest>("RideRequest", RideRequestSchema);
