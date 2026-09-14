import express from "express";
import { restrictTo } from "../auth/auth.middleware.js";
import { protectAdmin } from "../admin/admin.middleware.js";

import {
  createApiKeyController,
  deleteApiKeyController,
  getApiKeysController,
  getSingleApiKeyController,
} from "./apiKey.controller.js";

const router = express.Router();

// FIX: previous attempt (C10/C11) used `protect` + restrictTo("admin")
// lowercase — same bugs as activityLog.routes.js and the original
// order.routes.js: `protect` never recognizes Admin sessions, and "admin"
// lowercase never matches your real role value ("SUPER_ADMIN"). Swapped to
// protectAdmin + correctly-cased role strings. This one's especially
// important to get right — API keys are credentials, so this route being
// unreachable by real admins (or worse, reachable by any authenticated
// user if the role check were ever silently dropped) is high-stakes.
router.use(protectAdmin, restrictTo("ADMIN", "SUPER_ADMIN"));

router.get("/", getApiKeysController);
router.get("/:id", getSingleApiKeyController);
router.post("/", createApiKeyController);
router.delete("/:id", deleteApiKeyController);

export default router;
