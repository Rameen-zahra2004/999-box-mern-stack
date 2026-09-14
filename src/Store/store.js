import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../Slices/productSlice";
import userReducer from "../AdminSlices/userSlice";
import formReducer from "../Slices/formSlice";
import signinReducer from "../Slices/signinSlice";
import cartReducer from "../Slices/cartSlice";
import searchReducer from "../Slices/searchSlice";
import userDashboardReducer from "../Slices/dashBoardSlice";
import revenueReducer from "../Slices/revenueSlice";
import activeUsersReducer from "../Slices/activeuserSlice";
import commentsReducer from "../Slices/commentSlice";
import adminProductReducer from "../AdminSlices/productmanagmentSlice";
import systemReducer from "../AdminSlices/systemSlice";
import exportReducer from "../AdminSlices/exportdeleteSlice";
import profileReducer from "../AdminSlices/profileSlice";
import rolesReducer from "../AdminSlices/rolesSlice";
import activityReducer from "../AdminSlices/activitySlice";
import securityReducer from "../AdminSlices/securitySlice";
import themeReducer from "../AdminSlices/themeSlice";
import adminLoginReducer from "../AdminSlices/adminLoginSlice";
import adminDashboardReducer from "../AdminSlices/dashboardSlice";
import adminCartsReducer from "../AdminSlices/adminCartSlice";
import orderReducer from "../Slices/orderSlice";
import userSettingsReducer from "../Slices/userSettingSlice";
import wishListReducer from "../Slices/wishListSlice";
import adminOrderReducer from "../AdminSlices/adminOrderSlice";

export const store = configureStore({
  reducer: {
    // ── User slices ──────────────────────────────────────
    products: productReducer,
    user: userReducer,
    form: formReducer,
    signinuser: signinReducer,
    cart: cartReducer,
    search: searchReducer,
    userDashboard: userDashboardReducer,
    revenue: revenueReducer,
    activeUsers: activeUsersReducer,
    comments: commentsReducer,
    order: orderReducer,
    userSettings: userSettingsReducer,
    wishlist: wishListReducer,

    // ── Admin slices ─────────────────────────────────────
    adminLogin: adminLoginReducer,
    adminDashboard: adminDashboardReducer,
    adminCarts: adminCartsReducer,
    adminProducts: adminProductReducer,
    system: systemReducer,
    export: exportReducer,
    profile: profileReducer,
    roles: rolesReducer,
    activity: activityReducer,
    security: securityReducer,
    adminOrders: adminOrderReducer,
    theme: themeReducer,
  },
});

export default store;
