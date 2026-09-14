import axios from "axios";

// Reuses VITE_API_URL (same var as src/api.js, which points to ".../api")
// and appends the /admins suffix, so one env var configures every instance.
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admins`,
  withCredentials: true,
});

// ─── Request interceptor ──────────────────────────────────
adminApi.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// ─── Response interceptor ─────────────────────────────────
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    return Promise.reject({ message, status: error.response?.status });
  },
);

export default adminApi;
