import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<void> | null = null;

// Request interceptor - add auth token (skip for login/register/refresh)
api.interceptors.request.use(
  (config) => {
    const isAuthEndpoint =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register") ||
      config.url?.includes("/auth/google");

    if (isAuthEndpoint) {
      delete config.headers.Authorization;
      return config;
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh with mutex
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/google");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token");

          const response = await axios.post("/api/auth/refresh", { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
        })();
      }

      try {
        await refreshPromise;
        refreshPromise = null;

        const token = localStorage.getItem("accessToken");
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch {
        refreshPromise = null;
        clearAuthStorage();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

function clearAuthStorage() {
  localStorage.removeItem("authInfo");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}
