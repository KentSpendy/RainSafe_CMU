# RainSafe CMU - User Side Development Roadmap

**Last Updated:** 2025-11-12
**Purpose:** Actionable development plan for user-facing features
**Status:** Ready for Development

---

## Table of Contents

1. [Current State Overview](#current-state-overview)
2. [Priority Development Plan](#priority-development-plan)
3. [Feature Specifications](#feature-specifications)
4. [Implementation Guide](#implementation-guide)
5. [API Requirements](#api-requirements)
6. [Component Architecture](#component-architecture)
7. [Development Checklist](#development-checklist)

---

## Current State Overview

### ✅ What's Working

| Feature            | Status      | Location                                                       |
| ------------------ | ----------- | -------------------------------------------------------------- |
| User Registration  | ✅ Complete | [Register.jsx](src/pages/auth/Register.jsx)                    |
| User Login         | ✅ Complete | [Login.jsx](src/pages/auth/Login.jsx)                          |
| JWT Authentication | ✅ Complete | [api.js](src/api/api.js)                                       |
| Incident Reporting | ✅ Complete | [ReportPage.jsx](src/pages/users/ReportPage.jsx)               |
| Notifications View | ✅ Complete | [NotificationsPage.jsx](src/pages/users/NotificationsPage.jsx) |

### ⚠️ What Needs Work

| Feature                 | Status         | Priority | Effort |
| ----------------------- | -------------- | -------- | ------ |
| User Dashboard          | 🔴 Placeholder | CRITICAL | Medium |
| My Reports              | ❌ Missing     | CRITICAL | Medium |
| Profile Management      | ❌ Missing     | HIGH     | Low    |
| Weather Display         | ⚠️ Partial     | HIGH     | Medium |
| Real-time Notifications | ❌ Missing     | MEDIUM   | High   |
| Report Details          | ❌ Missing     | HIGH     | Low    |

---

## Priority Development Plan

### Phase 1: Critical Features (Week 1-2)

**Goal:** Make the user dashboard functional and add essential report management

#### 1.1 User Dashboard (Priority: 🔴 CRITICAL)

**Current:** Empty placeholder component
**Target:** Fully functional dashboard with widgets

**What to Build:**

```
UserDashboard/
├─ Welcome Section (user name, last login)
├─ Quick Stats Cards (3 cards)
│  ├─ Current Weather
│  ├─ My Reports Count
│  └─ Unread Notifications
├─ Weather Widget (current conditions)
├─ Quick Actions (4 buttons)
│  ├─ Report Incident
│  ├─ View Forecast
│  ├─ My Reports
│  └─ Notifications
└─ Recent Reports List (last 5 reports)
```

**Estimated Time:** 2-3 days

#### 1.2 My Reports Page (Priority: 🔴 CRITICAL)

**Current:** Doesn't exist
**Target:** List view of user's submitted reports

**What to Build:**

```
MyReportsPage/
├─ Header with stats
├─ Filter Section
│  ├─ Status filter (All, Pending, In Progress, Resolved)
│  └─ Date range filter
├─ Reports List
│  ├─ Report card with key info
│  ├─ Status badge
│  ├─ Click to view details
│  └─ Quick actions (view, delete)
└─ Empty state (no reports)
```

**Estimated Time:** 2 days

#### 1.3 Report Detail Page (Priority: 🔴 CRITICAL)

**Current:** Doesn't exist
**Target:** Detailed view of single report

**What to Build:**

```
ReportDetailPage/
├─ Report Header (title, status, date)
├─ Report Information
│  ├─ Description
│  ├─ Contact info
│  ├─ Submission date
│  └─ Current status
├─ Location Map (showing report location)
├─ Image Display (if uploaded)
├─ Status Timeline
│  ├─ Submitted → Pending
│  ├─ In Progress (with timestamp)
│  └─ Resolved (with timestamp)
└─ Actions
   └─ Delete Report (if pending)
```

**Estimated Time:** 2 days

### Phase 2: High Priority Features (Week 3-4)

#### 2.1 Profile Management (Priority: 🟡 HIGH)

**What to Build:**

```
ProfilePage/
├─ Profile Header (name, email, member since)
├─ Personal Information Section (editable)
│  ├─ First Name, Last Name
│  ├─ Age, Sex
│  └─ Contact Number
├─ Address Information (editable)
│  ├─ Purok, Barangay
│  └─ Municipal, Province
├─ Account Settings
│  ├─ Change Password
│  └─ Email Preferences
└─ Account Statistics
   ├─ Total Reports: X
   ├─ Member Since: Date
   └─ Last Login: Date
```

**Estimated Time:** 2-3 days

#### 2.2 Weather Display Enhancement (Priority: 🟡 HIGH)

**What to Build:**

```
WeatherPage/
├─ Current Weather Section
│  ├─ Temperature, conditions
│  ├─ Humidity, wind speed
│  └─ Location selector
├─ 3-Day Forecast
│  ├─ Daily cards
│  ├─ Min/Max temps
│  └─ Rain probability
└─ Hourly Forecast (today)
   └─ Hour-by-hour breakdown
```

**Estimated Time:** 2-3 days

### Phase 3: Medium Priority (Week 5-6)

#### 3.1 Notification Enhancements

- Add notification badge counter
- Implement toast notifications
- Add polling for new notifications (every 30 seconds)

**Estimated Time:** 2 days

#### 3.2 Report Editing

- Allow users to edit pending reports
- Add draft saving functionality

**Estimated Time:** 2 days

#### 3.3 Search & Filter

- Add search to My Reports
- Advanced filtering options
- Sort capabilities

**Estimated Time:** 1-2 days

---

## Feature Specifications

### Feature 1: User Dashboard

#### Components to Create:

```
src/pages/users/UserDashboard.jsx
src/components/dashboard/WelcomeSection.jsx
src/components/dashboard/StatCard.jsx
src/components/dashboard/WeatherWidget.jsx
src/components/dashboard/QuickActions.jsx
src/components/dashboard/RecentReportsList.jsx
```

#### API Calls Needed:

```javascript
// Get user profile
GET /api/users/me/

// Get user's reports count
GET /api/reports/my-reports/?count_only=true

// Get unread notifications count
GET /api/notifications/?unread_only=true&count_only=true

// Get current weather (user's location)
GET /api/weather/live/?lat={lat}&lon={lon}

// Get recent reports (last 5)
GET /api/reports/my-reports/?limit=5&order_by=-date_created
```

#### State Management:

```javascript
const [user, setUser] = useState(null);
const [stats, setStats] = useState({
  reportCount: 0,
  unreadNotifications: 0,
  currentWeather: null,
});
const [recentReports, setRecentReports] = useState([]);
const [loading, setLoading] = useState(true);
```

#### Implementation Code:

```javascript
// src/pages/users/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCloudRain,
  FaFileAlt,
  FaBell,
  FaMapMarkerAlt,
  FaCloudSun,
  FaList,
  FaUser,
} from "react-icons/fa";
import api from "../../api/api";

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    reportCount: 0,
    unreadCount: 0,
    weather: null,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [userRes, reportsRes, notificationsRes] = await Promise.all([
        api.get("/users/me/"),
        api.get("/reports/my-reports/"),
        api.get("/notifications/"),
      ]);

      setUser(userRes.data);
      setRecentReports(reportsRes.data.slice(0, 5));

      const unreadCount = notificationsRes.data.filter(
        (n) => !n.is_read
      ).length;

      setStats({
        reportCount: reportsRes.data.length,
        unreadCount: unreadCount,
        weather: null, // Will add weather API call later
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-950 to-blue-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800">
      {/* Welcome Section */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.first_name || "User"}!
        </h1>
        <p className="text-white/70 mt-2">
          Last login:{" "}
          {user?.last_login
            ? new Date(user.last_login).toLocaleDateString()
            : "N/A"}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 mb-6">
        {/* Weather Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Current Weather</p>
              <p className="text-white text-2xl font-bold mt-2">
                {stats.weather?.temperature || "--"}°C
              </p>
              <p className="text-white/60 text-sm mt-1">
                {stats.weather?.condition || "Loading..."}
              </p>
            </div>
            <FaCloudRain className="text-white/30 text-4xl" />
          </div>
        </div>

        {/* Reports Card */}
        <div
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 cursor-pointer hover:bg-white/20 transition"
          onClick={() => navigate("/user/my-reports")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">My Reports</p>
              <p className="text-white text-2xl font-bold mt-2">
                {stats.reportCount}
              </p>
              <p className="text-white/60 text-sm mt-1">Total Submitted</p>
            </div>
            <FaFileAlt className="text-white/30 text-4xl" />
          </div>
        </div>

        {/* Notifications Card */}
        <div
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 cursor-pointer hover:bg-white/20 transition"
          onClick={() => navigate("/notifications")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Notifications</p>
              <p className="text-white text-2xl font-bold mt-2">
                {stats.unreadCount}
              </p>
              <p className="text-white/60 text-sm mt-1">Unread</p>
            </div>
            <FaBell className="text-white/30 text-4xl" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/report"
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition text-center">
            <FaMapMarkerAlt className="text-white text-3xl mx-auto mb-3" />
            <p className="text-white font-medium">Report Incident</p>
          </Link>

          <Link
            to="/forecast"
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition text-center">
            <FaCloudSun className="text-white text-3xl mx-auto mb-3" />
            <p className="text-white font-medium">View Forecast</p>
          </Link>

          <Link
            to="/user/my-reports"
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition text-center">
            <FaList className="text-white text-3xl mx-auto mb-3" />
            <p className="text-white font-medium">My Reports</p>
          </Link>

          <Link
            to="/user/profile"
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition text-center">
            <FaUser className="text-white text-3xl mx-auto mb-3" />
            <p className="text-white font-medium">Profile</p>
          </Link>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="px-6 pb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Recent Reports</h2>
          <Link
            to="/user/my-reports"
            className="text-blue-300 hover:text-blue-200 text-sm">
            View All →
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
            <p className="text-white/70">No reports submitted yet</p>
            <Link
              to="/report"
              className="inline-block mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
              Submit Your First Report
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 hover:bg-white/15 transition cursor-pointer"
                onClick={() => navigate(`/user/reports/${report.id}`)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{report.name}</h3>
                    <p className="text-white/70 text-sm mt-1 line-clamp-2">
                      {report.description}
                    </p>
                    <p className="text-white/50 text-xs mt-2">
                      {new Date(report.date_created).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === "Pending"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : report.status === "In Progress"
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-green-500/20 text-green-300"
                    }`}>
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
```

---

### Feature 2: My Reports Page

#### Components to Create:

```
src/pages/users/MyReportsPage.jsx
src/components/reports/ReportCard.jsx
src/components/reports/ReportFilters.jsx
```

#### API Calls Needed:

```javascript
// Get all user's reports
GET /api/reports/my-reports/

// Delete a report
DELETE /api/reports/{id}/
```

#### Implementation Code:

```javascript
// src/pages/users/MyReportsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFilter, FaSearch, FaTrash, FaEye } from "react-icons/fa";
import api from "../../api/api";

function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, filterStatus, searchTerm]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reports/my-reports/");
      setReports(response.data);
      setFilteredReports(response.data);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    // Filter by status
    if (filterStatus !== "All") {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      await api.delete(`/reports/${id}/`);
      setReports(reports.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "In Progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Resolved":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-950 to-blue-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Reports</h1>
        <p className="text-white/70">
          Total: {reports.length} reports | Showing: {filteredReports.length}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {["All", "Pending", "In Progress", "Resolved"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? "bg-blue-500 text-white"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}>
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
          <p className="text-white/70 text-lg">No reports found</p>
          <button
            onClick={() => navigate("/report")}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
            Submit New Report
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">
                    {report.name}
                  </h3>
                  <p className="text-white/70 mt-2">{report.description}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    report.status
                  )}`}>
                  {report.status}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="text-white/60">
                  <span>
                    📍 {report.latitude.toFixed(4)},{" "}
                    {report.longitude.toFixed(4)}
                  </span>
                  <span className="ml-4">
                    📅 {new Date(report.date_created).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/user/reports/${report.id}`)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2">
                    <FaEye /> View
                  </button>
                  {report.status === "Pending" && (
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2">
                      <FaTrash /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyReportsPage;
```

---

### Feature 3: Report Detail Page

#### Implementation Code:

```javascript
// src/pages/users/ReportDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  FaArrowLeft,
  FaTrash,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
} from "react-icons/fa";
import api from "../../api/api";
import "leaflet/dist/leaflet.css";

function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/${id}/`);
      setReport(response.data);
    } catch (error) {
      console.error("Error loading report:", error);
      alert("Report not found");
      navigate("/user/my-reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      await api.delete(`/reports/${id}/`);
      navigate("/user/my-reports");
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "In Progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Resolved":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-950 to-blue-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/user/my-reports")}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-4">
          <FaArrowLeft /> Back to My Reports
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Report Details
            </h1>
            <p className="text-white/70">Report ID: #{report.id}</p>
          </div>

          <div className="flex gap-3">
            <span
              className={`px-4 py-2 rounded-lg font-medium border ${getStatusColor(
                report.status
              )}`}>
              {report.status}
            </span>
            {report.status === "Pending" && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2">
                <FaTrash /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Information */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Report Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm">Reporter Name</label>
                <p className="text-white font-medium">{report.name}</p>
              </div>

              <div>
                <label className="text-white/70 text-sm flex items-center gap-2">
                  <FaPhone /> Contact Number
                </label>
                <p className="text-white font-medium">{report.contact}</p>
              </div>

              <div>
                <label className="text-white/70 text-sm">Description</label>
                <p className="text-white">{report.description}</p>
              </div>

              <div>
                <label className="text-white/70 text-sm flex items-center gap-2">
                  <FaClock /> Submitted
                </label>
                <p className="text-white font-medium">
                  {new Date(report.date_created).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-white/70 text-sm flex items-center gap-2">
                  <FaMapMarkerAlt /> Location
                </label>
                <p className="text-white font-medium">
                  Lat: {report.latitude.toFixed(6)}, Lon:{" "}
                  {report.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Status Timeline
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className={`w-3 h-3 rounded-full mt-1 ${
                    report.status === "Pending"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}></div>
                <div className="flex-1">
                  <p className="text-white font-medium">Submitted</p>
                  <p className="text-white/60 text-sm">
                    {new Date(report.date_created).toLocaleString()}
                  </p>
                </div>
              </div>

              {(report.status === "In Progress" ||
                report.status === "Resolved") && (
                <div className="flex items-start gap-4">
                  <div
                    className={`w-3 h-3 rounded-full mt-1 ${
                      report.status === "In Progress"
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}></div>
                  <div className="flex-1">
                    <p className="text-white font-medium">In Progress</p>
                    <p className="text-white/60 text-sm">
                      Being reviewed by admin
                    </p>
                  </div>
                </div>
              )}

              {report.status === "Resolved" && (
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Resolved</p>
                    <p className="text-white/60 text-sm">
                      Report has been resolved
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map and Image */}
        <div className="space-y-6">
          {/* Location Map */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Location</h2>
            <div className="h-[300px] rounded-lg overflow-hidden">
              <MapContainer
                center={[report.latitude, report.longitude]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[report.latitude, report.longitude]}>
                  <Popup>
                    <strong>{report.name}</strong>
                    <br />
                    {report.description}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Image */}
          {report.image && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                Attached Image
              </h2>
              <img
                src={`http://localhost:8000${report.image}`}
                alt="Report"
                className="w-full rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportDetailPage;
```

---

### Feature 4: Profile Page

#### Implementation Code:

```javascript
// src/pages/users/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSave,
  FaKey,
} from "react-icons/fa";
import api from "../../api/api";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/me/");
      setUser(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await api.patch("/users/me/update/", formData);
      setUser(response.data);
      setEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-950 to-blue-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-white/70">Manage your account information</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-500/20 border border-green-500/50 text-green-300"
              : "bg-red-500/20 border border-red-500/50 text-red-300"
          }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FaUser className="text-white text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-white/70 mt-1">{user?.email}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-white/70">
              <span>Role:</span>
              <span className="text-white font-medium capitalize">
                {user?.role}
              </span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Member Since:</span>
              <span className="text-white font-medium">
                {new Date(user?.date_joined).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Last Login:</span>
              <span className="text-white font-medium">
                {new Date(user?.last_login).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                Personal Information
              </h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData(user);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2">
                    <FaSave /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  disabled
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white opacity-50 cursor-not-allowed"
                />
                <p className="text-white/50 text-xs mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Sex</label>
                <select
                  name="sex"
                  value={formData.sex || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-white/40">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FaMapMarkerAlt /> Address Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">
                  Purok
                </label>
                <input
                  type="text"
                  name="purok"
                  value={formData.purok || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">
                  Barangay
                </label>
                <input
                  type="text"
                  name="barangay"
                  value={formData.barangay || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">
                  Municipal
                </label>
                <input
                  type="text"
                  name="municipal"
                  value={formData.municipal || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-white/40"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">
                  Province
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white disabled:opacity-50 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
```

---

## API Requirements

### Backend Endpoints to Create/Verify

```python
# users/views.py

# Get current user profile
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get authenticated user's profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# Update user profile
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Allow users to update their own profile"""
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

# Change password
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not user.check_password(old_password):
        return Response({'error': 'Invalid old password'}, status=400)

    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password changed successfully'})

# Get user's reports
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_reports(request):
    """Get all reports by authenticated user"""
    reports = Report.objects.filter(user=request.user).order_by('-date_created')
    serializer = ReportSerializer(reports, many=True)
    return Response(serializer.data)

# Get single report (user's own only)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_report_detail(request, pk):
    """Get single report details (user's own only)"""
    try:
        report = Report.objects.get(pk=pk, user=request.user)
        serializer = ReportSerializer(report)
        return Response(serializer.data)
    except Report.DoesNotExist:
        return Response({'error': 'Report not found'}, status=404)

# Delete report (user's own, pending only)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_report(request, pk):
    """Delete user's own report (pending only)"""
    try:
        report = Report.objects.get(pk=pk, user=request.user)
        if report.status != 'Pending':
            return Response({'error': 'Can only delete pending reports'}, status=400)
        report.delete()
        return Response({'message': 'Report deleted successfully'})
    except Report.DoesNotExist:
        return Response({'error': 'Report not found'}, status=404)
```

### URL Configuration

```python
# users/urls.py
urlpatterns = [
    path('me/', get_current_user, name='current-user'),
    path('me/update/', update_profile, name='update-profile'),
    path('change-password/', change_password, name='change-password'),
]

# reports/urls.py
urlpatterns = [
    path('my-reports/', get_my_reports, name='my-reports'),
    path('<int:pk>/', get_report_detail, name='report-detail'),
    path('<int:pk>/delete/', delete_report, name='delete-report'),
]
```

---

## Component Architecture

### Folder Structure

```
src/
├── pages/
│   ├── users/
│   │   ├── UserDashboard.jsx         ✅ TO CREATE
│   │   ├── MyReportsPage.jsx         ✅ TO CREATE
│   │   ├── ReportDetailPage.jsx      ✅ TO CREATE
│   │   ├── ProfilePage.jsx           ✅ TO CREATE
│   │   ├── ReportPage.jsx            ✅ EXISTING
│   │   └── NotificationsPage.jsx     ✅ EXISTING
│   └── auth/
│       ├── Login.jsx                 ✅ EXISTING
│       └── Register.jsx              ✅ EXISTING
├── components/
│   ├── dashboard/
│   │   ├── StatCard.jsx              ✅ TO CREATE
│   │   ├── WeatherWidget.jsx         ✅ TO CREATE
│   │   └── QuickActions.jsx          ✅ TO CREATE
│   ├── reports/
│   │   ├── ReportCard.jsx            ✅ TO CREATE
│   │   └── ReportFilters.jsx         ✅ TO CREATE
│   └── common/
│       ├── LoadingSpinner.jsx        ✅ TO CREATE
│       └── EmptyState.jsx            ✅ TO CREATE
├── api/
│   ├── api.js                        ✅ EXISTING
│   ├── auth.js                       ✅ EXISTING
│   ├── reports.js                    ⚠️ TO ENHANCE
│   └── users.js                      ⚠️ TO ENHANCE
└── App.jsx                           ⚠️ TO UPDATE (add new routes)
```

---

## Development Checklist

### Phase 1: Critical Features (Week 1-2)

#### Day 1-2: User Dashboard

- [ ] Create `UserDashboard.jsx` component
- [ ] Implement welcome section with user info
- [ ] Add 3 stat cards (weather, reports, notifications)
- [ ] Create weather widget component
- [ ] Add quick actions section (4 buttons)
- [ ] Implement recent reports list
- [ ] Add loading states
- [ ] Test responsiveness

#### Day 3-4: My Reports Page

- [ ] Create `MyReportsPage.jsx` component
- [ ] Implement report list view
- [ ] Add search functionality
- [ ] Add status filters (All, Pending, In Progress, Resolved)
- [ ] Implement delete functionality (pending only)
- [ ] Add empty state
- [ ] Add loading skeleton
- [ ] Test all filters

#### Day 5-6: Report Detail Page

- [ ] Create `ReportDetailPage.jsx` component
- [ ] Display full report information
- [ ] Add location map with marker
- [ ] Show uploaded image (if exists)
- [ ] Implement status timeline
- [ ] Add delete button (pending only)
- [ ] Add back navigation
- [ ] Test with different report statuses

#### Day 7: Backend API

- [ ] Create `/api/users/me/` endpoint
- [ ] Create `/api/users/me/update/` endpoint
- [ ] Create `/api/reports/my-reports/` endpoint
- [ ] Create `/api/reports/{id}/` endpoint (user-only)
- [ ] Create `/api/reports/{id}/delete/` endpoint
- [ ] Test all endpoints with Postman
- [ ] Add proper permissions

### Phase 2: High Priority Features (Week 3-4)

#### Day 8-10: Profile Management

- [ ] Create `ProfilePage.jsx` component
- [ ] Implement view mode
- [ ] Implement edit mode
- [ ] Add form validation
- [ ] Implement save functionality
- [ ] Add change password section
- [ ] Test profile updates
- [ ] Add success/error messages

#### Day 11-13: Weather Display

- [ ] Enhance weather widget on dashboard
- [ ] Create dedicated weather page
- [ ] Add 3-day forecast display
- [ ] Implement location selector
- [ ] Add weather icons
- [ ] Show detailed weather info
- [ ] Test with different locations

#### Day 14: Testing & Polish

- [ ] Test all user flows
- [ ] Fix bugs
- [ ] Improve UI/UX
- [ ] Add loading states everywhere
- [ ] Optimize performance
- [ ] Update routing in App.jsx

### App.jsx Routes to Add

```javascript
// Add these routes to App.jsx

// User Dashboard
<Route path="/user" element={<RequireAuth><UserDashboard /></RequireAuth>} />

// My Reports
<Route path="/user/my-reports" element={<RequireAuth><MyReportsPage /></RequireAuth>} />

// Report Detail
<Route path="/user/reports/:id" element={<RequireAuth><ReportDetailPage /></RequireAuth>} />

// Profile
<Route path="/user/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
```

---

## Quick Start Guide

### Step 1: Set Up Backend Endpoints

```bash
cd backend

# Update users/views.py with new endpoints
# Update reports/views.py with new endpoints
# Update urls.py with new routes

# Run migrations if needed
python manage.py makemigrations
python manage.py migrate

# Start backend
python manage.py runserver
```

### Step 2: Create Frontend Components

```bash
cd frontend

# Install dependencies (if not already)
npm install

# Create new files
# Start with UserDashboard.jsx
# Then MyReportsPage.jsx
# Then ReportDetailPage.jsx
# Finally ProfilePage.jsx

# Run frontend
npm run dev
```

### Step 3: Test Each Feature

1. **Test User Dashboard:**

   - Navigate to `/user`
   - Verify all stats display correctly
   - Click all quick action buttons
   - Check recent reports list

2. **Test My Reports:**

   - Navigate to `/user/my-reports`
   - Try search functionality
   - Test status filters
   - Try deleting a pending report

3. **Test Report Detail:**

   - Click on a report from My Reports
   - Verify all information displays
   - Check map shows correct location
   - Test delete button (if pending)

4. **Test Profile:**
   - Navigate to `/user/profile`
   - Click edit
   - Update information
   - Save changes
   - Verify updates persist

---

## Common Issues & Solutions

### Issue 1: 404 on API Endpoints

**Solution:** Make sure backend URLs are registered in `core/urls.py`

### Issue 2: Authentication Errors

**Solution:** Check JWT token is being sent in request headers

### Issue 3: CORS Errors

**Solution:** Verify `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`

### Issue 4: Map Not Displaying

**Solution:** Import Leaflet CSS: `import 'leaflet/dist/leaflet.css'`

### Issue 5: Images Not Loading

**Solution:** Use full URL: `http://localhost:8000${report.image}`

---

## Next Steps After Phase 1-2

1. **Real-time Notifications**

   - Implement WebSocket or polling
   - Add notification badge counter
   - Toast notifications

2. **Advanced Features**

   - Report editing
   - Report templates
   - Favorite locations
   - Weather alerts

3. **Mobile Optimization**

   - Responsive design improvements
   - Touch-friendly interfaces
   - Mobile navigation menu

4. **Performance**
   - Add caching
   - Optimize images
   - Lazy loading
   - Code splitting

---

## Resources

- **React Documentation:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Leaflet Maps:** https://leafletjs.com
- **Django REST Framework:** https://www.django-rest-framework.org
- **Axios:** https://axios-http.com

---

## Support

If you encounter issues:

1. Check browser console for errors (F12)
2. Check Django terminal for backend errors
3. Verify API endpoints in Postman
4. Review [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)
5. Check [USER_SIDE_ANALYSIS.md](USER_SIDE_ANALYSIS.md)

---

**Document Version:** 2.0
**Last Updated:** 2025-11-12
**Status:** Ready for Development
**Estimated Timeline:** 4-6 weeks for complete implementation

---

## Summary

This roadmap provides everything you need to start developing the user side:

✅ **Clear Priorities** - Know what to build first
✅ **Complete Code** - Copy-paste ready implementations
✅ **API Specifications** - Exact endpoints needed
✅ **Step-by-Step Plan** - Day-by-day development guide
✅ **Testing Checklist** - Verify everything works

**Start with Phase 1 (Week 1-2):** UserDashboard → MyReports → ReportDetail

Good luck with development! 🚀
