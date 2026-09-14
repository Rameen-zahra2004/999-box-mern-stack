// import express from "express";

// import { protect, restrictTo } from "../auth/auth.middleware.js";
// import {
//   cancelOrderController,
//   createOrderController,
//   getOrdersController,
//   getSingleOrderController,
//   getSingleOrderAdminController,
//   getAllOrdersAdminController,
//   updateOrderStatusAdminController,
// } from "./order.controller.js";

// const router = express.Router();

// router.use(protect);

// // ---------- ADMIN (must come before "/:id" routes below) ----------
// router.get("/admin", restrictTo("admin"), getAllOrdersAdminController);
// router.get("/admin/:id", restrictTo("admin"), getSingleOrderAdminController);
// router.patch(
//   "/admin/:id/status",
//   restrictTo("admin"),
//   updateOrderStatusAdminController,
// );

// // ---------- USER ----------
// router.post("/", createOrderController);
// router.get("/", getOrdersController);
// router.get("/:id", getSingleOrderController);
// router.patch("/:id/cancel", cancelOrderController);

// export default router;
import express from "express";

import { protect, restrictTo } from "../auth/auth.middleware.js";
import { protectAdmin } from "../admin/admin.middleware.js";
import {
  cancelOrderController,
  createOrderController,
  getOrdersController,
  getSingleOrderController,
  getSingleOrderAdminController,
  getAllOrdersAdminController,
  updateOrderStatusAdminController,
} from "./order.controller.js";

const router = express.Router();

// ---------- ADMIN (must come before "/:id" user routes below) ----------
// NOTE: confirm your Admin.model.js role enum values and pass the exact
// strings here — e.g. restrictTo("ADMIN", "SUPER_ADMIN") if that's what
// seedFirstSuperAdmin / your schema actually use.
router.get(
  "/admin",
  protectAdmin,
  restrictTo("ADMIN", "SUPER_ADMIN"),
  getAllOrdersAdminController,
);
router.get(
  "/admin/:id",
  protectAdmin,
  restrictTo("ADMIN", "SUPER_ADMIN"),
  getSingleOrderAdminController,
);
router.patch(
  "/admin/:id/status",
  protectAdmin,
  restrictTo("ADMIN", "SUPER_ADMIN"),
  updateOrderStatusAdminController,
);

// ---------- USER ----------
router.use(protect);

router.post("/", createOrderController);
router.get("/", getOrdersController);
router.get("/:id", getSingleOrderController);
router.patch("/:id/cancel", cancelOrderController);

export default router;
