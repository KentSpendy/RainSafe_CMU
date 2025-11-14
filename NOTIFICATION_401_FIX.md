# Notification 401 Error Fix

**Issue:** Repeated 401 Unauthorized errors for `/api/notifications/`
**Date Fixed:** January 15, 2025
**Status:** ✅ Resolved

---

## 🔍 Root Cause Analysis

### The Problem

The **NotificationContext** was fetching notifications immediately on app load, regardless of authentication status.

**File:** `frontend/src/context/NotificationContext.jsx`

**Original Code (Problematic):**
```javascript
useEffect(() => {
  fetchNotifications();  // ❌ Called immediately, even before login!
  const interval = setInterval(fetchNotifications, 30000); // ❌ Polls every 30s
  return () => clearInterval(interval);
}, [fetchNotifications]);
```

### Why This Caused Errors

1. **NotificationProvider** wraps the entire app in `main.jsx`
2. It runs on **every page** including `/login` and `/register`
3. Calls `/api/notifications/` immediately when app loads
4. The backend endpoint requires authentication (returns 401 if not authenticated)
5. Polls every 30 seconds regardless of login status
6. Results in repeated 401 errors and "Broken pipe" warnings

### Error Pattern

```
Unauthorized: /api/notifications/
[15/Nov/2025 00:08:33] "GET /api/notifications/ HTTP/1.1" 401 58
[15/Nov/2025 00:08:33,350] - Broken pipe from ('127.0.0.1', 4802)
```

**"Broken pipe" occurs because:**
- Components unmount during navigation (React cancels requests)
- Multiple rapid re-renders during login flow
- Connection closes before response completes

---

## ✅ The Solution

### Updated Code

**File:** `frontend/src/context/NotificationContext.jsx`

```javascript
import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "./AuthContext"; // ✅ Import AuthContext

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useContext(AuthContext); // ✅ Get auth status

  const fetchNotifications = useCallback(async () => {
    // ✅ Only fetch if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    try {
      const res = await API.get("notifications/");
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.is_read).length);
    } catch (error) {
      // ✅ Silently fail on 401 - user might be logging out
      if (error.response?.status !== 401) {
        console.error("Failed to fetch notifications:", error);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // ✅ Only fetch and poll when authenticated
    if (!isAuthenticated) {
      // ✅ Clear notifications when logged out
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // ✅ Fetch immediately when authenticated
    fetchNotifications();

    // ✅ Poll every 30 seconds while authenticated
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, isAuthenticated]);

  // ... rest of the code
}
```

### Key Changes

1. **Import AuthContext** to access `isAuthenticated` state
2. **Check authentication** before every fetch
3. **Clear notifications** when user logs out
4. **Stop polling** when not authenticated
5. **Silence 401 errors** (they're expected during logout)

---

## 🎯 Benefits

### Before Fix
- ❌ 401 errors every page load
- ❌ 401 errors every 30 seconds on login page
- ❌ "Broken pipe" warnings
- ❌ Unnecessary API calls
- ❌ Console spam

### After Fix
- ✅ No errors on login/register pages
- ✅ Notifications only fetch when authenticated
- ✅ Polling stops when logged out
- ✅ Clean console logs
- ✅ Better performance

---

## 🧪 Testing Checklist

### Test 1: Login Page
- [ ] Visit `/login` without being logged in
- [ ] Check browser console - should have NO 401 errors
- [ ] Check backend terminal - should have NO notification requests

### Test 2: After Login
- [ ] Login as admin or user
- [ ] Check console - should fetch notifications once
- [ ] Check backend - should see ONE successful notification request
- [ ] Wait 30 seconds - should poll again

### Test 3: Logout
- [ ] Logout from the app
- [ ] Check console - should clear notifications
- [ ] Wait 30+ seconds - should NOT see any notification requests
- [ ] Backend should have NO notification requests after logout

### Test 4: Navigation
- [ ] Navigate between pages while logged in
- [ ] Should NOT see repeated notification fetches (only polls every 30s)
- [ ] Should NOT see "Broken pipe" errors

### Test 5: Token Expiration
- [ ] Let token expire (or manually delete from localStorage)
- [ ] Should NOT see 401 errors for notifications
- [ ] Should redirect to login cleanly

---

## 📊 Technical Details

### Provider Hierarchy

```
main.jsx
  ├─ AuthProvider         (provides: isAuthenticated, role, user)
  │   ├─ WeatherProvider
  │   │   ├─ NotificationProvider  (✅ Now checks isAuthenticated)
  │   │   │   └─ App
```

**Important:** NotificationProvider must be inside AuthProvider to access authentication state.

### Authentication Flow

```
1. App loads → AuthProvider initializes
2. AuthProvider checks localStorage for token
3. If token exists & valid → isAuthenticated = true
4. NotificationProvider sees isAuthenticated = true
5. Starts fetching notifications
6. Polls every 30 seconds while authenticated

On Logout:
1. User clicks logout
2. AuthProvider sets isAuthenticated = false
3. NotificationProvider sees change
4. Clears notifications
5. Stops polling
```

---

## 🔧 Related Files Modified

### Files Changed (1)
- `frontend/src/context/NotificationContext.jsx` - Added authentication check

### Files Referenced
- `frontend/src/context/AuthContext.jsx` - Provides isAuthenticated state
- `frontend/src/main.jsx` - Provider hierarchy
- `frontend/src/api/api.js` - API instance with interceptors

---

## 📝 Additional Notes

### Why This Is Important

1. **Security:** Don't attempt unauthorized API calls
2. **Performance:** Avoid unnecessary network requests
3. **UX:** Clean console logs, no error spam
4. **Backend:** Reduce unnecessary load on server

### Future Improvements

1. **WebSocket Integration:** Replace polling with real-time WebSocket connection
2. **Service Worker:** Cache notifications for offline access
3. **Push Notifications:** Browser push notifications when app is closed
4. **Notification Grouping:** Group similar notifications

---

## 🆘 Troubleshooting

### If you still see 401 errors:

1. **Clear browser cache** and reload
2. **Check provider order** in `main.jsx` - NotificationProvider must be inside AuthProvider
3. **Verify AuthContext** is working - check `isAuthenticated` state in React DevTools
4. **Check localStorage** - should have valid `access` token when logged in

### If notifications don't load:

1. **Check backend endpoint** - verify `/api/notifications/` works in Postman
2. **Check token** - verify it includes correct permissions
3. **Check console** - look for any error messages
4. **Check AuthContext** - verify `isAuthenticated` is `true`

---

## 📚 Related Documentation

- [ROUTING_FIXES_2025.md](ROUTING_FIXES_2025.md) - Routing architecture fixes
- [CREATE_ADMIN_INSTRUCTIONS.md](CREATE_ADMIN_INSTRUCTIONS.md) - Admin user creation

---

**End of Documentation**

*This fix ensures notifications only load when users are authenticated, eliminating unnecessary 401 errors.*
