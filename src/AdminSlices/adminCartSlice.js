import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminCartApi from "../api/adminCartApi";
// baseURL already includes /api/admin/carts — all calls below are relative to that

// ---------- THUNKS ----------
// FIX: every thunk previously used `err.message` for rejectWithValue, which
// on an Axios error is a generic string like "Request failed with status
// code 404" — it never surfaces your backend's actual error message. Now
// matches the pattern used in adminOrderSlice.js / cartSlice.js / orderSlice.js.

export const fetchAllCarts = createAsyncThunk(
  "adminCarts/fetchAllCarts",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await adminCartApi.get("/", { params: { page, limit } });
      return data.data; // { carts, total, page, totalPages }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchCartByUserId = createAsyncThunk(
  "adminCarts/fetchCartByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await adminCartApi.get(`/${userId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const adminAddToCart = createAsyncThunk(
  "adminCarts/adminAddToCart",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await adminCartApi.post(`/${userId}`, {
        productId,
        quantity,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const adminUpdateCartItem = createAsyncThunk(
  "adminCarts/adminUpdateCartItem",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await adminCartApi.put(`/${userId}/${productId}`, {
        quantity,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const adminRemoveCartItem = createAsyncThunk(
  "adminCarts/adminRemoveCartItem",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const { data } = await adminCartApi.delete(`/${userId}/${productId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const adminClearCart = createAsyncThunk(
  "adminCarts/adminClearCart",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await adminCartApi.delete(`/${userId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

// ---------- INITIAL STATE ----------

const initialState = {
  carts: [],
  pagination: { page: 1, totalPages: 1, total: 0 },
  selectedCart: null,
  loading: {
    list: false,
    single: false,
    add: false,
    update: false,
    removeItem: false,
    clear: false,
  },
  error: {
    list: null,
    single: null,
    add: null,
    update: null,
    removeItem: null,
    clear: null,
  },
};

// ---------- SLICE ----------

const adminCartSlice = createSlice({
  name: "adminCarts",
  initialState,
  reducers: {
    clearSelectedCart: (state) => {
      state.selectedCart = null;
      state.error.single = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LIST
      .addCase(fetchAllCarts.pending, (state) => {
        state.loading.list = true;
        state.error.list = null;
      })
      .addCase(fetchAllCarts.fulfilled, (state, action) => {
        state.loading.list = false;
        state.carts = action.payload.carts;
        state.pagination = {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
      })
      .addCase(fetchAllCarts.rejected, (state, action) => {
        state.loading.list = false;
        state.error.list = action.payload;
      })

      // SINGLE
      .addCase(fetchCartByUserId.pending, (state) => {
        state.loading.single = true;
        state.error.single = null;
      })
      .addCase(fetchCartByUserId.fulfilled, (state, action) => {
        state.loading.single = false;
        state.selectedCart = action.payload;
      })
      .addCase(fetchCartByUserId.rejected, (state, action) => {
        state.loading.single = false;
        state.error.single = action.payload;
      })

      // ADD
      .addCase(adminAddToCart.pending, (state) => {
        state.loading.add = true;
        state.error.add = null;
      })
      .addCase(adminAddToCart.fulfilled, (state, action) => {
        state.loading.add = false;
        state.selectedCart = action.payload;
      })
      .addCase(adminAddToCart.rejected, (state, action) => {
        state.loading.add = false;
        state.error.add = action.payload;
      })

      // UPDATE
      .addCase(adminUpdateCartItem.pending, (state) => {
        state.loading.update = true;
        state.error.update = null;
      })
      .addCase(adminUpdateCartItem.fulfilled, (state, action) => {
        state.loading.update = false;
        state.selectedCart = action.payload;
      })
      .addCase(adminUpdateCartItem.rejected, (state, action) => {
        state.loading.update = false;
        state.error.update = action.payload;
      })

      // REMOVE ITEM
      .addCase(adminRemoveCartItem.pending, (state) => {
        state.loading.removeItem = true;
        state.error.removeItem = null;
      })
      .addCase(adminRemoveCartItem.fulfilled, (state, action) => {
        state.loading.removeItem = false;
        state.selectedCart = action.payload;
      })
      .addCase(adminRemoveCartItem.rejected, (state, action) => {
        state.loading.removeItem = false;
        state.error.removeItem = action.payload;
      })

      // CLEAR
      .addCase(adminClearCart.pending, (state) => {
        state.loading.clear = true;
        state.error.clear = null;
      })
      .addCase(adminClearCart.fulfilled, (state, action) => {
        state.loading.clear = false;
        state.selectedCart = action.payload;
      })
      .addCase(adminClearCart.rejected, (state, action) => {
        state.loading.clear = false;
        state.error.clear = action.payload;
      });
  },
});

export const { clearSelectedCart } = adminCartSlice.actions;

// ---------- SELECTORS ----------

export const selectAdminCarts = (state) => state.adminCarts.carts;
export const selectAdminCartsPagination = (state) =>
  state.adminCarts.pagination;
export const selectSelectedCart = (state) => state.adminCarts.selectedCart;
export const selectAdminCartsLoading = (state) => state.adminCarts.loading;
export const selectAdminCartsError = (state) => state.adminCarts.error;

export default adminCartSlice.reducer;
