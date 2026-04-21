// Authentication utilities
import apiClient, { getErrorMessage } from "./api";

const isBrowser = () => typeof window !== "undefined";

const decodeTokenPayload = (token) => {
  if (!token || !isBrowser()) {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "="
    );
    const decodedPayload = window.atob(paddedPayload);

    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
};

export const authApi = {
  async register(email, password, name) {
    const response = await apiClient.post("/api/v1/auth/register", {
      email,
      password,
      name,
    });
    return response.data;
  },

  async login(email, password) {
    const response = await apiClient.post("/api/v1/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  async logout() {
    try {
      await apiClient.post("/api/v1/auth/logout");
    } catch (e) {
      // Ignore errors on logout
    }
    this.removeToken();
  },

  setToken() {
    // Deprecated: Handled by HttpOnly Cookies natively
  },

  getToken() {
    // Deprecated: Handled by HttpOnly Cookies natively
    return null;
  },

  removeToken() {
    // Deprecated: Handled directly in logout via endpoints now
  },

  isAuthenticated() {
    // With HttpOnly cookies, we rely on the backend via getCurrentUser instead.
    // If a request fails via 401, the API interceptor will auto handle redirecting to /login
    return true; 
  },

  getCurrentUserId() {
    // Deprecated: Token payload cannot be read from HttpOnly cookies in frontend.
    return null;
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get(`/api/v1/users/me`);
      return response.data;
    } catch {
      return null;
    }  },
  getErrorMessage(error, fallback = "An error occurred") {
    return getErrorMessage(error, fallback);
  },
};
