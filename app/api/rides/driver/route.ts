import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { Ride } from "@/lib/models/Ride";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req, ["driver", "admin"]);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();

    const rides = await Ride.find({ driverId: user._id }).sort({ departureTime: 1 });
    return NextResponse.json(rides, { status: 200 });
  } catch (error: any) {
    console.error("Get driver rides error:", error);
    return NextResponse.json(
      { message: "Failed to fetch driver rides." },
      { status: 500 }
    );
  }
}
