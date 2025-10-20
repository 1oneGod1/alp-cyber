# 🎯 PANDUAN SETUP GOOGLE OAUTH - LANGKAH DEMI LANGKAH

## ✅ Checklist Setup (Ikuti urutan ini)

Browser Google Cloud Console sudah terbuka di: https://console.cloud.google.com/

---

## 📋 STEP 1: Login & Create Project

### 1.1 Login ke Google Cloud Console
- [x] Browser sudah terbuka
- [ ] Login dengan akun Google Anda
- [ ] Tunggu dashboard load

### 1.2 Create New Project
**Di dashboard:**
1. Klik dropdown **"Select a project"** di header (sebelah logo Google Cloud)
2. Klik tombol **"NEW PROJECT"** di pojok kanan atas popup
3. Isi form:
   ```
   Project name: Document Management System
   Location: No organization (atau biarkan default)
   ```
4. Klik **"CREATE"**
5. Tunggu project dibuat (beberapa detik)
6. **Pastikan project "Document Management System" yang terpilih** (cek di dropdown)

---

## 📋 STEP 2: Enable Google APIs

### 2.1 Navigate ke APIs & Services
**Di sidebar kiri:**
1. Klik menu hamburger (☰) di pojok kiri atas
2. Hover ke **"APIs & Services"**
3. Klik **"Library"**

### 2.2 Enable Google+ API
1. Di halaman "API Library", ketik di search box: **`Google+ API`**
2. Klik hasil **"Google+ API"**
3. Klik tombol biru **"ENABLE"**
4. Tunggu enabled (beberapa detik)
5. ✅ Done!

### 2.3 Enable People API (Optional tapi recommended)
1. Klik **"Library"** lagi di sidebar
2. Search: **`People API`**
3. Klik hasil **"People API"**
4. Klik **"ENABLE"**
5. ✅ Done!

---

## 📋 STEP 3: Configure OAuth Consent Screen

### 3.1 Navigate ke OAuth Consent Screen
**Di sidebar:**
1. Klik **"APIs & Services"**
2. Klik **"OAuth consent screen"**

### 3.2 Choose User Type
1. Pilih **"External"** (untuk testing)
2. Klik **"CREATE"**

### 3.3 Fill OAuth Consent Screen Form

**Page 1: App Information**
```
App name:                    Document Management System
User support email:          [pilih email Anda dari dropdown]
App logo:                    [skip - optional]

App domain (Optional):
Application home page:       http://localhost:3000
Application privacy policy:  [skip - optional untuk testing]
Application terms of service: [skip - optional untuk testing]

Authorized domains:
  → Klik "ADD DOMAIN"
  → Ketik: localhost
  → (optional, mungkin tidak perlu untuk localhost)

Developer contact information:
Email addresses:             [ketik email Anda]
```
**Klik "SAVE AND CONTINUE"**

**Page 2: Scopes**
1. Klik **"ADD OR REMOVE SCOPES"**
2. Scroll atau search, pilih 3 scopes ini (centang checkbox):
   ```
   ✅ .../auth/userinfo.email
   ✅ .../auth/userinfo.profile  
   ✅ openid
   ```
3. Klik **"UPDATE"** di bawah
4. Verify 3 scopes muncul di table
5. Klik **"SAVE AND CONTINUE"**

**Page 3: Test Users**
1. Klik **"ADD USERS"**
2. Ketik email Google Anda (yang akan dipakai untuk testing)
3. Klik **"ADD"**
4. Klik **"SAVE AND CONTINUE"**

**Page 4: Summary**
1. Review informasi
2. Klik **"BACK TO DASHBOARD"**

✅ OAuth Consent Screen configured!

---

## 📋 STEP 4: Create OAuth 2.0 Client ID

### 4.1 Navigate to Credentials
**Di sidebar:**
1. Klik **"Credentials"**

### 4.2 Create Credentials
1. Klik tombol **"+ CREATE CREDENTIALS"** di atas
2. Pilih **"OAuth client ID"**

