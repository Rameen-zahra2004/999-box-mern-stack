import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * authUtils.js
 * Token utilities for The 999 Boxs authentication system.
 * Shared by both User auth (auth.service.js) and Admin auth (admin.service.js).
 *
 * TOKEN STRATEGY
 * ─────────────
 * Access Token  → short-lived (15 min), stored in HTTP-only cookie
 * Refresh Token → long-lived (7 days), stored in HTTP-only cookie + hashed in DB
 * Email/Reset   → crypto random hex token, hashed before DB storage (never stored raw)
 *
 * COOKIE NAMING
 * ─────────────
 * User session   → "accessToken" / "refreshToken"     (path: /api/auth/refresh)
 * Admin session  → "adminAccessToken" / "adminRefreshToken" (path: /api/admins/refresh)
 * These never collide — both can be active in the same browser simultaneously.
 */

// ─── ACCESS TOKEN ─────────────────────────────────────────────────────────────

export const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    issuer: "the999boxs",
    audience: "the999boxs-client",
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
    issuer: "the999boxs",
    audience: "the999boxs-client",
  });

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    issuer: "the999boxs",
    audience: "the999boxs-client",
  });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    issuer: "the999boxs",
    audience: "the999boxs-client",
  });

// ─── CRYPTO TOKENS (email verification / password reset) ─────────────────────

export const generateCryptoToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  return { rawToken, hashedToken };
};

export const hashToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

// ─── COOKIE OPTIONS ───────────────────────────────────────────────────────────

const isProduction = process.env.NODE_ENV === "production";

// FIX: was `sameSite: isProduction ? "strict" : "lax"`. Frontend (Vercel) and
// backend (Render) will be on two completely different domains in production
// — "strict" blocks cookies from ever being sent cross-site at all, and
// "lax" only allows them on top-level navigations, not on the fetch/axios
// API calls this app actually makes. Either setting would make login appear
// to succeed but the cookie would never actually reach subsequent requests,
// so the user gets silently logged out immediately. "none" is required for
// cross-site cookies to work, and MUST be paired with secure: true (already
// the case here) — browsers reject sameSite: "none" cookies over plain HTTP.
const baseAccessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: "/",
};

// refresh-cookie path is determined per-caller (see attachAuthCookies below),
// since User and Admin refresh endpoints live at different routes
const baseRefreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Attach access + refresh tokens as HTTP-only cookies.
 * Pass accessCookieName/refreshCookieName to namespace Admin sessions
 * separately from User sessions — defaults to the User names.
 */
export const attachAuthCookies = (
  res,
  {
    accessToken,
    refreshToken,
    accessCookieName = "accessToken",
    refreshCookieName = "refreshToken",
  },
) => {
  res.cookie(accessCookieName, accessToken, baseAccessCookieOptions);

  const refreshPath =
    refreshCookieName === "adminRefreshToken"
      ? "/api/admins/refresh"
      : "/api/auth/refresh";

  res.cookie(refreshCookieName, refreshToken, {
    ...baseRefreshCookieOptions,
    path: refreshPath,
  });
};

/**
 * Clear access + refresh cookies. Must use the SAME names/paths they were
 * set with, or the browser will not remove them.
 */
export const clearAuthCookies = (
  res,
  { accessCookieName = "accessToken", refreshCookieName = "refreshToken" } = {},
) => {
  const refreshPath =
    refreshCookieName === "adminRefreshToken"
      ? "/api/admins/refresh"
      : "/api/auth/refresh";

  res.clearCookie(accessCookieName, { path: "/" });
  res.clearCookie(refreshCookieName, { path: refreshPath });
};
