import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders, cancelOrder } from "../Slices/orderSlice";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function UserOrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.signinuser || {});
  const {
    orders = [],
    loading,
    cancelling,
    error,
  } = useSelector((state) => state.order);

  useEffect(() => {
    if (user) dispatch(fetchUserOrders());
  }, [dispatch, user]);

  if (!user) return null;

  const handleCancelOrder = (e, orderId, status) => {
    e.stopPropagation();

    if (status !== "PENDING") {
      alert("Only pending orders can be cancelled.");
      return;
    }

    if (window.confirm("Are you sure you want to cancel this order?")) {
      dispatch(cancelOrder(orderId));
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/user/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen p-6 bg-pink-50">
      <button
        onClick={() => navigate("/user")}
        className="flex items-center gap-2 mb-6 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition"
      >
        <FiArrowLeft />
        Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold mb-6 text-center text-pink-700">
        🛒 Your Orders
      </h1>

      {loading ? (
        <div className="text-center text-lg text-pink-600">
          Loading orders...
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-pink-500">
          You have no active orders!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {orders.map((order) => (
            <div
              key={order._id}
              onClick={() => handleViewDetails(order._id)}
              className="bg-white rounded-xl shadow p-4 border border-pink-100 hover:border-pink-300 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-pink-800">
                    Order ID: {order._id.slice(-8)}
                  </span>

                  <span className="text-sm text-pink-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-sm text-pink-600 mb-2">
                  Status:{" "}
                  <span className="font-semibold text-pink-700">
                    {order.status}
                  </span>
                </div>

                <div>
                  <strong className="text-pink-700">Items:</strong>
                  <ul className="list-disc pl-5 text-pink-700 mt-1">
                    {order.items.map((item) => (
                      <li key={item.product}>
                        {item.name} x {item.quantity} (${item.price.toFixed(2)})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-pink-100">
                <div className="font-semibold text-pink-700">
                  Total: ${order.totalAmount.toFixed(2)}
                </div>

                {order.status === "PENDING" && (
                  <button
                    onClick={(e) =>
                      handleCancelOrder(e, order._id, order.status)
                    }
                    disabled={cancelling}
                    className="bg-pink-600 text-white py-1 px-4 rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
                  >
                    {cancelling ? "Cancelling..." : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
