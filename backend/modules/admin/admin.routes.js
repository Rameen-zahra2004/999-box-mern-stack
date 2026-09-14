import express from "express";
import { protectAdmin, restrictToSuperAdmin } from "./admin.middleware.js";
import { ROLES, ROLE_HIERARCHY } from "../roles/role.constants.js";

import {
  createAdminController,
  deleteAdminController,
  getAdminsController,
  getSingleAdminController,
  updateAdminController,
  loginAdminController,
  logoutAdminController,
  refreshAdminController,
  getMeController,
} from "./admin.controller.js";

const router = express.Router();

router.post("/login", loginAdminController);
router.post("/refresh", refreshAdminController);

router.use(protectAdmin);

router.post("/logout", logoutAdminController);
router.get("/me", getMeController);

// FIX: rolesSlice.js was calling GET /admins/roles, but no such route
// existed here — the request fell through to GET "/:id" below, which tried
// to cast the literal string "roles" as a MongoDB ObjectId and threw a
// CastError (400). Must be declared BEFORE "/:id" or it'll be shadowed
// again, same lesson as order.routes.js's original bug.
//
// This is a minimal, read-only stub: returns the static ROLES/ROLE_HIERARCHY
// constants you already have, wrapped in your standard { success, message,
// data } response shape. It unblocks the Settings page today. addRole and
// deleteRole in rolesSlice.js have no backend support yet — there's no Role
// model or persistence layer. Those will still fail if triggered; treat
// role creation/deletion as a future feature, not part of today's fix.
router.get("/roles", (req, res) => {
  const roles = Object.values(ROLES).map((name) => ({
    id: name,
    name,
    level: ROLE_HIERARCHY[name] ?? 0,
  }));

  return res.status(200).json({
    success: true,
    message: "Roles fetched successfully",
    data: roles,
  });
});

router.get("/", restrictToSuperAdmin, getAdminsController);
router.get("/:id", restrictToSuperAdmin, getSingleAdminController);
router.post("/", restrictToSuperAdmin, createAdminController);
router.put("/:id", restrictToSuperAdmin, updateAdminController);
router.delete("/:id", restrictToSuperAdmin, deleteAdminController);

export default router;
