import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

/**
 * Smart redirect component that redirects based on authentication status and role
 * - If not authenticated: redirects to /login
 * - If admin: redirects to /dashboard
 * - If regular user: redirects to /user
 */
const SmartRedirect = () => {
  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Check if token is expired
    if (decoded.exp < currentTime) {
      localStorage.removeItem("access");
      return <Navigate to="/login" replace />;
    }

    // Redirect based on role
    if (decoded.role === "admin") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/user" replace />;
    }
  } catch (error) {
    localStorage.removeItem("access");
    return <Navigate to="/login" replace />;
  }
};

export default SmartRedirect;
