import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { loginAdmin, clearAdminError } from "../AdminSlices/adminLoginSlice";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.adminLogin,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAdminError());

    const result = await dispatch(loginAdmin({ email, password }));

    if (loginAdmin.fulfilled.match(result)) {
      navigate("/admin/dashboard");
    }
  };

  // FIX: previously this was:
  //   if (isAuthenticated) { navigate("/admin/dashboard"); return null; }
  // ...called directly in the component body, which runs during render.
  // navigate() triggers a state update on BrowserRouter, and React does
  // not allow updating one component's state while a different component
  // (AdminLogin) is still rendering — that's exactly the console error:
  // "Cannot update a component (BrowserRouter) while rendering a
  // different component (AdminLogin)". Moving it into useEffect makes the
  // navigation a proper side effect that runs after render completes.
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-pink-50 via-white to-pink-100 p-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Admin Login
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Sign in to access the admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="w-full mb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Email
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400 pointer-events-none">
                <FaEnvelope size={13} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                required
                className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-4 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          <div className="w-full mb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400 pointer-events-none">
                <FaLock size={13} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-10 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 text-gray-400 focus:outline-none cursor-pointer"
              >
                {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 ${
              loading
                ? "bg-pink-300 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700 active:scale-[0.98] shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
