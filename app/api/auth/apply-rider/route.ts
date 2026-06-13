import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { User } from "@/lib/models/User";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();

    const { vehicleType, vehicleRegistration, vehiclePhotos, drivingLicense } = await req.json();

    if (!vehicleType || !vehicleRegistration) {
      return NextResponse.json(
        { message: "Vehicle type and registration plate are required." },
        { status: 400 }
      );
    }

    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    dbUser.vehicleType = vehicleType;
    dbUser.vehicleRegistration = vehicleRegistration;
    dbUser.vehiclePhotos = vehiclePhotos || [];
    dbUser.drivingLicense = drivingLicense || "";
    dbUser.driverApplicationStatus = "pending";

    await dbUser.save();

    return NextResponse.json(dbUser, { status: 200 });
  } catch (error: any) {
    console.error("Apply rider error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to submit rider application." },
      { status: 500 }
    );
  }
}
