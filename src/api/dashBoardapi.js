
import axios from "axios";

// Scoped specifically to /api/dashboard — mirrors adminApi.js's pattern of
// one axios instance per backend resource, rather than reusing adminApi
// (which is baseURL-locked to /api/admins and would 404 dashboard calls).
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const dashboardApi = axios.create({
  baseURL: `${API_BASE_URL}/dashboard`,
  withCredentials: true,
});

dashboardApi.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

dashboardApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    return Promise.reject({ message, status: error.response?.status });
  },
);

export default dashboardApi;
