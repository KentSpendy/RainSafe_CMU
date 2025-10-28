// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { loginUser as apiLoginUser, logoutUser as apiLogoutUser } from "../api/auth";

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  role: null,
  login: async () => {},
  logout: () => {},
  refreshFromStorage: () => {},
});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null); // e.g. { email, id } if available

  const refreshFromStorage = useCallback(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setIsAuthenticated(false);
      setRole(null);
      setUser(null);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      // decoded should include role and email per backend token customization
      setIsAuthenticated(true);
      setRole(decoded.role || null);
      setUser({ email: decoded.email || null, id: decoded.user_id || decoded.user || null });
    } catch (err) {
      // invalid or expired token
      setIsAuthenticated(false);
      setRole(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // initialize from storage when provider mounts
    refreshFromStorage();
  }, [refreshFromStorage]);

  const login = async (email, password) => {
    // call the existing API helper which stores tokens in localStorage
    const result = await apiLoginUser(email, password);
    // apiLoginUser returns an object that includes role/email (per your auth.js)
    // but to be safe, re-scan localStorage token
    refreshFromStorage();
    return result;
  };

  const logout = () => {
    apiLogoutUser(); // clears tokens in storage
    setIsAuthenticated(false);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        user,
        login,
        logout,
        refreshFromStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
