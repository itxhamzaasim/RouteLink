import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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
    const { firstName, lastName, email, phone, password, role } = await req.json();

    // Validate request body
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { code: "INVALID_CREDENTIALS", message: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { code: "EMAIL_EXISTS", message: "Email is already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      role: role || "passenger",
      isVerified: true, // Defaulting verified for FYP prototype ease
    });

    await user.save();

    // Generate session token
    const accessToken = generateToken(user._id.toString(), user.role);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const response = NextResponse.json({
      user,
      accessToken,
      expiresAt,
    }, { status: 201 });

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
    console.error("Registration error:", error);
    return NextResponse.json(
      { code: "UNKNOWN", message: error.message || "Server error during registration" },
      { status: 500 }
    );
  }
}
