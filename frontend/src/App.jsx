// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin/Dashboard";
import Stations from "./pages/admin/Stations";
import ForecastPage from "./pages/admin/ForecastPage"; // if you have this
import Unauthorized from "./pages/auth/Unauthorized"; // we created this in Step 5
import RequireAuth from "./components/RequireAuth"; // new unified route guard
import UserDashboard from "./pages/users/UserDashboard";
import ReportPage from "./pages/users/ReportPage";
import ReportDashboard from "./pages/admin/ReportDashboard";
import NotificationsPage from "./pages/NotificationsPage";
import { Toaster } from "react-hot-toast";


import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin-only routes */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth requiredRole="admin">
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RequireAuth requiredRole="admin">
              <ReportDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/stations"
          element={
            <RequireAuth requiredRole="admin">
              <Stations />
            </RequireAuth>
          }
        />

        {/* Shared (authenticated) routes */}
        <Route
          path="/forecast"
          element={
            <RequireAuth>
              <ForecastPage />
            </RequireAuth>
          }
        />

        {/* Catch-all: Redirect unknown routes to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        <Route
          path="/user"
          element={
            <RequireAuth>
              <UserDashboard />
            </RequireAuth>
          }
        />
        <Route 
          path="/report" 
          element={
            <RequireAuth>
              <ReportPage />
            </RequireAuth>
          } 
        />
        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <NotificationsPage />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
