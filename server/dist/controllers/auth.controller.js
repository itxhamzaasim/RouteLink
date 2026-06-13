"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getCurrentUser = getCurrentUser;
exports.logout = logout;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_js_1 = require("../models/User.js");
// Helper to generate JWT token
function generateToken(userId, role) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is missing on the server.");
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    return jsonwebtoken_1.default.sign({ userId, role }, secret, { expiresIn: expiresIn });
}
async function register(req, res) {
    try {
        const { firstName, lastName, email, phone, password, role } = req.body;
        // Validate request body
        if (!firstName || !lastName || !email || !password) {
            res.status(400).json({ code: "INVALID_CREDENTIALS", message: "Required fields are missing" });
            return;
        }
        // Check if user already exists
        const existingUser = await User_js_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ code: "EMAIL_EXISTS", message: "Email is already registered" });
            return;
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        // Create user
        const user = new User_js_1.User({
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
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ code: "UNKNOWN", message: error.message || "Server error during registration" });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ code: "INVALID_CREDENTIALS", message: "Email and password are required" });
            return;
        }
        // Find user
        const user = await User_js_1.User.findOne({ email });
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
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ code: "UNKNOWN", message: error.message || "Server error during login" });
    }
}
async function getCurrentUser(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ code: "SESSION_EXPIRED", message: "User session not found" });
            return;
        }
        res.status(200).json(req.user);
    }
    catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({ code: "UNKNOWN", message: "Server error retrieving user" });
    }
}
async function logout(req, res) {
    try {
        // Stateless JWT logout (client discards token; optionally token could be blacklisted)
        res.status(204).end();
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ code: "UNKNOWN", message: "Server error during logout" });
    }
}
