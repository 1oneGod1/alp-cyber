# 🎯 QUICK REFERENCE - Google OAuth Setup

## ✅ Current Status
- ✅ Browser opened: https://console.cloud.google.com/
- ✅ .env file ready to edit
- ✅ Server running on http://localhost:3000
- ⏳ Waiting for Google OAuth credentials

---

## 📝 QUICK STEPS (Summary)

### 1️⃣ Google Cloud Console (5 min)
```
1. Login → Create Project: "Document Management System"
2. Enable APIs: Google+ API, People API
3. OAuth Consent Screen: External → Fill form → Add test user (your email)
4. Create Credentials → OAuth Client ID → Web application
5. Redirect URI: http://localhost:3000/auth/google/callback
6. COPY: Client ID & Client Secret
```

### 2️⃣ Update .env (1 min)
```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMn
```

### 3️⃣ Update test-google-oauth.html (1 min)
```html
Line ~72: data-client_id="YOUR_CLIENT_ID"
→ Replace dengan Client ID Anda
```

### 4️⃣ Restart & Test (2 min)
```powershell
# Restart server
node server.js

# Test
Start-Process "http://localhost:3000/auth/google"
```

---

## 🎯 KEY INFORMATION TO COPY

### From Google Cloud Console:
```
Client ID: 
_____________________________________________
(Format: 123456789-xyz.apps.googleusercontent.com)

Client Secret:
_____________________________________________
(Format: GOCSPX-AbCdEfGhIjKlMn)
```

### Redirect URI (Must be EXACT):
```
http://localhost:3000/auth/google/callback
```
⚠️ Copy-paste ini ke Google Console - MUST BE EXACT!

---

## 🔧 Files to Edit

### 1. .env (Already open in VS Code)
**Find lines:**
```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
```

**Replace with your actual credentials:**
```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMn
```

### 2. test-google-oauth.html
**Find line ~72:**
```html
data-client_id="YOUR_GOOGLE_CLIENT_ID"
```

**Replace with:**
```html
data-client_id="123456789-abc.apps.googleusercontent.com"
```

---

## ⚡ Quick Commands

### Restart Server:
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
node server.js
```

### Check Configuration:
```powershell
$r = Invoke-RestMethod -Uri "http://localhost:3000" -Method Get
$r.googleOAuth.status
```

### Test OAuth Flow:
```powershell
Start-Process "http://localhost:3000/auth/google"
```

### Test with Token:
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3000/profile" -Headers $headers
```

---

## 📋 Checklist

### Setup:
- [ ] Google project created
- [ ] APIs enabled
- [ ] OAuth consent configured
- [ ] Credentials created
- [ ] Client ID copied
- [ ] Client Secret copied

### Configuration:
- [ ] .env updated
- [ ] test-google-oauth.html updated
- [ ] Server restarted
- [ ] Status shows "Configured ✅"

### Testing:
- [ ] Browser OAuth flow works
- [ ] JWT token received
- [ ] Token works with /profile
- [ ] Token works with /documents
- [ ] RBAC verified (403 on /admin/users)

---

## 🐛 Common Issues

### "redirect_uri_mismatch"
→ Check redirect URI in Google Console matches EXACTLY

### "invalid_client"
→ Check Client ID & Secret copied correctly

### "Not Configured" after update
→ Restart server, check .env has no typos

### Can't login
→ Add your email to Test Users in OAuth Consent Screen

---

## 📞 Help Files

- **Visual guide:** `SETUP_GUIDE_VISUAL.md` (detailed step-by-step)
- **Full documentation:** `GOOGLE_OAUTH_SETUP.md`
- **Implementation report:** `LAPORAN_LANGKAH_2.md`
- **This file:** `QUICK_REFERENCE.md`

---

## 🎯 What to Do NOW

1. **Follow setup in browser** (Google Cloud Console tab is open)
2. **Copy Client ID & Secret** when you get them
3. **Update .env** (file is open in VS Code)
4. **Update test-google-oauth.html** (line 72)
5. **Restart server**
6. **Test!**

---

**Estimated time:** 10-15 minutes  
**Difficulty:** Easy (just follow steps)  
**Result:** Working Google OAuth 2.0 login! 🎉

---

