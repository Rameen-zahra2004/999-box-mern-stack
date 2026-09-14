import express from "express";

import { protectAdmin } from "../admin/admin.middleware.js";
import authorizeRoles from "../roles/role.middleware.js";
import {
  getRevenueController,
  createRevenueSnapshotController,
} from "./revenue.controller.js";

const router = express.Router();

// FIX: previously used `protect` with no role check at all — any logged-in
// regular user could view revenue data or create snapshots. Revenue is
// sensitive business data and should be admin-only. Swapped to protectAdmin
// (protect never recognizes Admin sessions anyway) and added authorizeRoles
// to actually gate by role.

router.get(
  "/",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getRevenueController,
);

router.post(
  "/snapshot",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  createRevenueSnapshotController,
);

export default router;
