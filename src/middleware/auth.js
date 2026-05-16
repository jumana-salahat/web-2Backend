import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import { ApiError } from "./errorHandler.js";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Stop the server if JWT_SECRET is missing
 * because protected routes cannot work securely without it
 */
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env");
}

/**
 * Middleware to protect private routes
 * Validates JWT token before allowing access
 */
export const protect = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError("Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch {
    next(new ApiError("Invalid or expired token", 401));
  }
};

/**
 * Authorization middleware
 * Allows access only to admin users
 */
export const adminOnly = (req, _res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new ApiError("Access denied", 403));
  }
  next();
};