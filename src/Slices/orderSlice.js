import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

// -------------------- THUNKS --------------------

export const submitOrder = createAsyncThunk(
  "order/submitOrder",
  async ({ paymentMethod, shippingAddress }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/orders", {
        paymentMethod,
        shippingAddress,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchUserOrders = createAsyncThunk(
  "order/fetchUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/orders");
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchOrdersDetail = createAsyncThunk(
  "order/fetchOrdersDetail",
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/cancel`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

// NOTE: removed `updateOrderStatus` thunk that previously called
// `PUT /orders/${orderId}`. That route does not exist in order.routes.js —
// only `PATCH /orders/admin/:id/status` does, which belongs to
// adminOrderSlice.js and is already used correctly there. This thunk was
// dead code that would have 404'd if ever dispatched from the user-facing
// flow. If you ever need users to trigger a status change themselves
// (unlikely — that's an admin action), add a real backend route first,
// then a matching thunk here.

// -------------------- INITIAL STATE --------------------

const initialState = {
  orders: [],
  ordersDetail: null,
  loading: false,
  submitting: false,
  cancelling: false,
  error: null,
};

// -------------------- SLICE --------------------

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearOrdersDetail: (state) => {
      state.ordersDetail = null;
    },
    resetOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // SUBMIT
      .addCase(submitOrder.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.submitting = false;
        state.orders.unshift(action.payload);
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // FETCH ALL
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH SINGLE
      .addCase(fetchOrdersDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.ordersDetail = action.payload;
      })
      .addCase(fetchOrdersDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CANCEL
      .addCase(cancelOrder.pending, (state) => {
        state.cancelling = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.cancelling = false;
        const updatedOrder = action.payload;
        const index = state.orders.findIndex((o) => o._id === updatedOrder._id);
        if (index !== -1) state.orders[index] = updatedOrder;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.cancelling = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrdersDetail, resetOrderError } = orderSlice.actions;
export default orderSlice.reducer;
