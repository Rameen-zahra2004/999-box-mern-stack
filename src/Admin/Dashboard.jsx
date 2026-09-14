import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BiBarChart,
  BiShoppingBag,
  BiUser,
  BiCube,
  BiCart,
  BiCog,
} from "react-icons/bi";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

import {
  fetchDashboardSummary,
  fetchSalesAnalytics,
  fetchRevenueAnalytics,
} from "../AdminSlices/dashboardSlice";
import SearchBar from "../Admin component/AdminSearchBar";

// Single dashboard card
function DashboardCard({ card, onClick, loading }) {
  return (
    <div
      onClick={onClick}
      className="transition-transform transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl 
                  bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-rose-100 flex flex-col justify-between
                  cursor-pointer"
    >
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-rose-900 text-base font-bold">{card.title}</h3>

          {card.value !== undefined && (
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              {loading ? (
                <span className="animate-pulse bg-rose-200 rounded w-16 h-7 inline-block"></span>
              ) : (
                card.value || 0
              )}
            </p>
          )}

          {card.growth !== undefined && (
            <p
              className={`text-sm mt-1 font-semibold ${
                card.growth >= 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {card.growth >= 0 ? "▲" : "▼"} {card.growth || 0}% vs last month
            </p>
          )}
        </div>

        <div
          className={`${card.bg} p-3 rounded-xl flex items-center justify-center shadow-md`}
        >
          {card.icon}
        </div>
      </div>

      {card.trend && (
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={card.trend.map((v) => ({ value: v }))}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#E11D48"
              strokeWidth={2}
              dot={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #fecdd3",
                borderRadius: "10px",
                fontSize: "12px",
                padding: "4px 8px",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function DashboardHome({ sidebarOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { summary, sales, revenue, loading, error } = useSelector(
    (state) => state.adminDashboard,
  );

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchSalesAnalytics());
    dispatch(fetchRevenueAnalytics());
  }, [dispatch]);

  // FIX: previously checked state.signinuser (the regular USER session, not
  // the admin one) against a lowercase "admin" role string, and used that to
  // disable most of the dashboard cards. Both parts were wrong — this page
  // only renders inside ProtectedAdminRoute, so anyone here is already a
  // verified admin (server-side via protectAdmin, client-side via the
  // route guard). The extra check was redundant and effectively disabled
  // Revenue/Carts/Settings for every real admin. Every card now just
  // navigates directly.
  const goToPage = (page) => {
    navigate(page);
  };

  // Revenue trend for the sparkline — last 12 months of totalRevenue,
  // pulled from the monthlyRevenue series (already chart-ready from backend).
  const revenueTrend = useMemo(
    () => revenue?.monthlyRevenue?.map((m) => m.totalRevenue) || [],
    [revenue],
  );

  // Combine per-section errors into one displayable message, since this
  // page shows a single error banner rather than one per card.
  const combinedError = useMemo(() => {
    if (!error) return null;
    return error.summary || error.sales || error.revenue || null;
  }, [error]);

  const cards = useMemo(
    () => [
      {
        title: "Total Users",
        value: summary?.totalCustomers,
        icon: <BiUser className="text-rose-600 w-6 h-6" />,
        bg: "bg-rose-100",
        page: "/admin/users",
        loading: loading?.summary,
      },
      {
        title: "Orders Today",
        value: sales?.daily,
        icon: <BiShoppingBag className="text-pink-600 w-6 h-6" />,
        bg: "bg-pink-100",
        page: "/admin/orders",
        loading: loading?.sales,
      },
      {
        title: "Revenue",
        value: revenue?.thisMonth,
        icon: <BiBarChart className="text-fuchsia-600 w-6 h-6" />,
        bg: "bg-fuchsia-100",
        page: "/admin/revenue",
        trend: revenueTrend,
        loading: loading?.revenue,
      },
      {
        title: "Products",
        value: summary?.totalProducts,
        icon: <BiCube className="text-rose-700 w-6 h-6" />,
        bg: "bg-rose-200",
        page: "/admin/products",
        loading: loading?.summary,
      },
      {
        title: "Carts",
        icon: <BiCart className="text-pink-700 w-6 h-6" />,
        bg: "bg-pink-200",
        page: "/admin/carts",
      },
      {
        title: "Settings",
        icon: <BiCog className="text-gray-700 w-6 h-6" />,
        bg: "bg-rose-50",
        page: "/admin/settings",
      },
    ],
    [summary, sales, revenue, revenueTrend, loading],
  );

  const filteredCards = cards.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(query) ||
      (c.value !== undefined && String(c.value).includes(query))
    );
  });

  return (
    <div className="p-4 sm:p-6 bg-linear-to-br from-rose-50 via-pink-50 to-fuchsia-50 min-h-screen transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 w-full">
        <div className="w-64">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search metrics..."
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-rose-900">
          Dashboard
        </h1>
      </div>

      <p className="text-rose-700 mb-6 text-sm sm:text-base">
        Here's what's happening with your store today.
      </p>

      {combinedError && (
        <p className="text-red-500 mb-4 text-center text-sm">{combinedError}</p>
      )}

      {/* Cards Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCards.length > 0 ? (
          filteredCards.map((card, idx) => (
            <DashboardCard
              key={idx}
              card={card}
              onClick={() => goToPage(card.page)}
              loading={card.loading}
            />
          ))
        ) : (
          <p className="text-center text-rose-500 col-span-full">
            No metrics found for "{searchQuery}"
          </p>
        )}
      </div>
    </div>
  );
}
