import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

/**
 * Enhanced RequireAuth component with token refresh capability
 * - Checks if token is valid
 * - Proactively refreshes token if expired or about to expire (within 5 minutes)
 * - Redirects to login only if refresh fails or no token exists
 * - Validates required role if specified
 */
const RequireAuth = ({ children, requiredRole }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        setIsChecking(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = decoded.exp - currentTime;

        // If token is expired or will expire in less than 5 minutes (300 seconds)
        if (timeUntilExpiry < 300) {
          const refreshToken = localStorage.getItem("refresh");

          if (!refreshToken) {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            setIsChecking(false);
            return;
          }

          try {
            // Attempt to refresh the token
            const response = await axios.post(
              "http://127.0.0.1:8000/api/users/token/refresh/",
              { refresh: refreshToken }
            );

            const { access } = response.data;
            localStorage.setItem("access", access);

            // Decode the new token to check role
            const newDecoded = jwtDecode(access);

            // Check role if required
            if (requiredRole && newDecoded.role !== requiredRole) {
              setHasRequiredRole(false);
            } else {
              setIsAuthenticated(true);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            setIsChecking(false);
            return;
          }
        } else {
          // Token is still valid
          // Check role if required
          if (requiredRole && decoded.role !== requiredRole) {
            setHasRequiredRole(false);
          } else {
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        localStorage.removeItem("access");
        setIsChecking(false);
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [requiredRole]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if doesn't have required role
  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAuth;
