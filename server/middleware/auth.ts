import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth";

// Auth user interface
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  provider: string;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
    interface User extends AuthUser {}
  }
}

// Middleware to authenticate JWT token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const user = await AuthService.getUserFromToken(token);
    if (!user) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Optional authentication middleware (doesn't require login)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const user = await AuthService.getUserFromToken(token);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};