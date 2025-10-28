// src/components/RequireAdmin.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RequireAdmin({ children }) {
  const { isAuthenticated, role } = useContext(AuthContext);

  if (!isAuthenticated) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    // Logged in but not admin
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
