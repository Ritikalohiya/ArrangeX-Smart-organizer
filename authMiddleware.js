
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    // 1. Read Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token required.",
      });
    }

    // 2. Extract token
    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is empty.",
      });
    }

    // 3. Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in backend .env");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error.",
      });
    }

    // 4. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    // 5. Find user
    const user = await User.findById(decoded.id).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found for this token.",
      });
    }

    // 6. Attach user to request
    req.user = user;

    next();
  } catch (error) {
    // Do not log or return the actual token
    console.error("Authentication error:", error.name);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication verification failed.",
    });
  }
};

export default protect;
