# JWT Authentication Fix & Token Blacklist Implementation

## Overview
This document explains the authentication improvements made to RainSafe CMU to fix the automatic logout issue and implement secure JWT token management with token blacklisting.

---

## Problems Identified

### 1. **Automatic Logout Issue**
**Symptom**: Users were being automatically logged out and redirected to login page during active sessions.

**Root Cause**:
- JWT access tokens were expiring (default 5 minutes lifetime)
- No automatic token refresh mechanism was implemented
- When tokens expired, all API requests failed with 401 Unauthorized
- The application treated 401 errors as "not authenticated" and logged users out
- No graceful handling of token expiration

### 2. **Last Login Not Tracked**
**Symptom**: ProfilePage and UserDashboard showing "N/A" for last login time.

**Root Cause**:
- Django's `last_login` field wasn't being updated on authentication
- `last_login` field wasn't included in UserSerializer response
- No explicit update in the login flow

---

## Solutions Implemented

### 1. **Automatic Token Refresh Mechanism**

**File**: `frontend/src/api/api.js`

**Implementation**:
```javascript
let isRefreshing = false;
let failedQueue = [];

// Response interceptor for handling 401 errors
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Implement token refresh with request queuing
      if (isRefreshing) {
        // Queue concurrent requests during refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return API(originalRequest);
        });
      }

      // Attempt token refresh
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        // No refresh token available, logout
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/users/token/refresh/",
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem("access", access);

        // Retry all queued requests with new token
        processQueue(null, access);

        return API(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        processQueue(refreshError, null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**How It Works**:
1. **Detection**: Intercepts all 401 Unauthorized responses
2. **Refresh**: Automatically calls the refresh token endpoint
3. **Queuing**: Holds concurrent requests during refresh to prevent race conditions
4. **Retry**: Retries original request with new access token
5. **Fallback**: Only logs out if refresh token is invalid or expired

**Benefits**:
- Users stay logged in during active sessions
- Seamless token renewal without user intervention
- Prevents unnecessary logouts due to token expiration
- Handles concurrent requests gracefully

---

### 2. **JWT Configuration with Extended Lifetimes**

**File**: `backend/core/settings.py`

**Configuration**:
```python
from datetime import timedelta

SIMPLE_JWT = {
    # Token Lifetimes
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),      # Extended from 5 minutes
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),      # Valid for 7 days

    # Token Rotation & Security
    'ROTATE_REFRESH_TOKENS': True,                     # Generate new refresh token on refresh
    'BLACKLIST_AFTER_ROTATION': True,                  # Blacklist old refresh tokens
    'UPDATE_LAST_LOGIN': True,                         # Update last_login on token refresh

    # Algorithm & Keys
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,

    # Header Configuration
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',

    # Claims
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}
```

**Key Improvements**:
- **1 Hour Access Token**: Reduced frequency of token refreshes
- **7 Day Refresh Token**: Extended session duration for better UX
- **Token Rotation**: New refresh token issued on each refresh for security
- **Last Login Update**: Automatically updates last_login timestamp

---

### 3. **Token Blacklist Implementation**

**Why Token Blacklist is Essential**:

#### **Security Benefits**:

1. **Token Revocation**
   - Allows immediate invalidation of compromised tokens
   - Essential for logout functionality
   - Prevents reuse of old tokens after password change

2. **Token Rotation Security**
   - When `ROTATE_REFRESH_TOKENS=True`, new tokens are issued
   - Old tokens must be blacklisted to prevent reuse
   - Prevents token replay attacks

3. **Session Management**
   - Tracks outstanding tokens per user
   - Enables "logout from all devices" functionality
   - Provides audit trail of token usage

4. **Compliance & Best Practices**
   - Industry standard for JWT token management
   - Required for secure logout implementation
   - Prevents token fixation attacks

#### **How It Works**:

```
User Login
    ↓
Access + Refresh Token Issued
    ↓
Token Stored in OutstandingToken Table
    ↓
User Makes API Request (Token Expires)
    ↓
Automatic Refresh Triggered
    ↓
New Access Token + New Refresh Token Issued
    ↓
Old Refresh Token Moved to BlacklistedToken Table
    ↓
