import { NextResponse } from "next/server";
import { connectDB, healthCheck } from "@/lib/database";

export async function GET() {
  try {
    await connectDB();
    const dbHealth = await healthCheck();
    
    return NextResponse.json({
      status: dbHealth.status === "healthy" ? "OK" : "UNHEALTHY",
      service: "RouteLink Backend (Serverless)",
      database: dbHealth,
    }, { status: dbHealth.status === "healthy" ? 200 : 503 });
  } catch (error: any) {
    console.error("Health check error:", error);
    return NextResponse.json({
      status: "UNHEALTHY",
      service: "RouteLink Backend (Serverless)",
      error: error.message || "Failed to establish database link",
    }, { status: 503 });
  }
}
