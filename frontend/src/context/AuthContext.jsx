import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("/auth/me/");
      if (response.data?.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login/", { email, password });
      if (response.data?.success) {
        const { tokens, user: userData } = response.data.data;
        localStorage.setItem("access_token", tokens.access);
        localStorage.setItem("refresh_token", tokens.refresh);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: response.data?.message || "Login failed" };
    } catch (error) {
      const message = error.response?.data?.message || "Invalid credentials";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googleToken) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/google/", { token: googleToken });
      if (response.data?.success) {
        const { tokens, user: userData } = response.data.data;
        localStorage.setItem("access_token", tokens.access);
        localStorage.setItem("refresh_token", tokens.refresh);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: "Google Authentication failed" };
    } catch (error) {
      const message = error.response?.data?.message || "Google Authentication failed";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (user.role === "SUPER_ADMIN" || user.is_superuser) return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        logout,
        hasRole,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
