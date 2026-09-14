import express from "express";
import { restrictTo } from "../auth/auth.middleware.js";
import { protectAdmin } from "../admin/admin.middleware.js";

import { getActivityLogsController } from "./activityLog.controller.js";

const router = express.Router();

// FIX: previous attempt (C6) used `protect` + restrictTo("admin") lowercase —
// same two bugs as the original order.routes.js: `protect` never recognizes
// Admin sessions, and "admin" lowercase never matches your real role value
// ("SUPER_ADMIN"). Swapped to protectAdmin + correctly-cased role strings.
router.use(protectAdmin, restrictTo("ADMIN", "SUPER_ADMIN"));

// (C7) kept as-is — good call: POST/DELETE intentionally not exposed here.
// Logs should only ever be written internally by the activityLogger
// middleware, and audit logs should be immutable. If retention cleanup is
// ever needed, do it via a scheduled job, not a public route.

router.get("/", getActivityLogsController);

export default router;
