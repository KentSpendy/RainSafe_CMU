# Quick Test Guide - Authentication Fixes

## 🚀 Quick Start Testing

### Step 1: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
./venv/Scripts/python.exe manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## ✅ Quick Test (5 minutes)

### Test 1: Last Login Display (2 minutes)
1. Open browser: http://localhost:5173
2. Login with your credentials
3. Check **Dashboard** → Last login should show current date/time ✓
4. Check **Profile** → Last login should show current date/time ✓

**Expected**: Both pages show valid timestamp (not "N/A")

### Test 2: Stay Logged In (3 minutes)
1. After login, navigate between different pages:
   - Dashboard → My Reports → Profile → Notifications → Dashboard
2. Keep using the app for a few minutes
3. Check browser localStorage (DevTools → Application → Local Storage)
   - `access` token should be present
   - `refresh` token should be present

**Expected**: No automatic logout, smooth navigation

---

## 🔬 Advanced Test (For 1-Hour Token Expiry)

### Fast Token Expiry Test (5 minutes)

**Temporarily shorten token lifetime for testing:**

Edit `backend/core/settings.py` line 161:
```python
'ACCESS_TOKEN_LIFETIME': timedelta(minutes=1),  # Change from hours=1
```

**Restart backend server**

**Test Steps:**
1. Login fresh
2. Open DevTools → Application → Local Storage
3. Copy the `access` token value
4. Wait 90 seconds (token expires)
5. Navigate to a different page
6. Check localStorage again
   - `access` token should be **different** (new token!)
7. Verify you're **still logged in** ✓

**After test, restore original:**
```python
'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),  # Restore
```

---

## 🐛 Troubleshooting

### Problem: Still showing "N/A" for last login
**Fix:**
1. Open DevTools → Application → Local Storage
2. Delete all items (clear storage)
3. Logout completely
4. Login fresh
5. Check again

### Problem: Still getting logged out
**Fix:**
1. Verify backend is running
2. Check browser console for errors (F12)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh (Ctrl+Shift+R)
5. Login fresh

### Problem: Backend not starting
**Fix:**
```bash
cd backend
./venv/Scripts/python.exe manage.py migrate
./venv/Scripts/python.exe manage.py runserver
```

---

## 📊 What to Check

### In Browser DevTools:

**Console Tab:**
- ✓ No 401 Unauthorized errors
- ✓ No "Token is invalid or expired" messages

**Network Tab:**
- ✓ API requests returning 200 OK
- ✓ If you see token refresh, only ONE request (not multiple)

**Application → Local Storage:**
- ✓ `access` token present
- ✓ `refresh` token present

---

## 🎯 Success Indicators

✅ Last login shows real timestamp on Dashboard
✅ Last login shows real timestamp on Profile
✅ Can navigate between pages without logout
✅ No 401 errors in console
✅ Tokens present in localStorage
✅ Smooth user experience

---

## 📞 Quick Command Reference

### Backend Commands
```bash
# Start server
cd backend
./venv/Scripts/python.exe manage.py runserver

# Check migrations
./venv/Scripts/python.exe manage.py showmigrations token_blacklist

# Create superuser (if needed)
./venv/Scripts/python.exe manage.py createsuperuser
```

### Frontend Commands
```bash
# Start dev server
cd frontend
npm run dev

# Install dependencies (if needed)
npm install
```

---

## 🔍 Database Verification

### Check Token Tables Exist
```bash
cd backend
./venv/Scripts/python.exe manage.py dbshell
```

**In SQLite shell:**
```sql
.tables
-- Should see: token_blacklist_outstandingtoken, token_blacklist_blacklistedtoken

SELECT COUNT(*) FROM token_blacklist_outstandingtoken;
-- After login, should show at least 1 token

.exit
```

---

## 📝 Test Results Template

Copy this and fill in your results:

```
Date: ___________
Tester: ___________

[ ] Backend Started Successfully
[ ] Frontend Started Successfully
[ ] Last Login Shows on Dashboard
[ ] Last Login Shows on Profile
[ ] No Automatic Logout After 5 Minutes
[ ] Token Refresh Works (Advanced Test)
[ ] Logout Button Works
[ ] Login After Logout Works

Issues Found:
1. _________________________________
2. _________________________________

Notes:
_____________________________________
_____________________________________
```

---

## 🎓 Understanding the Fix

### What Was Wrong:
- JWT tokens expired after 5 minutes
- No automatic refresh → users logged out
- Last login not tracked

### What Was Fixed:
- Tokens now last 1 hour (access) and 7 days (refresh)
- Automatic refresh in background
- Last login tracked on every login
- Old tokens blacklisted for security

### User Benefits:
- ✓ Stay logged in during active use
- ✓ No interruptions from token expiry
- ✓ See when you last logged in
- ✓ Better security with token rotation

---

## 📚 Full Documentation

For complete technical details:
- **[AUTHENTICATION_FIX_SUMMARY.md](./AUTHENTICATION_FIX_SUMMARY.md)** - Complete implementation summary
- **[JWT_AUTHENTICATION_FIX.md](./JWT_AUTHENTICATION_FIX.md)** - Technical deep dive

---

## ⚡ One-Line Test

**Fastest way to verify it works:**

1. Login → Wait 2 minutes → Navigate to different page → Still logged in? ✅

If yes, the fix is working!
