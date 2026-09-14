import { verifyAccessToken } from "./authUtils.js";
import User from "../user/User.model.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required. Please log in." });
    }
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      const isExpired = err.name === "TokenExpiredError";
      return res.status(401).json({
        success: false,
        message: isExpired ? "Session expired. Please refresh your token." : "Invalid token. Please log in again.",
        code: isExpired ? "TOKEN_EXPIRED" : "TOKEN_INVALID",
      });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account suspended. Contact support.", code: "ACCOUNT_SUSPENDED" });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({ success: false, message: "Email not verified.", code: "EMAIL_NOT_VERIFIED" });
    }
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ success: false, message: "Password recently changed. Please log in again." });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Access denied. Required role: ${roles.join(" or ")}.` });
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return next();
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user?.isActive && user?.isEmailVerified && !user.changedPasswordAfter(decoded.iat)) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
};
