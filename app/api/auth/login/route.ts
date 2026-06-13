import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/database";
import { User } from "@/lib/models/User";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

function generateToken(userId: string, role: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is missing on the server.");
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ userId, role }, secret, { expiresIn: expiresIn as any });
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { code: "INVALID_CREDENTIALS", message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
        { status: 400 }
      );
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
        { status: 400 }
      );
    }

    // Generate token
    const accessToken = generateToken(user._id.toString(), user.role);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const response = NextResponse.json({
      user,
      accessToken,
      expiresAt,
    }, { status: 200 });

    // Set auth cookie
    response.cookies.set(AUTH_COOKIE_NAME, accessToken, {
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { code: "UNKNOWN", message: error.message || "Server error during login" },
      { status: 500 }
    );
  }
}
