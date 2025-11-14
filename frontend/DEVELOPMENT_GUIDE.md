# RainSafe CMU - Frontend Development Guide

## Complete Step-by-Step Guide: React to Django Integration

This guide will walk you through creating user features in React and connecting them to your Django backend, following the current project architecture.

---

## Table of Contents

1. [Project Architecture Overview](#project-architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Understanding the Current Flow](#understanding-the-current-flow)
4. [Step-by-Step: Creating a New Feature](#step-by-step-creating-a-new-feature)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Integration Pattern](#api-integration-pattern)
7. [Common Patterns & Best Practices](#common-patterns--best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Project Architecture Overview

```
User Interaction (React)
    ↓
API Call (Axios with JWT)
    ↓
Django REST API
    ↓
Database (SQLite/PostgreSQL)
    ↓
Response back to React
    ↓
Update UI
```

### Current Project Structure

```
frontend/
├── src/
│   ├── api/              # API integration layer
│   ├── pages/            # Page components
│   ├── components/       # Reusable components
│   ├── context/          # Global state management
│   └── App.jsx           # Main routing
```

---

## Prerequisites

### 1. Install Missing Dependencies

First, make sure all dependencies are installed:

```bash
cd frontend
npm install
```

If there are missing packages, install them specifically:

```bash
npm install dayjs framer-motion jwt-decode tailwind-scrollbar-hide
```

### 2. Verify Backend is Running

```bash
cd backend
python manage.py runserver
```

Backend should be accessible at: `http://localhost:8000`

### 3. Verify Frontend Configuration

Check `frontend/src/api/api.js` has the correct base URL:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

---

## Understanding the Current Flow

### Flow 1: User Login & Authentication

**Step 1: User enters credentials**
```
Login.jsx (User enters email/password)
```

**Step 2: API call to Django**
```javascript
// frontend/src/api/auth.js
import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/users/login/', { email, password });
  return response.data;
};
```

**Step 3: Django processes and returns JWT**
```python
# backend/users/views.py
@api_view(['POST'])
def login_view(request):
    # Validates credentials
    # Returns: { access, refresh, email, role }
```

**Step 4: Store JWT in localStorage**
```javascript
// Login.jsx
const data = await login(email, password);
localStorage.setItem('access_token', data.access);
localStorage.setItem('refresh_token', data.refresh);
localStorage.setItem('role', data.role);
```

**Step 5: Redirect based on role**
```javascript
if (data.role === 'admin') {
  navigate('/admin/dashboard');
} else {
  navigate('/user/dashboard');
}
```

### Flow 2: Protected API Call

**Step 1: User requests data**
```
UserDashboard.jsx (Component mounts)
```

**Step 2: API call with JWT automatically attached**
```javascript
// frontend/src/api/api.js (Axios interceptor)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Step 3: Django verifies JWT**
```python
# Django REST Framework automatically validates JWT
# If valid: processes request
# If invalid: returns 401 Unauthorized
```

**Step 4: Return data to React**
```javascript
const response = await api.get('/weather/stations/');
setStations(response.data);
```

---

## Step-by-Step: Creating a New Feature

Let's create a complete feature: **"Weather Alerts Management"**

### Backend Setup (Django)

#### Step 1: Create Django App

```bash
cd backend
python manage.py startapp alerts
```

#### Step 2: Create Model

```python
# backend/alerts/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class WeatherAlert(models.Model):
    SEVERITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    location = models.CharField(max_length=200)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} - {self.severity}"
```

#### Step 3: Create Serializer

```python
# backend/alerts/serializers.py
from rest_framework import serializers
from .models import WeatherAlert

class WeatherAlertSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)

    class Meta:
        model = WeatherAlert
        fields = ['id', 'title', 'description', 'severity', 'location',
                  'created_by', 'created_by_email', 'created_at', 'is_active']
        read_only_fields = ['created_by', 'created_at']
```

#### Step 4: Create Views

```python
# backend/alerts/views.py
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import WeatherAlert
from .serializers import WeatherAlertSerializer

class WeatherAlertViewSet(viewsets.ModelViewSet):
    queryset = WeatherAlert.objects.all().order_by('-created_at')
    serializer_class = WeatherAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter active alerts only for regular users
        if self.request.user.role == 'user':
            return WeatherAlert.objects.filter(is_active=True).order_by('-created_at')
        return super().get_queryset()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        """Toggle alert active status (admin only)"""
        alert = self.get_object()
        alert.is_active = not alert.is_active
        alert.save()
        return Response({'is_active': alert.is_active})
```

#### Step 5: Create URLs

```python
# backend/alerts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeatherAlertViewSet

router = DefaultRouter()
router.register(r'', WeatherAlertViewSet, basename='alert')

urlpatterns = [
    path('', include(router.urls)),
]
```

#### Step 6: Register App

```python
# backend/core/settings.py
INSTALLED_APPS = [
    # ... existing apps
    'alerts',  # ← Add this
]
```

```python
# backend/core/urls.py
urlpatterns = [
    # ... existing paths
    path('api/alerts/', include('alerts.urls')),  # ← Add this
]
```

#### Step 7: Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Frontend Setup (React)

#### Step 1: Create API Service

```javascript
// frontend/src/api/alerts.js
import api from './api';

// Fetch all alerts
export const fetchAlerts = async () => {
  const response = await api.get('/alerts/');
  return response.data;
};

// Fetch single alert
export const fetchAlertById = async (id) => {
  const response = await api.get(`/alerts/${id}/`);
  return response.data;
};

// Create new alert
export const createAlert = async (alertData) => {
  const response = await api.post('/alerts/', alertData);
  return response.data;
};

// Update alert
export const updateAlert = async (id, alertData) => {
  const response = await api.put(`/alerts/${id}/`, alertData);
  return response.data;
};

// Delete alert
export const deleteAlert = async (id) => {
  const response = await api.delete(`/alerts/${id}/`);
  return response.data;
};

// Toggle alert active status
export const toggleAlertActive = async (id) => {
  const response = await api.patch(`/alerts/${id}/toggle_active/`);
  return response.data;
};
```

#### Step 2: Create Alert List Component

```javascript
// frontend/src/pages/users/AlertsPage.jsx
import React, { useState, useEffect } from 'react';
import { fetchAlerts } from '../../api/alerts';
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch alerts when component mounts
  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await fetchAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load alerts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Severity color mapping
  const getSeverityColor = (severity) => {
    const colors = {
      Low: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      High: 'bg-orange-100 text-orange-800',
      Critical: 'bg-red-100 text-red-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FaExclamationTriangle className="mr-3 text-yellow-500" />
        Weather Alerts
      </h1>

      {alerts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaInfoCircle className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-gray-600">No active alerts at this time</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold">{alert.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>

              <p className="text-gray-700 mb-3">{alert.description}</p>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>📍 {alert.location}</span>
                <span>🕐 {new Date(alert.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
```

#### Step 3: Create Alert Form Component

```javascript
// frontend/src/pages/admin/CreateAlertPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAlert } from '../../api/alerts';
import { FaBell } from 'react-icons/fa';

const CreateAlertPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Low',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await createAlert(formData);

      // Success! Navigate back to alerts list
      navigate('/admin/alerts');

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create alert');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FaBell className="mr-3 text-blue-500" />
        Create Weather Alert
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Title */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Alert Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Heavy Rainfall Warning"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide detailed information about the alert..."
          />
        </div>

        {/* Severity */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Severity *
          </label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., CMU Campus, Musuan, Bukidnon"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition"
          >
            {loading ? 'Creating...' : 'Create Alert'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/alerts')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAlertPage;
```

#### Step 4: Add Routes

```javascript
// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/auth/Unauthorized';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';

// Import new alert pages
import AlertsPage from './pages/users/AlertsPage';
import CreateAlertPage from './pages/admin/CreateAlertPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* User routes */}
        <Route element={<RequireAuth />}>
          <Route path="/user/alerts" element={<AlertsPage />} />
        </Route>

        {/* Admin routes */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin/alerts" element={<AlertsPage />} />
          <Route path="/admin/alerts/create" element={<CreateAlertPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
```

---

## Authentication & Authorization

### How JWT Authentication Works

#### 1. Login Process

```javascript
// User logs in
const response = await api.post('/users/login/', { email, password });

// Response contains:
{
  "access": "eyJ0eXAiOiJKV1Q...",  // Short-lived token (15 min)
  "refresh": "eyJ0eXAiOiJKV1Q...", // Long-lived token (24 hours)
  "email": "user@example.com",
  "role": "user"
}

// Store tokens
localStorage.setItem('access_token', response.data.access);
localStorage.setItem('refresh_token', response.data.refresh);
localStorage.setItem('role', response.data.role);
```

#### 2. Automatic Token Injection

```javascript
// frontend/src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Request interceptor - automatically adds token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired, refresh it
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          'http://localhost:8000/api/users/token/refresh/',
          { refresh: refreshToken }
        );

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.clear();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

#### 3. Protected Routes

```javascript
// frontend/src/components/RequireAuth.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const RequireAuth = () => {
  const token = localStorage.getItem('access_token');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If token exists, render child routes
  return <Outlet />;
};

export default RequireAuth;
```

```javascript
// frontend/src/components/RequireAdmin.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const RequireAdmin = () => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If not admin, redirect to unauthorized
  if (role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // If admin, render child routes
  return <Outlet />;
};

export default RequireAdmin;
```

---

## API Integration Pattern

### Pattern 1: Simple GET Request

```javascript
// Component
import React, { useState, useEffect } from 'react';
import { fetchStations } from '../../api/stations';

const StationsPage = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const data = await fetchStations();
      setStations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {stations.map(station => (
        <div key={station.id}>{station.name}</div>
      ))}
    </div>
  );
};
```

### Pattern 2: POST Request with Form

```javascript
const CreateStation = () => {
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const newStation = await createStation(formData);
      console.log('Created:', newStation);
      // Redirect or update UI
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <button type="submit">Create</button>
    </form>
  );
};
```

### Pattern 3: DELETE with Confirmation

```javascript
const DeleteStation = ({ stationId, onDelete }) => {
  const handleDelete = async () => {
    // Confirm before deleting
    if (!window.confirm('Are you sure you want to delete this station?')) {
      return;
    }

    try {
      await deleteStation(stationId);
      onDelete(stationId); // Update parent component
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <button onClick={handleDelete} className="text-red-500">
      Delete
    </button>
  );
};
```

### Pattern 4: File Upload (Images)

```javascript
// API Service
export const uploadReport = async (reportData) => {
  const formData = new FormData();
  formData.append('name', reportData.name);
  formData.append('description', reportData.description);
  formData.append('image', reportData.image); // File object

  const response = await api.post('/reports/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Component
const ReportForm = () => {
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const reportData = {
      name: 'Report name',
      description: 'Description',
      image: image,
    };

    await uploadReport(reportData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleImageChange} accept="image/*" />
      <button type="submit">Upload</button>
    </form>
  );
};
```

---

## Common Patterns & Best Practices

### 1. Loading States

Always show loading indicators:

```javascript
{loading && (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
)}
```

### 2. Error Handling

Display user-friendly error messages:

```javascript
{error && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    <p className="font-bold">Error</p>
    <p>{error}</p>
  </div>
)}
```

### 3. Empty States

Handle cases when there's no data:

```javascript
{!loading && data.length === 0 && (
  <div className="text-center py-12 text-gray-500">
    <p className="text-xl">No data available</p>
    <button className="mt-4 bg-blue-500 text-white px-6 py-2 rounded">
      Add New Item
    </button>
  </div>
)}
```

### 4. Form Validation

Validate before submitting:

```javascript
const validateForm = () => {
  if (!formData.title.trim()) {
    setError('Title is required');
    return false;
  }
  if (formData.description.length < 10) {
    setError('Description must be at least 10 characters');
    return false;
  }
  return true;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  // Proceed with submission
};
```

### 5. Debouncing Search

Prevent excessive API calls:

```javascript
import { useState, useEffect } from 'react';

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Debounce search - wait 500ms after user stops typing
    const delayTimer = setTimeout(() => {
      if (searchTerm) {
        searchAPI(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayTimer);
  }, [searchTerm]);

  const searchAPI = async (term) => {
    const data = await api.get(`/search/?q=${term}`);
    setResults(data);
  };

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
};
```

### 6. Pagination

Handle large datasets:

```javascript
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const loadData = async (pageNumber) => {
  const response = await api.get(`/items/?page=${pageNumber}`);
  setData(response.data.results);
  setTotalPages(Math.ceil(response.data.count / 10));
};

return (
  <div>
    {/* Data display */}

    <div className="flex gap-2 mt-4">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>

      <span>Page {page} of {totalPages}</span>

      <button
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  </div>
);
```

---

## Troubleshooting

### Issue 1: CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**

1. Check Django settings:
```python
# backend/core/settings.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
]
```

2. Make sure `corsheaders` is in INSTALLED_APPS and MIDDLEWARE

### Issue 2: 401 Unauthorized

**Error:** `Request failed with status code 401`

**Causes:**
- Token expired
- Token not being sent
- Invalid token

**Solution:**

1. Check if token exists:
```javascript
const token = localStorage.getItem('access_token');
console.log('Token:', token);
```

2. Check if token is being sent in headers:
```javascript
// In api.js, add logging
api.interceptors.request.use((config) => {
  console.log('Request headers:', config.headers);
  return config;
});
```

3. Verify Django authentication:
```python
# backend view
print(request.user)  # Should print user email, not AnonymousUser
```

### Issue 3: Network Error

**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Causes:**
- Django server not running
- Wrong API URL

**Solution:**

1. Check Django server:
```bash
python manage.py runserver
```

2. Verify API URL:
```javascript
// frontend/src/api/api.js
const API_BASE_URL = 'http://localhost:8000/api';  // Correct?
```

### Issue 4: Form Data Not Submitting

**Causes:**
- Missing CSRF token (should be handled by JWT)
- Wrong content type
- Field validation errors

**Solution:**

1. Check Django error response:
```javascript
try {
  await createItem(data);
} catch (err) {
  console.log('Error response:', err.response?.data);
}
```

2. Ensure correct content type:
```javascript
// For JSON
api.post('/items/', data);  // Default is JSON

// For FormData (file uploads)
api.post('/items/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Issue 5: State Not Updating

**Cause:** Mutating state directly

**Wrong:**
```javascript
const handleAdd = () => {
  items.push(newItem);  // ❌ Wrong
  setItems(items);
};
```

**Correct:**
```javascript
const handleAdd = () => {
  setItems([...items, newItem]);  // ✅ Correct
};
```

---

## Complete Example: Feature Checklist

When creating a new feature, follow this checklist:

### Backend (Django)
- [ ] Create Django app (`python manage.py startapp appname`)
- [ ] Define model in `models.py`
- [ ] Create serializer in `serializers.py`
- [ ] Create views in `views.py`
- [ ] Define URLs in `urls.py`
- [ ] Add app to `INSTALLED_APPS`
- [ ] Add URLs to main `urls.py`
- [ ] Run migrations (`makemigrations` + `migrate`)
- [ ] Test endpoints with Postman/Thunder Client

### Frontend (React)
- [ ] Create API service file in `src/api/`
- [ ] Create page component in `src/pages/`
- [ ] Implement data fetching with `useEffect`
- [ ] Handle loading, error, and empty states
- [ ] Add form with proper validation
- [ ] Implement CRUD operations
- [ ] Add routes in `App.jsx`
- [ ] Protect routes if needed (RequireAuth/RequireAdmin)
- [ ] Test user flow end-to-end

---

## Quick Reference

### Common API Endpoints

```javascript
// Authentication
POST /api/users/login/          // Login
POST /api/users/register/       // Register
POST /api/users/token/refresh/  // Refresh token

// Weather
GET  /api/weather/stations/     // List stations
POST /api/weather/stations/     // Create station
GET  /api/weather/forecast/     // Get forecast

// Reports
GET  /api/reports/              // List reports
POST /api/reports/              // Create report
PATCH /api/reports/:id/update_status/  // Update status

// Notifications
GET  /api/notifications/        // List notifications
PATCH /api/notifications/:id/mark_as_read/  // Mark as read
```

### localStorage Keys

```javascript
localStorage.getItem('access_token')   // JWT access token
localStorage.getItem('refresh_token')  // JWT refresh token
localStorage.getItem('role')           // User role (admin/user)
localStorage.getItem('email')          // User email
```

### Common React Hooks

```javascript
// State
const [data, setData] = useState([]);

// Side effects (API calls)
useEffect(() => {
  fetchData();
}, []); // Empty array = run once on mount

// Navigation
const navigate = useNavigate();
navigate('/dashboard');

// URL parameters
const { id } = useParams();
```

---

## Additional Resources

- **React Documentation:** https://react.dev
- **Django REST Framework:** https://www.django-rest-framework.org
- **Axios Documentation:** https://axios-http.com
- **React Router:** https://reactrouter.com
- **Tailwind CSS:** https://tailwindcss.com

---

## Need Help?

If you get stuck:

1. Check browser console for errors (F12)
2. Check Django terminal for backend errors
3. Use `console.log()` to debug state and API responses
4. Test API endpoints directly in Postman/Thunder Client
5. Review similar existing features in the codebase

---

**Last Updated:** 2025-10-31

**Author:** RainSafe CMU Development Team


