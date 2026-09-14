import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { submitOrder } from "../Slices/orderSlice";
import { fetchCart } from "../Slices/cartSlice";
import StripePayment from "../Component/StripePayment";
import PaypalPayment from "../Component/PaypalPayment";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PAYMENT_METHODS = [
  {
    id: "stripe",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, Amex",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "Fast & secure checkout",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.217A.77.77 0 0 1 5.71 2.6h7.567c2.506 0 4.316.583 5.379 1.733.499.535.82 1.093.981 1.704.17.648.17 1.385-.002 2.249l-.007.042v.37l.217.124a3.62 3.62 0 0 1 1.04.902c.437.576.717 1.31.831 2.184.124.921.083 2.022-.123 3.27-.238 1.449-.623 2.71-1.145 3.748a6.618 6.618 0 0 1-1.826 2.275 7.316 7.316 0 0 1-2.563 1.32 11.478 11.478 0 0 1-3.235.42H11.41a.966.966 0 0 0-.954.814l-.075.42-.602 3.818-.027.148a.1.1 0 0 1-.099.085H7.076z" />
      </svg>
    ),
  },
];

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.signinuser || {});
  const { items: cart } = useSelector((state) => state.cart || { items: [] });

  const subtotal = useMemo(
    () => (cart || []).reduce((sum, item) => sum + item.subtotal, 0),
    [cart],
  );
  const shipping_fee = subtotal > 5000 ? 0 : 250;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping_fee + tax;
  const amountInCents = Math.round(total * 100);

  const [activeMethod, setActiveMethod] = useState("stripe");
  const [paymentStatus, setPaymentStatus] = useState(null); // null | "error"
  const [statusMessage, setStatusMessage] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: user?.username || "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
  });

  const handleShippingChange = (e) =>
    setShipping({ ...shipping, [e.target.name]: e.target.value });

  const validateShipping = () => {
    for (let key in shipping) {
      if (!shipping[key]) {
        alert(`⚠ Fill all shipping fields (${key})!`);
        return false;
      }
    }
    return true;
  };

  // Called by StripePayment / PaypalPayment on success — payment has ALREADY
  // been charged at this point. Backend rebuilds items/prices from the DB
  // cart itself — client only needs to send paymentMethod + shippingAddress
  // (see order.service.js).
  //
  // FIX: previously this dispatched submitOrder and navigated away
  // immediately without checking whether order creation succeeded. Since
  // payment has already been captured, a failure here means the customer
  // paid with no order on record and never saw an error. Now we await the
  // thunk, only navigate on success, and surface a clear message (with
  // guidance to contact support) if order creation fails after payment.
  const handlePaymentSuccess = async () => {
    if (!validateShipping()) return;

    setPlacingOrder(true);
    setPaymentStatus(null);
    setStatusMessage("");

    try {
      await dispatch(
        submitOrder({
          paymentMethod: activeMethod.toUpperCase(), // "stripe" → "STRIPE", "paypal" → "PAYPAL"
          shippingAddress: shipping,
        }),
      ).unwrap();

      // Backend already cleared the cart on successful order creation —
      // sync local state so the cart page doesn't show stale items.
      dispatch(fetchCart());

      navigate("/user");
    } catch (err) {
      setPaymentStatus("error");
      setStatusMessage(
        typeof err === "string"
          ? `Payment succeeded, but we couldn't place your order: ${err}. Please contact support with your payment details — do not pay again.`
          : "Payment succeeded, but we couldn't place your order. Please contact support with your payment details — do not pay again.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePaymentError = (message) => {
    setPaymentStatus("error");
    setStatusMessage(message || "Payment failed. Please try again.");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-pink-50/40 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-pink-500 hover:text-pink-700 transition-colors mb-3"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Cart
        </button>
        <h1 className="text-3xl font-bold text-pink-700">Checkout</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* LEFT: Shipping + Payment */}
        <div className="bg-white shadow-md shadow-pink-100 border border-pink-100 rounded-lg p-6 space-y-6">
          <div>
            <h2 className="font-semibold text-xl mb-3 text-pink-700">
              Shipping Address
            </h2>
            {Object.keys(shipping).map((field) => (
              <div key={field} className="mb-2">
                <label
                  htmlFor={`shipping-${field}`}
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  id={`shipping-${field}`}
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={shipping[field]}
                  onChange={handleShippingChange}
                  className="w-full border border-pink-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 text-sm"
                />
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-semibold text-xl mb-3 text-pink-700">
              Payment Method
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    setActiveMethod(method.id);
                    setPaymentStatus(null);
                    setStatusMessage("");
                  }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    activeMethod === method.id
                      ? "border-pink-400 bg-pink-50 text-pink-700"
                      : "border-pink-100 hover:border-pink-300 text-gray-600"
                  }`}
                >
                  <span
                    className={
                      activeMethod === method.id
                        ? "text-pink-600"
                        : "text-pink-300"
                    }
                  >
                    {method.icon}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{method.label}</p>
                    <p className="text-xs text-gray-400">
                      {method.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {paymentStatus === "error" && (
              <div className="mb-4 flex items-start gap-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl px-4 py-3 text-sm">
                <svg
                  className="w-5 h-5 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{statusMessage}</span>
              </div>
            )}

            {placingOrder && (
              <div className="mb-4 bg-pink-50 border border-pink-200 text-pink-700 rounded-xl px-4 py-3 text-sm animate-pulse">
                Finalizing your order — please don't close this page...
              </div>
            )}

            {!user ? (
              <div className="bg-pink-50 border border-pink-200 text-pink-700 rounded-xl px-4 py-3 text-sm">
                ⚠ Please log in to complete your purchase.
              </div>
            ) : !cart?.length ? (
              <div className="bg-pink-50 border border-pink-200 text-pink-700 rounded-xl px-4 py-3 text-sm">
                ⚠ Your cart is empty.
              </div>
            ) : activeMethod === "stripe" ? (
              <Elements stripe={stripePromise}>
                <StripePayment
                  amount={amountInCents}
                  orderId={user?._id}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            ) : (
              <PaypalPayment
                amount={amountInCents}
                orderId={user?._id}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </div>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="bg-white shadow-md shadow-pink-100 border border-pink-100 rounded-lg p-6 flex flex-col">
          <h2 className="font-semibold text-xl mb-4 text-pink-700">
            Order Summary
          </h2>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {cart?.length === 0 ? (
              <p className="text-pink-400">Your cart is empty.</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product._id}
                  className="flex justify-between items-center border-b border-pink-100 pb-2"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded object-cover ring-1 ring-pink-100"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-pink-600">
                    ${item.subtotal.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-pink-100 mt-4 pt-4 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {shipping_fee === 0 ? "Free" : `$${shipping_fee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base text-gray-900 pt-2 border-t border-pink-100">
              <span>Total:</span>
              <span className="text-pink-600">${total.toFixed(2)}</span>
            </div>
          </div>

          {shipping_fee > 0 && (
            <div className="mt-3 bg-pink-50 border border-pink-200 rounded-lg px-3 py-2 text-xs text-pink-700">
              Add <strong>${(5000 - subtotal).toFixed(2)}</strong> more for free
              shipping!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
