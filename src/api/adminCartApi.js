import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const adminCartApi = axios.create({
  baseURL: `${API_BASE_URL}/admin/carts`,
  withCredentials: true,
});

adminCartApi.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

adminCartApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    return Promise.reject({ message, status: error.response?.status });
  },
);

export default adminCartApi;
