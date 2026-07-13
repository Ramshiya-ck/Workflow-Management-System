import apiClient from "@/services/apiClient";

/**
 * Sends a corporate sign-in payload to the backend server.
 */
export const loginApi = async (email, password) => {
  const response = await apiClient.post("/auth/login/", { email, password });
  return response.data;
};

/**
 * Sends a sign-out request to revoke the refresh token.
 */
export const logoutApi = async (refreshToken) => {
  const response = await apiClient.post("/auth/logout/", { refresh: refreshToken });
  return response.data;
};

/**
 * Retrieves current employee profile details from the backend gateway.
 */
export const fetchProfileApi = async () => {
  const response = await apiClient.get("/auth/me/");
  return response.data;
};

/**
 * Refreshes an expired access token using the refresh token.
 */
export const refreshTokenApi = async (refreshToken) => {
  const response = await apiClient.post("/auth/token/refresh/", { refresh: refreshToken });
  return response.data;
};

/**
 * Initiates the forgot password flow by requesting a reset OTP link.
 */
export const forgotPasswordApi = async (email) => {
  const response = await apiClient.post("/auth/forgot-password/", { email });
  return response.data;
};

/**
 * Completes the password reset flow using email, code/OTP, and the new password.
 */
export const resetPasswordApi = async (email, code, newPassword) => {
  const response = await apiClient.post("/auth/reset-password/", {
    email,
    code,
    new_password: newPassword,
  });
  return response.data;
};
