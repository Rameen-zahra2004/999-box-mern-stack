import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api"; // baseURL already includes /api; routes below hit /orders/admin/*

// ---------- THUNKS ----------

export const fetchAllOrdersAdmin = createAsyncThunk(
  "adminOrders/fetchAllOrdersAdmin",
  async ({ page = 1, limit = 20, status } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders/admin", {
        params: { page, limit, status },
      });
      return data.data; // { orders, total, page, totalPages }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchSingleOrderAdmin = createAsyncThunk(
  "adminOrders/fetchSingleOrderAdmin",
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/admin/${orderId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const updateOrderStatusAdmin = createAsyncThunk(
  "adminOrders/updateOrderStatusAdmin",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/orders/admin/${orderId}/status`, {
        status,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

// ---------- INITIAL STATE ----------

const initialState = {
  orders: [],
  pagination: { page: 1, totalPages: 1, total: 0 },
  selectedOrder: null,
  loading: false,
  updating: false,
  error: null,
};

// ---------- SLICE ----------

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState,
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    resetAdminOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrdersAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrdersAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
      })
      .addCase(fetchAllOrdersAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchSingleOrderAdmin.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
      })

      .addCase(updateOrderStatusAdmin.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateOrderStatusAdmin.fulfilled, (state, action) => {
        state.updating = false;
        const updated = action.payload;
        const index = state.orders.findIndex((o) => o._id === updated._id);
        if (index !== -1) state.orders[index] = updated;
        if (state.selectedOrder?._id === updated._id) {
          state.selectedOrder = updated;
        }
      })
      .addCase(updateOrderStatusAdmin.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedOrder, resetAdminOrderError } =
  adminOrderSlice.actions;

export const selectAdminOrders = (state) => state.adminOrders.orders;
export const selectAdminOrdersPagination = (state) =>
  state.adminOrders.pagination;
export const selectAdminOrdersLoading = (state) => state.adminOrders.loading;
export const selectAdminOrdersError = (state) => state.adminOrders.error;

export default adminOrderSlice.reducer;