### 4.3 Configure OAuth Client ID

**Application type:**
- Pilih: **"Web application"**

**Name:**
```
Document Management OAuth Client
```

**Authorized JavaScript origins:**
1. Klik **"+ ADD URI"**
2. Ketik: `http://localhost:3000`
3. (Optional) Klik "+ ADD URI" lagi untuk port 3001 jika ada:
   - `http://localhost:3001`

**Authorized redirect URIs:** ⚠️ PENTING!
1. Klik **"+ ADD URI"**
2. Ketik EXACTLY: `http://localhost:3000/auth/google/callback`
   - ⚠️ Pastikan EXACT sama (termasuk /auth/google/callback)
   - ⚠️ Jangan ada trailing slash di akhir
3. (Optional) Jika ada frontend terpisah di port 3001:
   - Klik "+ ADD URI"
   - `http://localhost:3001/auth/callback`

**Klik "CREATE"**

---

## 📋 STEP 5: Copy Credentials

### 5.1 OAuth Client Created Popup
Setelah klik "CREATE", muncul popup dengan:
```
Your Client ID:
123456789-abcdefghijk.apps.googleusercontent.com

Your Client Secret:
GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
```

### 5.2 COPY CREDENTIALS
**⚠️ SANGAT PENTING - Copy credentials ini!**

**Method 1: Copy dari popup**
1. Klik icon copy di sebelah **Client ID** → Copy
2. Save sementara di Notepad
3. Klik icon copy di sebelah **Client Secret** → Copy
4. Save sementara di Notepad
5. Klik **"OK"** untuk tutup popup

**Method 2: Download JSON (backup)**
1. Klik **"DOWNLOAD JSON"** di popup (optional)
2. Save file JSON sebagai backup

**⚠️ JANGAN CLOSE POPUP SEBELUM COPY!**
(Tapi tenang, bisa dilihat lagi nanti di Credentials page)

---

## 📋 STEP 6: Update .env File

Sekarang kita update file `.env` dengan credentials:

**Buka file: `e:\Semester 4\Cyber\ALP\.env`**

Update baris berikut:
```env
GOOGLE_CLIENT_ID=PASTE_YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=PASTE_YOUR_CLIENT_SECRET_HERE
```

Contoh lengkap:
```env
# Secret key untuk JWT
SECRET_KEY=your-secret-key-change-this-in-production-use-random-string

# Port server
PORT=3000

# Environment
NODE_ENV=development

# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**⚠️ PENTING:**
- Client ID format: `123456789-xyz.apps.googleusercontent.com`
- Client Secret format: `GOCSPX-xyz123abc`
- Jangan ada spasi atau quotes
- Save file (Ctrl+S)

---

## 📋 STEP 7: Update test-google-oauth.html

**Buka file: `e:\Semester 4\Cyber\ALP\test-google-oauth.html`**

**Find line ~72** (dalam tag `<div id="g_id_onload">`):
```html
data-client_id="YOUR_GOOGLE_CLIENT_ID"
```

**Replace dengan Client ID Anda:**
```html
data-client_id="123456789-abcdefghijk.apps.googleusercontent.com"
```

**Save file (Ctrl+S)**

---

## 📋 STEP 8: Restart Server

**PowerShell command:**
```powershell
# Stop server yang running (Ctrl+C di window server)
# Atau force stop:
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start server baru
node server.js
```

**Expected output:**
```
🚀 Server berjalan di http://localhost:3000

⏳ Initializing default users...
✅ Default users initialized successfully

=== 👤 Informasi Login Default ===
Admin - username: admin, password: admin123
User  - username: user, password: user123
===================================

📚 Lihat README.md untuk panduan lengkap
🧪 Import Postman_Collection.json untuk testing
```

---

## 📋 STEP 9: Verify Configuration

**PowerShell command:**
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000" -Method Get
Write-Host "Google OAuth Status: $($response.googleOAuth.status)" -ForegroundColor Yellow
```