If Old Token Used Again → Rejected (Blacklisted)
```

#### **Database Tables Created**:

1. **OutstandingToken**:
   - Tracks all active refresh tokens
   - Stores token, user, expiry, JTI (JWT ID)
   - Used to validate token is still valid

2. **BlacklistedToken**:
   - Stores revoked/rotated tokens
   - Prevents reuse of old tokens
   - Automatically checked on token validation

#### **Implementation**:

**Added to `INSTALLED_APPS`**:
```python
INSTALLED_APPS = [
    # ... other apps ...
    "rest_framework_simplejwt.token_blacklist",
]
```

**Migrations Applied**:
```bash
python manage.py migrate token_blacklist
```

**Tables Created**:
- `token_blacklist_outstandingtoken`
- `token_blacklist_blacklistedtoken`

---

### 4. **Last Login Tracking**

**File**: `backend/users/tokens.py`

**Implementation**:
```python
from django.utils import timezone

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Explicitly update last_login timestamp
        self.user.last_login = timezone.now()
        self.user.save(update_fields=['last_login'])

        # Add custom claims
        data["email"] = self.user.email
        data["role"] = self.user.role
        data["first_name"] = self.user.first_name
        data["last_name"] = self.user.last_name

        return data
```

**File**: `backend/users/serializers.py`

**Added Fields**:
```python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        fields = [
            # ... existing fields ...
            "last_login",      # Added - timestamp of last authentication
            "date_joined",     # Added - account creation timestamp
        ]
        read_only_fields = ["role", "email", "last_login", "date_joined"]
```

---

## Best Practices Implemented

### 1. **Security Best Practices**

✅ **Token Rotation**: New refresh tokens issued on each refresh
✅ **Token Blacklisting**: Old tokens immediately invalidated
✅ **Secure Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
✅ **Automatic Cleanup**: Blacklisted tokens can be cleaned up periodically
✅ **Short Access Token Lifetime**: 1 hour reduces risk if token is compromised
✅ **Long Refresh Token Lifetime**: 7 days balances security and UX

### 2. **User Experience Best Practices**

✅ **Seamless Token Refresh**: Users never see authentication errors during active sessions
✅ **Request Queuing**: Concurrent requests handled gracefully during refresh
✅ **Extended Sessions**: Users stay logged in for 7 days (refresh token lifetime)
✅ **Graceful Logout**: Only logs out when refresh token is truly invalid
✅ **Last Login Tracking**: Users can see when they last accessed the system

### 3. **Code Quality Best Practices**

✅ **Centralized Authentication Logic**: All token handling in single interceptor
✅ **Error Handling**: Comprehensive try-catch with fallbacks
✅ **Race Condition Prevention**: Request queuing prevents multiple simultaneous refreshes
✅ **Separation of Concerns**: Authentication logic separate from business logic
✅ **Configuration-Based**: JWT settings in Django settings for easy modification

---

## Testing Checklist

### Before Testing:
- [ ] Backend server running with migrations applied
- [ ] Frontend development server running
- [ ] Browser localStorage cleared (fresh start)

### Test Cases:

#### 1. **Login & Last Login Display**
- [ ] Login with valid credentials
- [ ] Verify last_login displays on ProfilePage
- [ ] Verify last_login displays on UserDashboard
- [ ] Verify timestamp is current

#### 2. **Token Refresh (Manual)**
- [ ] Login and note the access token in localStorage
- [ ] Wait 1 hour (or modify ACCESS_TOKEN_LIFETIME to 1 minute for testing)
- [ ] Make an API request (navigate to different page)
- [ ] Verify new access token in localStorage (different from original)
- [ ] Verify user stays logged in

#### 3. **Token Refresh (Automatic)**
- [ ] Login and start using the application
- [ ] Use application continuously for over 1 hour
- [ ] Verify no logout occurs
- [ ] Check browser console - should see no 401 errors

#### 4. **Concurrent Requests During Refresh**
- [ ] Login and wait until token is about to expire
- [ ] Trigger multiple API requests simultaneously (open multiple pages)
- [ ] Verify all requests succeed
- [ ] Check browser console - should see single refresh request, not multiple

#### 5. **Token Blacklist Verification**
- [ ] Login and save the refresh token from localStorage
- [ ] Trigger a token refresh (wait 1 hour or make request after expiry)
- [ ] Try to manually use the old refresh token via API
- [ ] Verify request is rejected (token blacklisted)

#### 6. **Logout Functionality**
- [ ] Login successfully
- [ ] Click logout in navbar
- [ ] Verify confirmation dialog appears
- [ ] Confirm logout
- [ ] Verify redirected to login page
- [ ] Verify tokens removed from localStorage
- [ ] Verify cannot access protected routes

#### 7. **Expired Refresh Token**
- [ ] Login and note refresh token
- [ ] Manually set refresh token expiry in database to past date
- [ ] Try to make API request
- [ ] Verify automatic logout occurs
- [ ] Verify redirect to login page

---

## Token Flow Diagram

```
┌─────────────┐
│ User Login  │
└──────┬──────┘
       │
       ▼
┌────────────────────────────────┐
│ Issue Access + Refresh Token   │
│ - Access: 1 hour lifetime      │
│ - Refresh: 7 days lifetime     │
└──────┬─────────────────────────┘
       │
       ▼
