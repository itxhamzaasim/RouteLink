import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "./database";
import { User, IUser } from "./models/User";
import { AUTH_COOKIE_NAME } from "./constants";

interface DecodedToken {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

export async function getUserFromRequest(req: Request): Promise<IUser | null> {
  try {
    await connectDB();

    // 1. Try to get token from Authorization header
    let token = "";
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Try to get token from cookies
    if (!token) {
      // Parse cookies from headers
      const cookieHeader = req.headers.get("cookie") || "";
      const cookies = Object.fromEntries(
        cookieHeader.split(";").map((c) => {
          const [key, ...v] = c.trim().split("=");
          return [key, v.join("=")];
        })
      );
      token = cookies[AUTH_COOKIE_NAME] || "";
    }

    if (!token) {
      return null;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET environment variable is missing on server.");
      return null;
    }

    const decoded = jwt.verify(token, secret) as DecodedToken;
    const user = await User.findById(decoded.userId);
    return user || null;
  } catch (error) {
    console.error("Error in getUserFromRequest:", error);
    return null;
  }
}

export async function requireAuth(
  req: Request,
  allowedRoles?: Array<"passenger" | "driver" | "admin">
): Promise<{ user: IUser } | NextResponse> {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Unauthorized: Invalid or missing token" },
      { status: 401 }
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "Forbidden: You do not have permission to access this resource" },
      { status: 403 }
    );
  }

  // If validation succeeded, return a plain object containing user
  return { user };
}

// Utility to helper check response pattern
export function isNextResponse(value: any): value is NextResponse {
  return value instanceof NextResponse;
}
