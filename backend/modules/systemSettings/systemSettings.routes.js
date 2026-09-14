import express from "express";

import { protectAdmin } from "../admin/admin.middleware.js";
import authorizeRoles from "../roles/role.middleware.js";

import {
  getSystemSettingController,
  updateSystemSettingController,
} from "./systemSettings.controller.js";

const router = express.Router();

// ⚠️ UNCONFIRMED ASSUMPTION — please verify:
// GET "/" previously had NO auth middleware at all — not even `protect`.
// Anyone, logged in or not, could read your system settings directly.
// I've defaulted to admin-only here since this module is only surfaced via
// your Admin Settings panel (SystemSettingPanel.jsx) in your file inventory,
// with no public/storefront consumer we've seen. If some subset of these
// settings genuinely needs to be public (e.g., a maintenance-mode flag the
// frontend checks before login), that should be split into its own public
// endpoint returning only that field — not the whole settings document.

router.get(
  "/",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getSystemSettingController,
);

// FIX: previously used `protect`, which never recognizes Admin sessions.
// The authorizeRoles check here was already correct — it just could never
// be reached by a real admin. Swapped to protectAdmin.
router.put(
  "/",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  updateSystemSettingController,
);

export default router;
