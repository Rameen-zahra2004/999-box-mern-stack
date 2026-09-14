import Cart from "./Cart.model.js";
import Product from "../product/product.model.js";
import { CART_MESSAGES } from "./cart.constants.js";
import { calculateCartTotals } from "./cart.utils.js";

const httpError = (message, statusCode = 500, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
};

export const getCartService = async (userId) => {
  let cart = await Cart.findOne({ user: userId })
    .populate("items.product")
    .lean();

  if (!cart) {
    cart = await Cart.create({ user: userId });
    cart = await Cart.findById(cart._id).lean();
  }

  return cart;
};

export const addToCartService = async (userId, productId, quantity) => {
  if (quantity <= 0) {
    throw httpError(CART_MESSAGES.INVALID_QUANTITY, 400);
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw httpError(CART_MESSAGES.PRODUCT_NOT_FOUND, 404);
  }

  if (product.stock < quantity) {
    throw httpError(CART_MESSAGES.OUT_OF_STOCK, 400);
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId,
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.subtotal = existingItem.quantity * existingItem.price;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      price: product.price,
      subtotal: product.price * quantity,
    });
  }

  calculateCartTotals(cart);

  await cart.save();

  return await Cart.findById(cart._id).populate("items.product");
};

export const updateCartItemService = async (userId, productId, quantity) => {
  if (quantity <= 0) {
    throw httpError(CART_MESSAGES.INVALID_QUANTITY, 400);
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw httpError(CART_MESSAGES.CART_NOT_FOUND, 404);
  }

  const item = cart.items.find((item) => item.product.toString() === productId);

  if (!item) {
    throw httpError(CART_MESSAGES.PRODUCT_NOT_FOUND, 404);
  }

  item.quantity = quantity;
  item.subtotal = item.price * quantity;

  calculateCartTotals(cart);

  await cart.save();

  return await Cart.findById(cart._id).populate("items.product");
};

export const removeCartItemService = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw httpError(CART_MESSAGES.CART_NOT_FOUND, 404);
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
  );

  calculateCartTotals(cart);

  await cart.save();

  return await Cart.findById(cart._id).populate("items.product");
};

export const clearCartService = async (userId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw httpError(CART_MESSAGES.CART_NOT_FOUND, 404);
  }

  cart.items = [];

  calculateCartTotals(cart);

  await cart.save();

  return await Cart.findById(cart._id).populate("items.product");
};

export const getAllCartsService = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [carts, total] = await Promise.all([
    Cart.find({})
      .populate("user", "firstName lastName email")
      .populate("items.product", "name price stock")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Cart.countDocuments({}),
  ]);

  return {
    carts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
