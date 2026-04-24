import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({ message: "Missing bearer token" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      farmId: payload.farmId
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function authorizeRoles(...allowedRoles) {
  return function roleAuthorization(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: "Missing authenticated user" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Insufficient permissions for this action"
      });
    }

    return next();
  };
}
