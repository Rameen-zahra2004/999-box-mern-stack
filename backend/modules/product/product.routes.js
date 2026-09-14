import express from "express";

import { protectAdmin } from "../admin/admin.middleware.js";
import authorizeRoles from "../roles/role.middleware.js";
import upload, { uploadErrorHandler } from "../../middleware/upload.js"; // adjust path if needed

import {
  createProductController,
  deleteProductController,
  getProductController,
  getProductsController,
  updateProductController,
} from "./product.controller.js";

import {
  uploadProductImagesController,
  deleteProductImageController,
  reorderProductImagesController,
} from "./product.image.controller.js";

const router = express.Router();

// Public — browsing products requires no auth, correctly left as-is.
router.get("/", getProductsController);
router.get("/:id", getProductController);

// FIX: every write route below previously used `protect` alone with NO role
// check at all — any logged-in customer account could create, edit, or
// delete products, or manage product images, directly via the API. Swapped
// to protectAdmin (protect never recognizes Admin sessions anyway) and
// added authorizeRoles to actually gate these by role.

router.post(
  "/",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  createProductController,
);

router.put(
  "/:id",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  updateProductController,
);

router.delete(
  "/:id",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  deleteProductController,
);

// Helper to wrap multer so its errors are catchable
const runMulter = (req, res, next) => {
  upload.array("images", 10)(req, res, (err) => {
    if (err) return uploadErrorHandler(err, req, res, next);
    next();
  });
};

router.post(
  "/:id/images",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  runMulter,
  uploadProductImagesController,
);

router.delete(
  "/:id/images/:imageId",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  deleteProductImageController,
);

router.patch(
  "/:id/images/reorder",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  reorderProductImagesController,
);

export default router;
