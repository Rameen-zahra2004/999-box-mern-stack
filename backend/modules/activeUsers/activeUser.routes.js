import express from "express";

import { protectAdmin } from "../admin/admin.middleware.js";
import authorizeRoles from "../roles/role.middleware.js";

import {
  createActiveUserController,
  getActiveUsersController,
} from "./activeUser.controller.js";

const router = express.Router();

// FIX: previously had NO auth middleware at all on either route — anyone,
// logged in or not, could view or create active-user entries directly via
// the API. Both routes are admin-only per your confirmation, so both are
// now gated with protectAdmin + authorizeRoles.

router.get(
  "/",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getActiveUsersController,
);

router.post(
  "/",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  createActiveUserController,
);

export default router;
