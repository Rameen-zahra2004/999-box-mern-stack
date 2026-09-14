import mongoose from "mongoose";
import Order from "./order.model.js";
import Cart from "../cart/Cart.model.js";
import Product from "../product/product.model.js";
import { ORDER_MESSAGES } from "./order.constants.js";
import { ORDER_STATUS } from "./order.status.js";
import { calculateOrderTotals } from "../shared/orderCalculations.utils.js";
import { calculateCartTotals } from "../cart/cart.utils.js";
import { createOrderDetailService } from "../orderDetail/orderDetail.service.js";

const httpError = (message, statusCode = 500, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
};

export const createOrderService = async (
  userId,
  paymentMethod,
  shippingAddress,
) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    throw httpError(ORDER_MESSAGES.CART_EMPTY, 400);
  }

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    const insufficientStock = !product || product.stock < item.quantity;
    if (insufficientStock) {
      throw httpError(ORDER_MESSAGES.OUT_OF_STOCK, 400);
    }
  }

  const session = await mongoose.startSession();

  try {
    let order;

    await session.withTransaction(async () => {
      for (const item of cart.items) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.product._id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session, new: true },
        );
        if (!updatedProduct) {
          throw httpError(ORDER_MESSAGES.OUT_OF_STOCK, 400);
        }
      }

      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      }));

      const subtotal = cart.items.reduce((acc, item) => acc + item.subtotal, 0);

      const { tax, shippingFee, discount, totalAmount } = calculateOrderTotals({
        subtotal,
        discount: cart.discount,
      });

      const createdOrders = await Order.create(
        [
          {
            user: userId,
            items: orderItems,
            subtotal,
            tax,
            shippingFee,
            discount,
            totalAmount,
            paymentMethod,
            shippingAddress,
          },
        ],
        { session },
      );

      order = createdOrders[0];

      await createOrderDetailService(order._id, userId, orderItems, session);

      // Clear the cart AND recompute its totals — items alone isn't enough,
      // otherwise totalItems/subtotal/totalAmount stay stale after checkout.
      cart.items = [];
      calculateCartTotals(cart);
      await cart.save({ session });
    });

    return order;
  } finally {
    await session.endSession();
  }
};

export const getOrdersService = async (userId) => {
  return await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
};

export const getSingleOrderService = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId }).populate(
    "items.product",
  );
  if (!order) {
    throw httpError(ORDER_MESSAGES.NOT_FOUND, 404);
  }
  return order;
};

export const getSingleOrderAdminService = async (orderId) => {
  const order = await Order.findById(orderId).populate("items.product");
  if (!order) {
    throw httpError(ORDER_MESSAGES.NOT_FOUND, 404);
  }
  return order;
};

export const cancelOrderService = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw httpError(ORDER_MESSAGES.NOT_FOUND, 404);
  }
  if (order.user.toString() !== userId.toString()) {
    throw httpError("Unauthorized", 403);
  }
  if (order.status !== ORDER_STATUS.PENDING) {
    throw httpError("Order cannot be cancelled", 400);
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session },
        );
      }
      order.status = ORDER_STATUS.CANCELLED;
      await order.save({ session });
    });
    return order;
  } finally {
    await session.endSession();
  }
};

// ---------- ADMIN ----------

export const getAllOrdersAdminService = async ({
  page = 1,
  limit = 20,
  status,
} = {}) => {
  const skip = (page - 1) * limit;
  const filter = status ? { status } : {};

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "firstName lastName username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const updateOrderStatusAdminService = async (orderId, status) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw httpError(ORDER_MESSAGES.NOT_FOUND, 404);
  }

  order.status = status;

  if (status === ORDER_STATUS.DELIVERED) {
    order.deliveredAt = new Date();
  }

  if (status === ORDER_STATUS.PAID) {
    order.isPaid = true;
    order.paidAt = new Date();
  }

  await order.save();

  return order;
};
