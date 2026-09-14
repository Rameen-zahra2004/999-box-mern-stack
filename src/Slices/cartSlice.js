import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api"; // shared axios instance, baseURL already includes /api

// ---------- THUNKS ----------
// NOTE: this hits the USER cart routes (e.g. backend router mounted at /api/cart),
// not /api/admin/carts — do not swap this for adminCartApi.

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/cart");
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const addCartItem = createAsyncThunk(
  "cart/addCartItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/cart", { productId, quantity });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.delete("/cart");
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

// ---------- SLICE ----------

const initialState = {
  cart: null,
  items: [],
  loading: false,
  mutating: false,
  error: null,
};

const applyCartPayload = (state, payload) => {
  state.cart = payload;
  state.items = payload?.items ?? [];
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        applyCartPayload(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addCartItem.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.mutating = false;
        applyCartPayload(state, action.payload);
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      })

      .addCase(updateCartItem.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.mutating = false;
        applyCartPayload(state, action.payload);
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      })

      .addCase(removeCartItem.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.mutating = false;
        applyCartPayload(state, action.payload);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      })

      .addCase(clearCart.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.mutating = false;
        applyCartPayload(state, action.payload);
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      });
  },
});

export const { resetCartError } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartDoc = (state) => state.cart.cart;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartMutating = (state) => state.cart.mutating;
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;
