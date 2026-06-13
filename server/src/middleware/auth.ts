import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: IUser;
}

interface DecodedToken {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided, authorization denied." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: "JWT configuration is missing on the server." });
      return;
    }

    const decoded = jwt.verify(token, secret) as DecodedToken;

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "User no longer exists." });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid." });
  }
}

export function requireRole(allowedRoles: Array<"passenger" | "driver" | "admin">) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden: You do not have permission." });
      return;
    }

    next();
  };
}
