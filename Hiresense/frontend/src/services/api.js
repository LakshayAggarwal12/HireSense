import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const TOKEN_KEY = "hiresense_token";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { Accept: "application/json" },
});

// Attach the JWT to every outgoing request. Reading from localStorage here
// (rather than holding it in a module variable) means a token set in one tab
// is picked up without needing to re-initialize the client.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalizes FastAPI's {detail: "..."} error shape into a plain message, and
// handles expired/invalid tokens globally: on a 401 we clear the stored token
// and hard-redirect to /login, so a stale session can't leave the UI in a
// half-authenticated state where every request silently fails.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;

    if (status === 401) {
      const onAuthPage = ["/login", "/register"].includes(window.location.pathname);
      // Don't redirect on a failed login attempt - the form shows the error
      // itself, and bouncing the page would wipe what the user typed.
      const isAuthRequest = error?.config?.url?.includes("/api/auth/");
      if (!onAuthPage && !isAuthRequest) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = "/login";
      }
    }

    let message = "Something went wrong. Please try again.";
    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail) && detail[0]?.msg) {
      // Pydantic validation errors arrive as an array of field errors.
      message = detail[0].msg;
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
