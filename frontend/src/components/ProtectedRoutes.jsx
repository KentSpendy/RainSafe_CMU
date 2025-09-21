// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access");

  if (!token) {
    // 🚨 No token → redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
}