**Expected output:**
```
Google OAuth Status: Configured ✅
```

**Jika masih "Not Configured ⚠️":**
- Check .env file sudah benar
- Check server sudah di-restart
- Check Client ID bukan "YOUR_GOOGLE_CLIENT_ID_HERE"

---

## 📋 STEP 10: Test OAuth Flow!

### Method 1: Browser Test (Recommended)
```
1. Open browser
2. Go to: http://localhost:3000/auth/google
3. Should redirect to Google login
4. Login with your Google account
5. Click "Allow" to authorize
6. Should redirect back with JWT token
```

### Method 2: HTML Test Page
```
1. Open: test-google-oauth.html in browser
2. Click "Login with Google" button
3. Follow same flow as Method 1
```

**Expected Result:**
```json
{
  "message": "Login dengan Google berhasil",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 3,
    "username": "Your Name",
    "email": "your-email@gmail.com",
    "role": "user",
    "avatar": "https://lh3.googleusercontent.com/...",
    "provider": "google"
  }
}
```

**Copy accessToken untuk testing!**

---

## 📋 STEP 11: Test JWT Token

**Use token dari Step 10:**

```powershell
$token = "PASTE_YOUR_ACCESS_TOKEN_HERE"
$headers = @{ Authorization = "Bearer $token" }

# Test profile
Invoke-RestMethod -Uri "http://localhost:3000/profile" -Method Get -Headers $headers

# Test documents
Invoke-RestMethod -Uri "http://localhost:3000/documents" -Method Get -Headers $headers
```

**Expected:** ✅ Both should return success!

---

## 📋 STEP 12: Final Verification

### Test RBAC with Google User
```powershell
# Try to access admin endpoint (should fail with 403)
Invoke-RestMethod -Uri "http://localhost:3000/admin/users" -Method Get -Headers $headers
```
**Expected:** ❌ 403 Forbidden (because Google user has role='user')

### Verify User in Database
```powershell
# Login as admin
$body = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$adminResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $body -ContentType "application/json"
$adminHeaders = @{ Authorization = "Bearer $($adminResponse.accessToken)" }

# Check all users (should see Google user)
Invoke-RestMethod -Uri "http://localhost:3000/admin/users" -Method Get -Headers $adminHeaders
```

**Expected:** ✅ Should see Google user with provider='google'

---

## ✅ COMPLETION CHECKLIST

- [ ] Google Cloud Console account
- [ ] Project "Document Management System" created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created
- [ ] Credentials copied
- [ ] .env file updated
- [ ] test-google-oauth.html updated
- [ ] Server restarted
- [ ] Configuration verified (Configured ✅)
- [ ] OAuth flow tested in browser
- [ ] JWT token received
- [ ] Token tested with API endpoints
- [ ] RBAC verified with Google user
- [ ] Google user visible in admin/users

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Fix:**
1. Check .env: `GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback`
2. Check Google Console: Authorized redirect URIs has EXACT same URL
3. No trailing slash!

### Error: "invalid_client"
**Fix:**
1. Verify Client ID & Secret copied correctly
2. No extra spaces
3. Check format (Client ID ends with .apps.googleusercontent.com)

### Error: "Access blocked: This app's request is invalid"
**Fix:**
1. Add your email to Test Users in OAuth consent screen
2. Make sure all 3 scopes selected (email, profile, openid)

### Status still "Not Configured"
**Fix:**
1. Check .env has actual credentials (not placeholder)
2. Restart server
3. Clear browser cache

---

## 📞 Need Help?

**Dokumentasi:**
- Full guide: `GOOGLE_OAUTH_SETUP.md`
- Implementation: `LAPORAN_LANGKAH_2.md`
- Troubleshooting: End of `GOOGLE_OAUTH_SETUP.md`

**File penting:**
- Server: `server.js`
- Config: `.env`
- Test page: `test-google-oauth.html`

---

**🎉 Good luck dengan setup! Ikuti step by step dan semua akan berhasil! 🎉**
