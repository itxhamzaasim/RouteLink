import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { RideRequest } from "@/lib/models/RideRequest";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

// PUT /api/rides/requests/[id]
// Allows drivers to accept a request, or passengers to update it
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;
    const { id } = await params;

    await connectDB();

    const request = await RideRequest.findById(id);
    if (!request) {
      return NextResponse.json(
        { message: "Ride request not found." },
        { status: 404 }
      );
    }

    const body = await req.json();

    if (user.role === "driver" || user.role === "admin") {
      // Driver is accepting the passenger's request
      if (body.status === "accepted") {
        request.status = "accepted";
        request.driverId = user._id;
        await request.save();
        return NextResponse.json(request, { status: 200 });
      }
    }

    // Passengers can modify/update their own pending request fields
    if (request.passengerId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: "Unauthorized: You do not own this ride request." },
        { status: 403 }
      );
    }

    if (body.origin) request.origin = body.origin;
    if (body.destination) request.destination = body.destination;
    if (body.departureTime) request.departureTime = new Date(body.departureTime);
    if (body.seatsNeeded) request.seatsNeeded = Number(body.seatsNeeded);
    if (body.proposedPrice) request.proposedPrice = Number(body.proposedPrice);
    if (body.status) request.status = body.status;

    await request.save();
    return NextResponse.json(request, { status: 200 });
  } catch (error: any) {
    console.error("Update ride request error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update ride request." },
      { status: 500 }
    );
  }
}

// DELETE /api/rides/requests/[id]
// Allows passengers to delete/cancel their request
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;
    const { id } = await params;

    await connectDB();

    const request = await RideRequest.findById(id);
    if (!request) {
      return NextResponse.json(
        { message: "Ride request not found." },
        { status: 404 }
      );
    }

    // Only owner (passenger) or admin can delete the request
    if (request.passengerId.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: You do not own this ride request." },
        { status: 403 }
      );
    }

    await RideRequest.findByIdAndDelete(id);
    return NextResponse.json({ message: "Ride request deleted successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Delete ride request error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete ride request." },
      { status: 500 }
    );
  }
}
