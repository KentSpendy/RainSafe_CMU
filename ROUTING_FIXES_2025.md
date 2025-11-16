# RainSafe Routing Architecture Fixes - 2025

**Date:** January 14, 2025
**Project:** RainSafe CMU
**Scope:** Frontend Routing & Authentication
**Status:** ✅ Completed

---

## 📋 Executive Summary

This document details the comprehensive routing architecture overhaul performed on the RainSafe application. The primary focus was on fixing critical routing issues, standardizing route patterns, improving authentication flow, and cleaning up unused code.

### Key Achievements
- ✅ Fixed catch-all route causing authenticated user logouts
- ✅ Standardized all admin routes to `/admin/*` pattern
- ✅ Implemented proactive token refresh mechanism
- ✅ Created smart redirect system based on user roles
- ✅ Moved shared components to appropriate directories
- ✅ Removed 5 unused/duplicate files
- ✅ Maintained backward compatibility with legacy routes

---

## 🚨 Critical Issues Identified

### Issue #1: Catch-All Route Logs Out Authenticated Users (HIGH PRIORITY)
**Location:** [App.jsx:117](frontend/src/App.jsx#L117)

**Problem:**
```jsx
<Route path="*" element={<Navigate to="/login" replace />} />
```
When authenticated users visited invalid routes, they were redirected to `/login`, effectively logging them out and losing their session state.

**Impact:**
- Poor user experience
- Loss of session on typos or bookmarks
- Frustrated admin users

**Solution Implemented:**
Created `SmartRedirect` component that checks authentication status and role:
- Not authenticated → `/login`
- Admin user → `/admin/dashboard`
- Regular user → `/user`

**Files Modified:**
- Created: [frontend/src/components/SmartRedirect.jsx](frontend/src/components/SmartRedirect.jsx)
- Modified: [frontend/src/App.jsx](frontend/src/App.jsx)

---

### Issue #2: Inconsistent Admin Route Naming (MEDIUM PRIORITY)

**Problem:**
Admin routes followed inconsistent patterns:
```
❌ /dashboard         (no prefix)
❌ /admin/reports     (has prefix)
❌ /stations          (no prefix)

✓ /user               (user routes consistent)
✓ /user/my-reports    (user routes consistent)
```

**Impact:**
- Confusing route structure
- Difficult to maintain
- Poor developer experience
- Unclear admin/user separation

**Solution Implemented:**
Standardized all admin routes to `/admin/*` pattern with legacy redirects:

**New Admin Routes:**
```
✓ /admin/dashboard    → Dashboard.jsx
✓ /admin/reports      → ReportDashboard.jsx (unchanged)
✓ /admin/stations     → Stations.jsx
```

**Legacy Route Support (Backward Compatibility):**
```jsx
<Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
<Route path="/stations" element={<Navigate to="/admin/stations" replace />} />
```

**Files Modified:**
- [frontend/src/App.jsx](frontend/src/App.jsx) - Updated all admin routes
- [frontend/src/pages/auth/Login.jsx](frontend/src/pages/auth/Login.jsx) - Updated redirect to `/admin/dashboard`

---

### Issue #3: No Token Refresh Mechanism in RequireAuth (HIGH PRIORITY)

**Problem:**
The `RequireAuth` component checked token expiration but didn't attempt to refresh:
```jsx
if (decoded.exp < currentTime) {
  localStorage.removeItem("access");
  return <Navigate to="/login" replace />;
}
```

**Impact:**
- Silent logouts during active use
- Poor user experience
- Unnecessary re-authentication
- Lost work/progress

**Solution Implemented:**
Enhanced `RequireAuth` component with proactive token refresh:

**Key Features:**
1. **Proactive Refresh**: Refreshes tokens that expire within 5 minutes (300 seconds)
2. **Graceful Fallback**: Only redirects to login if refresh fails
3. **Loading State**: Shows loading spinner during authentication check
4. **Role Validation**: Maintains existing role-based access control

**Technical Implementation:**
```jsx
const timeUntilExpiry = decoded.exp - currentTime;

// If token expires in < 5 minutes, refresh it
if (timeUntilExpiry < 300) {
  const response = await axios.post(
    "http://127.0.0.1:8000/api/users/token/refresh/",
    { refresh: refreshToken }
  );
  localStorage.setItem("access", response.data.access);
}
```

**Files Modified:**
- [frontend/src/components/RequireAuth.jsx](frontend/src/components/RequireAuth.jsx) - Complete rewrite with async checking

**Additional Note:**
The API layer ([frontend/src/api/api.js](frontend/src/api/api.js)) already has token refresh interceptors for 401 errors. The RequireAuth enhancement provides an additional layer by preventing expired token access attempts proactively.

---

### Issue #4: ForecastPage Location Ambiguity (MEDIUM PRIORITY)

**Problem:**
`ForecastPage.jsx` was located in `admin/` folder but was accessible to all authenticated users:
```
Location: frontend/src/pages/admin/ForecastPage.jsx
Route: /forecast (accessible to all authenticated users)
```

**Impact:**
- Confusing code organization
- Misleading folder structure
- Maintenance confusion

**Solution Implemented:**
Moved `ForecastPage` to new `shared/` directory:

**Before:**
```
frontend/src/pages/admin/ForecastPage.jsx
```

**After:**
```
frontend/src/pages/shared/ForecastPage.jsx
```

**Files Modified:**
- Moved: [frontend/src/pages/shared/ForecastPage.jsx](frontend/src/pages/shared/ForecastPage.jsx)
- Updated import: [frontend/src/App.jsx](frontend/src/App.jsx)

---

### Issue #5: Unused/Dead Code (MEDIUM PRIORITY)

**Problem:**
Multiple page components existed but were never routed or used:

**Unused Files Identified:**
1. `frontend/src/pages/admin/HistoryPage.jsx` - Not routed
2. `frontend/src/pages/admin/LangdingPage.jsx` - Typo in name, not routed
3. `frontend/src/pages/admin/Weather.jsx` - Not routed
4. `frontend/src/pages/users/NotificationsPage.jsx` - Duplicate (real one at `pages/NotificationsPage.jsx`)
5. `frontend/src/components/RequireAdmin.jsx` - Unused component (RequireAuth used instead)

**Impact:**
- Code bloat
- Maintenance confusion
- Potential security concerns (unmaintained code)
- Developer confusion

**Solution Implemented:**
Removed all 5 unused files using `git rm`:

**Files Removed:**
```bash
✓ frontend/src/pages/admin/HistoryPage.jsx
✓ frontend/src/pages/admin/LangdingPage.jsx
✓ frontend/src/pages/admin/Weather.jsx
✓ frontend/src/pages/users/NotificationsPage.jsx
✓ frontend/src/components/RequireAdmin.jsx
```

---

## 📊 Complete Route Architecture

### Admin Routes (Protected - Role: "admin")
```
✓ /admin/dashboard    → admin/Dashboard.jsx
✓ /admin/reports      → admin/ReportDashboard.jsx
✓ /admin/stations     → admin/Stations.jsx
```

**Legacy Redirects (Backward Compatibility):**
```
→ /dashboard          → Redirects to /admin/dashboard
→ /stations           → Redirects to /admin/stations
```

### User Routes (Protected - Authenticated)
```
✓ /user               → users/UserDashboard.jsx
✓ /report             → users/ReportPage.jsx
✓ /user/my-reports    → users/MyReportsPage.jsx
✓ /user/reports/:id   → users/ReportDetailPage.jsx
✓ /user/profile       → users/ProfilePage.jsx
✓ /notifications      → NotificationsPage.jsx
```

### Shared Routes (Protected - Authenticated)
```
✓ /forecast           → shared/ForecastPage.jsx
```

### Public Routes (Unprotected)
```
✓ /register           → auth/Register.jsx
✓ /login              → auth/Login.jsx
✓ /unauthorized       → auth/Unauthorized.jsx
```

### Special Routes
```
✓ /                   → SmartRedirect (role-based)
✓ /*                  → SmartRedirect (role-based)
```

---

## 🔐 Authentication Flow

### Login Flow
```
1. User submits credentials → Login.jsx
2. Backend validates & returns JWT + role
3. Store tokens in localStorage
   - access (JWT access token)
   - refresh (JWT refresh token)
   - email (user email)
   - role (user role: "admin" or "user")
4. Redirect based on role:
   - Admin → /admin/dashboard
   - User → /user
```

### Protected Route Access Flow
```
1. User navigates to protected route
2. RequireAuth component intercepts:
   a. Check if access token exists
   b. Decode JWT and check expiration
   c. If expires in < 5 minutes:
      - Attempt token refresh via /api/users/token/refresh/
      - Update localStorage with new token
      - Continue to route
   d. If token refresh fails:
      - Clear localStorage
      - Redirect to /login
   e. Validate role if requiredRole specified
   f. Redirect to /unauthorized if role mismatch
3. Render protected component
```

### Token Refresh Flow (Dual Layer)

**Layer 1: RequireAuth Component (Proactive)**
- Checks token expiration on route access
- Refreshes if expiring within 5 minutes
- Shows loading state during refresh

**Layer 2: API Interceptor (Reactive)**
- Catches 401 errors from API calls
- Automatically refreshes token
- Retries failed request with new token
- Queues concurrent requests during refresh

---

## 📁 Directory Structure Changes

### Before
```
frontend/src/
├── pages/
│   ├── admin/
│   │   ├── Dashboard.jsx
│   │   ├── ReportDashboard.jsx
│   │   ├── Stations.jsx
│   │   ├── ForecastPage.jsx           ❌ (in admin but shared)
│   │   ├── HistoryPage.jsx            ❌ (unused)
│   │   ├── LangdingPage.jsx           ❌ (unused, typo)
│   │   └── Weather.jsx                ❌ (unused)
│   ├── users/
│   │   ├── UserDashboard.jsx
│   │   ├── ReportPage.jsx
│   │   ├── MyReportsPage.jsx
│   │   ├── ReportDetailPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── NotificationsPage.jsx      ❌ (duplicate)
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Unauthorized.jsx
│   └── NotificationsPage.jsx
└── components/
    ├── RequireAuth.jsx
    └── RequireAdmin.jsx               ❌ (unused)
```

### After
```
frontend/src/
├── pages/
│   ├── admin/
│   │   ├── Dashboard.jsx
│   │   ├── ReportDashboard.jsx
│   │   └── Stations.jsx
│   ├── shared/                        ✅ (new)
│   │   └── ForecastPage.jsx           ✅ (moved)
│   ├── users/
│   │   ├── UserDashboard.jsx
│   │   ├── ReportPage.jsx
│   │   ├── MyReportsPage.jsx
│   │   ├── ReportDetailPage.jsx
│   │   └── ProfilePage.jsx
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Unauthorized.jsx
│   └── NotificationsPage.jsx
└── components/
    ├── RequireAuth.jsx                ✅ (enhanced)
    └── SmartRedirect.jsx              ✅ (new)
```

---

## 🔧 Files Modified

### New Files Created (2)
```
✅ frontend/src/components/SmartRedirect.jsx       (37 lines)
✅ frontend/src/pages/shared/                       (new directory)
```

### Files Modified (3)
```
📝 frontend/src/App.jsx                             (+10 lines)
   - Added SmartRedirect import
   - Standardized admin routes to /admin/*
   - Added legacy redirects for backward compatibility
   - Updated ForecastPage import path
   - Changed catch-all route to use SmartRedirect
   - Added root route with SmartRedirect

📝 frontend/src/pages/auth/Login.jsx                (1 line)
   - Changed admin redirect from /dashboard to /admin/dashboard

📝 frontend/src/components/RequireAuth.jsx          (complete rewrite)
   - Added proactive token refresh (expires in < 5 min)
   - Added loading state during auth check
   - Added async authentication validation
   - Maintained role-based access control
```

### Files Moved (1)
```
🔄 frontend/src/pages/admin/ForecastPage.jsx
   → frontend/src/pages/shared/ForecastPage.jsx
```

### Files Deleted (5)
```
🗑️ frontend/src/pages/admin/HistoryPage.jsx
🗑️ frontend/src/pages/admin/LangdingPage.jsx
🗑️ frontend/src/pages/admin/Weather.jsx
🗑️ frontend/src/pages/users/NotificationsPage.jsx
🗑️ frontend/src/components/RequireAdmin.jsx
```

**Total Changes:**
- 2 new files
- 3 files modified
- 1 file moved
- 5 files deleted
- **Net: -1 file** (cleaner codebase!)

---

## 🧪 Testing Checklist

### Authentication Tests
- [ ] Login as admin → redirects to `/admin/dashboard`
- [ ] Login as user → redirects to `/user`
- [ ] Visit `/` while logged in as admin → redirects to `/admin/dashboard`
- [ ] Visit `/` while logged in as user → redirects to `/user`
- [ ] Visit `/` while not logged in → redirects to `/login`
- [ ] Visit invalid route while logged in → redirects to appropriate dashboard (no logout)
- [ ] Visit invalid route while not logged in → redirects to `/login`

### Route Access Tests (Admin)
- [ ] Admin can access `/admin/dashboard`
- [ ] Admin can access `/admin/reports`
- [ ] Admin can access `/admin/stations`
- [ ] Admin can access `/forecast`
- [ ] Admin accessing user-only routes works (no restriction)

### Route Access Tests (User)
- [ ] User can access `/user`
- [ ] User can access `/report`
- [ ] User can access `/user/my-reports`
- [ ] User can access `/user/profile`
- [ ] User can access `/notifications`
- [ ] User can access `/forecast`
- [ ] User accessing `/admin/*` routes → redirects to `/unauthorized`

### Legacy Route Tests (Backward Compatibility)
- [ ] `/dashboard` redirects to `/admin/dashboard`
- [ ] `/stations` redirects to `/admin/stations`

### Token Refresh Tests
- [ ] Access protected route with valid token → no refresh, instant access
- [ ] Access protected route with token expiring in < 5 min → proactive refresh
- [ ] Access protected route with expired token → attempts refresh, succeeds
- [ ] Access protected route with expired refresh token → redirects to login
- [ ] Make API call with expired token → interceptor refreshes, retries request
- [ ] Token refresh during active use → no interruption

### UI Tests
- [ ] Loading spinner shows during auth check
- [ ] No flicker when token is valid
- [ ] Smooth redirect after token refresh

---

## 🎯 Benefits Achieved

### User Experience
✅ **No More Silent Logouts**: Authenticated users stay logged in when visiting invalid routes
✅ **Proactive Token Refresh**: Tokens refresh before expiration, preventing interruptions
✅ **Role-Based Redirection**: Users land on appropriate dashboard automatically
✅ **Loading Feedback**: Clear loading states during authentication checks
✅ **Backward Compatible**: Existing bookmarks and links still work

### Developer Experience
✅ **Consistent Route Patterns**: All admin routes follow `/admin/*` convention
✅ **Clear Code Organization**: Shared components in dedicated `shared/` folder
✅ **Cleaner Codebase**: 5 unused files removed
✅ **Better Maintainability**: Single source of truth for authentication logic
✅ **Self-Documenting**: Route structure clearly indicates access level

### Security
✅ **Proper Role Validation**: Admin routes protected with role checks
✅ **Token Refresh Security**: Refresh tokens validated server-side
✅ **Unauthorized Handling**: Clear unauthorized page for permission errors
✅ **No Client-Side Token Generation**: All tokens issued by backend

---

## 📝 Future Recommendations

### High Priority
1. **Backend Route Protection**
   - Ensure all backend endpoints validate JWT tokens
   - Implement role-based permissions on backend
   - Add rate limiting to refresh endpoint

2. **Security Enhancements**
   - Consider migrating from localStorage to HttpOnly cookies
   - Implement CSRF protection
   - Add secure token rotation on refresh

### Medium Priority
3. **User Session Management**
   - Add "Remember Me" functionality
   - Implement session timeout warnings
   - Add concurrent session management

4. **Error Handling**
   - Add toast notifications for auth errors
   - Improve error messages on Unauthorized page
   - Add retry mechanism for network failures

### Low Priority
5. **Performance Optimization**
   - Implement route-based code splitting
   - Add service worker for offline support
   - Cache authenticated user data

6. **Developer Tools**
   - Add route documentation generator
   - Create route testing utilities
   - Add TypeScript definitions for routes

---

## 🔍 Known Limitations

### Current Limitations
1. **LocalStorage Security**: Tokens stored in localStorage are vulnerable to XSS attacks
   - *Mitigation*: Ensure proper Content Security Policy (CSP)
   - *Future*: Migrate to HttpOnly cookies

2. **No CSRF Protection**: Application doesn't implement CSRF tokens
   - *Future*: Add CSRF token validation

3. **Client-Side Route Protection Only**: Route protection happens on frontend
   - *Critical*: Backend must also validate all requests
   - *Note*: Frontend protection is for UX only, not security

4. **Token Refresh Race Conditions**: Multiple concurrent refreshes possible
   - *Note*: API interceptor handles this with queue, but RequireAuth doesn't
   - *Impact*: Minimal, as API interceptor is primary refresh mechanism

### Browser Compatibility
- **Required**: Modern browsers with ES6+ support
- **Required**: localStorage support
- **Required**: Promise/async-await support

---

## 📚 Related Documentation

### Project Files
- [Frontend App Entry Point](frontend/src/App.jsx)
- [Authentication Component](frontend/src/components/RequireAuth.jsx)
- [Smart Redirect Component](frontend/src/components/SmartRedirect.jsx)
- [API Configuration](frontend/src/api/api.js)
- [Login Page](frontend/src/pages/auth/Login.jsx)

### External Documentation
- [React Router v6 Documentation](https://reactrouter.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## 👥 Credits

**Developer:** Bongcales, Kent Harvey T.
**Date:** January 14, 2025
**Review Status:** Pending User Review

---

## 📄 Change Log

### Version 2.0.0 - January 14, 2025
- ✅ Fixed catch-all route logout issue
- ✅ Standardized admin routes to `/admin/*`
- ✅ Implemented proactive token refresh
- ✅ Created SmartRedirect component
- ✅ Moved ForecastPage to shared folder
- ✅ Removed 5 unused files
- ✅ Added legacy route redirects
- ✅ Enhanced RequireAuth component

### Version 1.0.0 - Before January 14, 2025
- Initial routing implementation
- Basic authentication with JWT
- Separate admin and user dashboards

---

## 🆘 Troubleshooting

### Issue: "Verifying authentication..." spinner shows indefinitely
**Cause:** Token refresh endpoint unreachable or returning errors
**Solution:** Check backend server is running at `http://127.0.0.1:8000`

### Issue: Redirected to login immediately after successful login
**Cause:** Token expiration time too short or system clock mismatch
**Solution:** Check backend JWT token expiration settings

### Issue: Admin user redirected to unauthorized page
**Cause:** JWT token doesn't include `role` claim or role value incorrect
**Solution:** Check backend token generation includes `role: "admin"`

### Issue: Legacy routes not working
**Cause:** Browser cached old routing configuration
**Solution:** Clear browser cache and hard reload (Ctrl+Shift+R)

---

## 📞 Support

For questions or issues related to these routing changes:

1. **Review this documentation** thoroughly
2. **Check the Testing Checklist** to verify expected behavior
3. **Consult the Troubleshooting section** for common issues
4. **Review modified files** to understand implementation details

---

**End of Documentation**

*This document should be kept up-to-date with any future routing changes.*
