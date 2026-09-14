import Joi from "joi";
import { ORDER_STATUS } from "./order.status.js";

export const createOrderValidation = Joi.object({
  paymentMethod: Joi.string()
    .valid("COD", "CARD", "STRIPE", "PAYPAL", "JAZZCASH")
    .required(),

  shippingAddress: Joi.object().required(),
});

export const updateOrderStatusValidation = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ORDER_STATUS))
    .required(),
});
