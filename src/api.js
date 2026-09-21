import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // httpOnly cookies are sent automatically — no manual token handling needed
  headers: {
    "Content-Type": "application/json",
  },
});

// Tokens live in httpOnly cookies set by the backend — JS should never
// read or attach them manually. `withCredentials: true` above is sufficient.

// Pages where a failed session must NOT redirect (prevents redirect loops).
// Adjust these to match your real route names.
const PUBLIC_PATHS = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

// Auth endpoints must never trigger a refresh attempt
// (e.g. a wrong password returning 401 is normal, not an expired session).
const AUTH_ENDPOINT_REGEX =
  /\/auth\/(login|register|refresh|logout|forgot|reset)/;

// Shared promise so several failed requests trigger only ONE refresh call.
let refreshPromise = null;

// On 401: attempt one silent refresh, retry the original request once,
// and give up cleanly if the refresh fails.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";
    const isAuthCall = AUTH_ENDPOINT_REGEX.test(url);

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthCall
    ) {
      originalRequest._retry = true;

      try {
        refreshPromise = refreshPromise || api.post("/auth/refresh");
        await refreshPromise;
        return api(originalRequest);
      } catch (refreshError) {
        // Session is truly over. Redirect only if we're not already
        // on a public auth page, otherwise the page reloads forever.
        const onPublicPage = PUBLIC_PATHS.some((path) =>
          window.location.pathname.startsWith(path),
        );
        if (!onPublicPage) {
          window.location.href = "/signin";
        }
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