┌────────────────────────────────┐
│ User Makes API Requests        │
│ - Access token in header       │
└──────┬─────────────────────────┘
       │
       ▼
  ┌────────────┐
  │ Token      │
  │ Expired?   │
  └─┬────────┬─┘
    │ No     │ Yes
    │        │
    │        ▼
    │   ┌──────────────────────────┐
    │   │ Automatic Token Refresh  │
    │   │ - Use refresh token      │
    │   │ - Get new access token   │
    │   │ - Get new refresh token  │
    │   │ - Blacklist old refresh  │
    │   └─────────┬────────────────┘
    │             │
    ▼             ▼
┌──────────────────────────────┐
│ Request Succeeds             │
│ - User stays logged in       │
└──────────────────────────────┘
```

---

## Database Schema

### OutstandingToken Table
| Field | Type | Description |
|-------|------|-------------|
| id | BigAutoField | Primary key |
| user | ForeignKey | Reference to User model |
| jti | CharField(255) | JWT ID (unique identifier) |
| token | TextField | The actual refresh token |
| created_at | DateTimeField | Token creation timestamp |
| expires_at | DateTimeField | Token expiration timestamp |

### BlacklistedToken Table
| Field | Type | Description |
|-------|------|-------------|
| id | BigAutoField | Primary key |
| token | OneToOneField | Reference to OutstandingToken |
| blacklisted_at | DateTimeField | Timestamp when blacklisted |

---

## Maintenance & Cleanup

### Periodic Token Cleanup
Old blacklisted tokens should be cleaned up periodically to prevent database bloat:

```python
# Add to Django management command or scheduled task
from datetime import timedelta
from django.utils import timezone
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

# Delete tokens expired more than 30 days ago
OutstandingToken.objects.filter(
    expires_at__lt=timezone.now() - timedelta(days=30)
).delete()
```

**Recommended Schedule**: Daily or weekly cleanup via cron job or Django management command.

---

## Security Considerations

### Production Recommendations:

1. **Use HTTPS**: Always use HTTPS in production to prevent token interception
2. **httpOnly Cookies**: Consider using httpOnly cookies instead of localStorage
3. **Token Rotation**: Already implemented ✓
4. **Short Access Token Lifetime**: Already set to 1 hour ✓
5. **CORS Configuration**: Ensure CORS is properly configured for production domains
6. **Secret Key**: Use strong SECRET_KEY and never expose it
7. **Token Cleanup**: Implement automated cleanup of expired tokens

### Environment Variables:
Consider moving token lifetimes to environment variables for easy configuration:
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=int(os.getenv('JWT_ACCESS_LIFETIME_HOURS', 1))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.getenv('JWT_REFRESH_LIFETIME_DAYS', 7))),
}
```

---

## Summary of Changes

### Backend Changes:
1. ✅ Added `rest_framework_simplejwt.token_blacklist` to INSTALLED_APPS
2. ✅ Configured SIMPLE_JWT settings with appropriate lifetimes
3. ✅ Implemented token rotation and blacklisting
4. ✅ Added last_login tracking in CustomTokenObtainPairSerializer
5. ✅ Added last_login and date_joined to UserSerializer
6. ✅ Applied migrations for token blacklist tables

### Frontend Changes:
1. ✅ Implemented automatic token refresh interceptor in api.js
2. ✅ Added request queuing during token refresh
3. ✅ Added graceful error handling for token refresh failures
4. ✅ Maintained tokens in localStorage with automatic updates

---

## Troubleshooting

### Issue: User still getting logged out
**Check**:
- Browser console for 401 errors
- Verify refresh token exists in localStorage
- Check backend logs for token refresh errors
- Verify migrations were applied: `python manage.py showmigrations token_blacklist`

### Issue: Token refresh failing
**Check**:
- Refresh token not expired (check expiry in database)
- Refresh token not blacklisted
- Backend endpoint `/api/users/token/refresh/` is accessible
- CORS settings allow requests from frontend

### Issue: Last login still showing N/A
**Check**:
- Clear browser cache and localStorage
- Login again to get fresh tokens
- Verify CustomTokenObtainPairSerializer is being used
- Check API response includes last_login field

---

## Conclusion

The implementation of JWT token blacklisting along with automatic token refresh provides:
- **Enhanced Security**: Token rotation and revocation capabilities
- **Better UX**: Users stay logged in during active sessions
- **Industry Standards**: Following JWT best practices
- **Maintainability**: Centralized authentication logic
- **Auditability**: Token usage tracking and audit trail

This fix resolves the automatic logout issue while maintaining high security standards and providing excellent user experience.
