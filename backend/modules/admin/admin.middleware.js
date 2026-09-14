import Admin from "./Admin.model.js";
import { verifyAccessToken } from "../auth/authUtils.js";

export const protectAdmin = async (req, res, next) => {
  try {
    let token = req.cookies?.adminAccessToken;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: "Admin authentication required." });
    }
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      const isExpired = err.name === "TokenExpiredError";
      return res.status(401).json({
        success: false,
        message: isExpired ? "Admin session expired. Please log in again." : "Invalid admin token.",
        code: isExpired ? "TOKEN_EXPIRED" : "TOKEN_INVALID",
      });
    }
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Admin no longer exists." });
    }
    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: "Admin account deactivated.", code: "ACCOUNT_SUSPENDED" });
    }
    req.admin = admin;
    req.user = admin;
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictToSuperAdmin = (req, res, next) => {
  if (req.admin?.role !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, message: "Only a super admin can manage admin accounts." });
  }
  next();
};

export const authorizePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Admin authentication required." });
    }
    const hasAll = requiredPermissions.every((perm) => req.admin.permissions?.includes(perm));
    if (!hasAll) {
      return res.status(403).json({ success: false, message: `Missing required permission(s): ${requiredPermissions.join(", ")}.` });
    }
    next();
  };
};
