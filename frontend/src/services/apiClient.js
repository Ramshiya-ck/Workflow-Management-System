import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to retrieve tokens from storage
export const getTokens = () => {
  const access = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");
  return { access, refresh };
};

// Helper to store tokens
export const setTokens = (access, refresh, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
  } else {
    sessionStorage.setItem("access_token", access);
    sessionStorage.setItem("refresh_token", refresh);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
};

// Helper to clear tokens
export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
};

// Request interceptor to attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const { access } = getTokens();
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh queue variables
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token refresh and unauthorized access
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh token fails
    if (error.response?.status === 401 && originalRequest.url.includes("auth/token/refresh/")) {
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refresh } = getTokens();

      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refresh,
          });

          if (res.status === 200) {
            const newAccessToken = res.data.access;
            
            // Re-store access token under the correct storage type
            const isLocalStorage = !!localStorage.getItem("refresh_token");
            setTokens(newAccessToken, refresh, isLocalStorage);

            processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearTokens();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        clearTokens();
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    // Global Error Handler
    return Promise.reject(error);
  }
);

export default apiClient;
