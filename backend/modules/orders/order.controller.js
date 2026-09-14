import {
  cancelOrderService,
  createOrderService,
  getOrdersService,
  getSingleOrderService,
  getSingleOrderAdminService,
  getAllOrdersAdminService,
  updateOrderStatusAdminService,
} from "./order.service.js";

import {
  createOrderValidation,
  updateOrderStatusValidation,
} from "./order.validation.js";

import { ORDER_MESSAGES } from "./order.constants.js";

export const createOrderController = async (req, res, next) => {
  try {
    const { error, value } = createOrderValidation.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((e) => e.message),
      });
    }

    const result = await createOrderService(
      req.user._id,
      value.paymentMethod,
      value.shippingAddress,
    );

    return res.status(201).json({
      success: true,
      message: ORDER_MESSAGES.CREATED_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrdersController = async (req, res, next) => {
  try {
    const result = await getOrdersService(req.user._id);
    return res.status(200).json({
      success: true,
      message: ORDER_MESSAGES.FETCH_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleOrderController = async (req, res, next) => {
  try {
    const result = await getSingleOrderService(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: ORDER_MESSAGES.FETCH_SINGLE_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleOrderAdminController = async (req, res, next) => {
  try {
    const result = await getSingleOrderAdminService(req.params.id);
    return res.status(200).json({
      success: true,
      message: ORDER_MESSAGES.FETCH_SINGLE_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrderController = async (req, res, next) => {
  try {
    const result = await cancelOrderService(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: ORDER_MESSAGES.CANCEL_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ---------- ADMIN ----------

export const getAllOrdersAdminController = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const status = req.query.status || undefined;

    const result = await getAllOrdersAdminService({ page, limit, status });

    return res.status(200).json({
      success: true,
      message: ORDER_MESSAGES.FETCH_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusAdminController = async (req, res, next) => {
  try {
    const { error, value } = updateOrderStatusValidation.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((e) => e.message),
      });
    }

    const result = await updateOrderStatusAdminService(
      req.params.id,
      value.status,
    );

    return res.status(200).json({
      success: true,
      message: ORDER_MESSAGES.STATUS_UPDATE_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
