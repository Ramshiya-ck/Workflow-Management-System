import React, { createContext, useContext, useState, useEffect } from "react";
import { getTokens, clearTokens } from "@/services/apiClient";
import { fetchProfileApi } from "./api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on initial mount
  useEffect(() => {
    const restoreSession = async () => {
      const { access } = getTokens();
      if (access) {
        try {
          const res = await fetchProfileApi();
          if (res?.success) {
            setUser(res.data);
          }
        } catch (error) {
          console.error("Session restore failed", error);
          clearTokens();
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = React.useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
  }, []);

  const value = React.useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
