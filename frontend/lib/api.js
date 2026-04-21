// API client utilities
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const AUTH_ROUTES = ["/api/v1/auth/login", "/api/v1/auth/register"];

const isBrowser = () => typeof window !== "undefined";

export const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg || String(item)).join(", ");
    }

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests (Left for legacy / backward compatibility if needed, but not strictly needed for HttpOnly cookies)
apiClient.interceptors.request.use((config) => {
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = error.config?.url ?? "";
    const isAuthRequest = AUTH_ROUTES.some((route) => requestUrl.includes(route));

    // If it's 401 and we haven't retried yet and it's not a login request
    if (error.response?.status === 401 && !isAuthRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to hit the refresh endpoint (Cookies will be sent automatically)
        await axios.post(`${API_URL}/api/v1/auth/refresh`, {}, { withCredentials: true });
        
        // If refresh creates new cookies perfectly, retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, purge user and redirect to login
        

        if (isBrowser() && window.location.pathname !== "/login") {    
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
