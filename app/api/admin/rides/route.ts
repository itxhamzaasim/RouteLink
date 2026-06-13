import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { Ride } from "@/lib/models/Ride";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req, ["admin"]);
    if (isNextResponse(authResult)) {
      return authResult;
    }

    await connectDB();

    const rides = await Ride.find().sort({ createdAt: -1 });
    return NextResponse.json(rides, { status: 200 });
  } catch (error: any) {
    console.error("Get admin rides error:", error);
    return NextResponse.json(
      { message: "Failed to fetch rides listing." },
      { status: 500 }
    );
  }
}
