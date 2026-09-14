import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrdersAdmin,
  updateOrderStatusAdmin,
} from "../AdminSlices/adminOrderSlice";

const STATUS_OPTIONS = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default function AdminOrdersPage() {
  const dispatch = useDispatch();
  const { orders, pagination, loading, updating, error } = useSelector(
    (state) => state.adminOrders,
  );

  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchAllOrdersAdmin({
        page,
        limit: 10,
        status: filter === "all" ? undefined : filter,
      }),
    );
  }, [dispatch, page, filter]);

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o._id.includes(searchQuery),
    );
  }, [orders, searchQuery]);

  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );

  const handleStatusChange = (order, newStatus) => {
    if (window.confirm(`Mark this order as ${newStatus}?`)) {
      dispatch(
        updateOrderStatusAdmin({ orderId: order._id, status: newStatus }),
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-linear-to-br from-rose-50 via-pink-50 to-fuchsia-50">
      <h1 className="text-3xl font-bold mb-6 text-rose-900">📦 All Orders</h1>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex gap-4 items-center">
          <span className="font-semibold text-rose-800">
            Total Revenue:{" "}
            <span className="text-rose-600 font-bold">
              ${totalRevenue.toFixed(2)}
            </span>
          </span>

          <select
            className="border border-rose-200 rounded-md p-2 bg-white text-rose-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Search by username, email, or order ID..."
          className="border border-rose-200 rounded-md p-2 w-full sm:w-64 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading && (
        <p className="text-center text-rose-600 py-4 animate-pulse">
          Loading orders...
        </p>
      )}
      {error && <p className="text-center text-red-500 py-4">{error}</p>}

      <div className="overflow-x-auto bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-rose-100">
        <table className="w-full border-collapse">
          <thead className="bg-rose-50 text-rose-900">
            <tr>
              <th className="p-3 text-left border-b border-rose-100">#</th>
              <th className="p-3 text-left border-b border-rose-100">
                Order ID
              </th>
              <th className="p-3 text-left border-b border-rose-100">User</th>
              <th className="p-3 text-left border-b border-rose-100">Items</th>
              <th className="p-3 text-left border-b border-rose-100">Total</th>
              <th className="p-3 text-left border-b border-rose-100">Status</th>
              <th className="p-3 text-left border-b border-rose-100">Date</th>
              <th className="p-3 text-left border-b border-rose-100">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order, index) => (
              <tr
                key={order._id}
                className="hover:bg-rose-50 transition border-b border-rose-100"
              >
                <td className="p-3 text-rose-700">
                  {(pagination.page - 1) * 10 + index + 1}
                </td>

                <td className="p-3 font-medium text-rose-900">
                  {order._id.slice(-8)}
                </td>

                <td className="p-3 text-gray-700">
                  {order.user?.username || order.user?.email || "Unknown"}
                </td>

                <td className="p-3 text-sm text-gray-600">
                  {order.items.map((item) => (
                    <div key={item.product}>
                      {item.name} x {item.quantity} (${item.price.toFixed(2)})
                    </div>
                  ))}
                </td>

                <td className="p-3 font-semibold text-rose-700">
                  ${order.totalAmount.toFixed(2)}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-semibold ${
                      order.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-700"
                        : order.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="p-3 text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

                <td className="p-3">
                  <select
                    className="border border-rose-200 rounded-md p-1 text-sm bg-white"
                    value={order.status}
                    disabled={updating}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-2 mt-4 text-rose-800">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded border border-rose-200 bg-white hover:bg-rose-50 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
          disabled={page >= pagination.totalPages}
          className="px-3 py-1 rounded border border-rose-200 bg-white hover:bg-rose-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
