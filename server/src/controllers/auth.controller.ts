import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { AuthRequest } from "../middleware/auth.js";

// Helper to generate JWT token
function generateToken(userId: string, role: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is missing on the server.");
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ userId, role }, secret, { expiresIn: expiresIn as any });
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    // Validate request body
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ code: "INVALID_CREDENTIALS", message: "Required fields are missing" });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ code: "EMAIL_EXISTS", message: "Email is already registered" });
      return;
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

    res.status(201).json({
      user,
      accessToken,
      expiresAt,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ code: "UNKNOWN", message: error.message || "Server error during registration" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ code: "INVALID_CREDENTIALS", message: "Email and password are required" });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ code: "INVALID_CREDENTIALS", message: "Invalid email or password" });
      return;
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ code: "INVALID_CREDENTIALS", message: "Invalid email or password" });
      return;
    }

    // Generate token
    const accessToken = generateToken(user._id.toString(), user.role);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    res.status(200).json({
      user,
      accessToken,
      expiresAt,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ code: "UNKNOWN", message: error.message || "Server error during login" });
  }
}

export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ code: "SESSION_EXPIRED", message: "User session not found" });
      return;
    }
    res.status(200).json(req.user);
  } catch (error: any) {
    console.error("Get current user error:", error);
    res.status(500).json({ code: "UNKNOWN", message: "Server error retrieving user" });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    // Stateless JWT logout (client discards token; optionally token could be blacklisted)
    res.status(204).end();
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({ code: "UNKNOWN", message: "Server error during logout" });
  }
}
