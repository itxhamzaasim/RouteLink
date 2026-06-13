import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { Ride } from "@/lib/models/Ride";
import { requireAuth, isNextResponse } from "@/lib/auth-api";

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/rides — search rides
export async function GET(req: Request) {
  try {
    const authResult = await requireAuth(req);
    if (isNextResponse(authResult)) {
      return authResult;
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const originCity = searchParams.get("originCity");
    const destinationCity = searchParams.get("destinationCity");
    const date = searchParams.get("date");
    const seats = searchParams.get("seats");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter query object
    const query: any = { status: "scheduled" };

    if (originCity && originCity.trim()) {
      const escaped = escapeRegExp(originCity.trim());
      query["origin.city"] = { $regex: new RegExp(escaped, "i") };
    }

    if (destinationCity && destinationCity.trim()) {
      const escaped = escapeRegExp(destinationCity.trim());
      query["destination.city"] = { $regex: new RegExp(escaped, "i") };
    }

    if (seats) {
      query.availableSeats = { $gte: Math.max(1, Number(seats)) };
    } else {
      query.availableSeats = { $gte: 1 };
    }

    // Departure time check
    if (date && date.trim()) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      query.departureTime = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // Future rides only if no date is specified
      query.departureTime = { $gte: new Date() };
    }

    // Sorting
    const sortField = sortBy === "price" ? "pricePerSeat" : "departureTime";
    const sortDir = sortOrder === "desc" ? -1 : 1;
    const sortOptions = { [sortField]: sortDir };

    // Execute queries in parallel
    const [total, results] = await Promise.all([
      Ride.countDocuments(query),
      Ride.find(query)
        .sort(sortOptions as any)
        .skip(skip)
        .limit(limitNumber),
    ]);

    return NextResponse.json({
      rides: results,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error("Search rides error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to query rides database." },
      { status: 500 }
    );
  }
}

// POST /api/rides — create ride
export async function POST(req: Request) {
  try {
    const authResult = await requireAuth(req, ["driver", "admin"]);
    if (isNextResponse(authResult)) {
      return authResult;
    }
    const { user } = authResult;

    await connectDB();
    const { origin, destination, departureTime, availableSeats, pricePerSeat, vehicleDetails } = await req.json();

    // Validation
    if (!origin?.address || !origin?.city || !destination?.address || !destination?.city || !departureTime || !availableSeats || pricePerSeat === undefined || !vehicleDetails?.make || !vehicleDetails?.model || !vehicleDetails?.licensePlate) {
      return NextResponse.json(
        { message: "Required ride management fields are missing or invalid." },
        { status: 400 }
      );
    }

    const driverName = `${user.firstName} ${user.lastName}`;

    const ride = new Ride({
      driverId: user._id,
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
    return NextResponse.json(ride, { status: 201 });
  } catch (error: any) {
    console.error("Create ride error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create ride." },
      { status: 500 }
    );
  }
}
