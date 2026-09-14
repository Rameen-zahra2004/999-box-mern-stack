// import express from "express";

// console.log("USER ROUTES: importing auth.middleware");
// const { protect } = await import("../auth/auth.middleware.js");
// console.log("USER ROUTES: auth.middleware OK");

// console.log("USER ROUTES: importing role.middleware");
// const authorizeRoles = (await import("../roles/role.middleware.js")).default;
// console.log("USER ROUTES: role.middleware OK");

// console.log("USER ROUTES: importing user.controller");
// const {
//   createUserController,
//   deleteUserController,
//   getUserController,
//   getUsersController,
//   updateUserController,
// } = await import("./user.controller.js");
// console.log("USER ROUTES: user.controller OK");

// const router = express.Router();

// router.get(
//   "/",
//   protect,
//   authorizeRoles("ADMIN", "SUPER_ADMIN"),
//   getUsersController,
// );
// router.get("/:id", protect, getUserController);
// router.post("/", createUserController);
// router.put("/:id", protect, updateUserController);
// router.delete(
//   "/:id",
//   protect,
//   authorizeRoles("SUPER_ADMIN"),
//   deleteUserController,
// );

// export default router;
import express from "express";

console.log("USER ROUTES: importing auth.middleware");
const { protect } = await import("../auth/auth.middleware.js");
const { protectAdmin } = await import("../admin/admin.middleware.js");
console.log("USER ROUTES: auth.middleware OK");

console.log("USER ROUTES: importing role.middleware");
const authorizeRoles = (await import("../roles/role.middleware.js")).default;
console.log("USER ROUTES: role.middleware OK");

console.log("USER ROUTES: importing user.controller");
const {
  createUserController,
  deleteUserController,
  getUserController,
  getUsersController,
  updateUserController,
} = await import("./user.controller.js");
console.log("USER ROUTES: user.controller OK");

const router = express.Router();

// Blocks a self-service route from being used to read/edit a DIFFERENT
// user's account. Without this, any logged-in user could pass someone
// else's id into GET/PUT /:id and view or modify their data — an IDOR
// vulnerability. Admin routes (below) bypass this via protectAdmin instead.
const requireSelf = (req, res, next) => {
  if (req.user._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: "You can only access your own account.",
    });
  }
  next();
};

// ---------- ADMIN ----------
// FIX: previously used `protect`, which only ever recognizes User-collection
// sessions (the accessToken cookie) — never Admin sessions. Same root cause
// as the original order.routes.js bug: any real admin session would 401
// here regardless of what authorizeRoles says. Swapped to protectAdmin so
// req.user is populated from the Admin collection, matching what
// authorizeRoles expects to check against.
router.get(
  "/",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getUsersController,
);

// New: explicit admin-scoped single-user view/edit, reusing the same
// controllers as the self-service routes below. This is the "admin manages
// any user" half of what you described — kept separate from the self-service
// routes rather than trying to make one route serve both cases, mirroring
// the same split we used for cart.admin.routes.js.
router.get(
  "/admin/:id",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getUserController,
);
router.put(
  "/admin/:id",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  updateUserController,
);

router.delete(
  "/:id",
  protectAdmin,
  authorizeRoles("SUPER_ADMIN"),
  deleteUserController,
);

// ---------- SELF-SERVICE ----------
// requireSelf added: previously any logged-in user could view/edit ANY
// other user's account by id, not just their own.
router.get("/:id", protect, requireSelf, getUserController);
router.put("/:id", protect, requireSelf, updateUserController);

// ⚠️ UNCONFIRMED ASSUMPTION — please verify:
// This route had NO auth middleware at all — anyone, logged in or not,
// could call POST /users directly. You already have public registration
// at /auth/register (used by signinSlice.js), so a second, unauthenticated
// user-creation endpoint here is either:
//   (a) dead/duplicate code that should be deleted, or
//   (b) meant to be an admin-only "create a user account" action that's
//       just missing its auth middleware.
// I've defaulted to (b), the safer assumption, since leaving it fully open
// is a real vulnerability either way. If it's actually meant to be public,
// tell me and I'll revert this line — but it should almost certainly not
// stay unauthenticated.
router.post(
  "/",
  protectAdmin,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  createUserController,
);

export default router;
