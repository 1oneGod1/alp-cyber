# 🔐 Panduan Setup Google OAuth 2.0

## 📋 Daftar Isi
1. [Setup Google Cloud Console](#step-1-setup-google-cloud-console)
2. [Konfigurasi Environment Variables](#step-2-konfigurasi-environment-variables)
3. [Testing Google OAuth](#step-3-testing-google-oauth)
4. [Integrasi dengan Frontend](#step-4-integrasi-dengan-frontend)

---

## Step 1: Setup Google Cloud Console

### 1.1 Buat Project Baru

1. **Buka Google Cloud Console:**
   - URL: https://console.cloud.google.com/
   - Login dengan akun Google Anda

2. **Buat Project Baru:**
   - Klik dropdown project di header
   - Klik "New Project"
   - Nama Project: `Document Management System`
   - Klik "Create"

### 1.2 Enable Google+ API

1. **Navigate ke APIs & Services:**
   - Dari sidebar, pilih "APIs & Services" > "Library"

2. **Enable Google+ API:**
   - Search: "Google+ API"
   - Klik pada hasil
   - Klik "Enable"

3. **Enable Google People API (Optional tapi recommended):**
   - Search: "People API"
   - Klik "Enable"

### 1.3 Buat OAuth 2.0 Credentials

1. **Navigate ke Credentials:**
   - Sidebar: "APIs & Services" > "Credentials"
   - Klik "Create Credentials"
   - Pilih "OAuth client ID"

2. **Configure Consent Screen (Jika belum):**
   - Klik "Configure Consent Screen"
   - User Type: **External**
   - Klik "Create"

3. **OAuth Consent Screen - App Information:**
   ```
   App name: Document Management System
   User support email: [your-email@gmail.com]
   App logo: (optional)
   
   Application home page: http://localhost:3000
   Application privacy policy link: (optional untuk testing)
   Application terms of service link: (optional untuk testing)
   
   Authorized domains: localhost
   
   Developer contact information: [your-email@gmail.com]
   ```
   - Klik "Save and Continue"

4. **Scopes:**
   - Klik "Add or Remove Scopes"
   - Pilih:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Klik "Update"
   - Klik "Save and Continue"

5. **Test Users (untuk External app):**
   - Klik "Add Users"
   - Tambahkan email Google Anda untuk testing
   - Klik "Save and Continue"

6. **Summary:**
   - Review informasi
   - Klik "Back to Dashboard"

### 1.4 Create OAuth Client ID

1. **Create Credentials:**
   - Kembali ke "Credentials"
   - Klik "Create Credentials" > "OAuth client ID"

2. **Application Type:**
   - Pilih: **Web application**

3. **Configure:**
   ```
   Name: Document Management OAuth Client
   
   Authorized JavaScript origins:
   - http://localhost:3000
   - http://localhost:3001 (jika ada frontend terpisah)
   
   Authorized redirect URIs:
   - http://localhost:3000/auth/google/callback
   - http://localhost:3001/auth/callback (jika ada frontend terpisah)
   ```
   - Klik "Create"

4. **Save Credentials:**
   - Copy **Client ID** (contoh: `123456789-abc.apps.googleusercontent.com`)
   - Copy **Client Secret** (contoh: `GOCSPX-abc123...`)
   - **PENTING:** Simpan credentials ini dengan aman!

---

## Step 2: Konfigurasi Environment Variables

### 2.1 Update File `.env`

Buka file `.env` dan update dengan credentials Anda:

```env
# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz456
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Frontend URL (untuk redirect setelah login)
FRONTEND_URL=http://localhost:3000
```

**⚠️ JANGAN commit file `.env` ke Git!** (sudah ada di `.gitignore`)

### 2.2 Verifikasi Konfigurasi

```powershell
# Cek apakah .env ter-load dengan benar
node -e "require('dotenv').config(); console.log('Client ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...');"
```

---

## Step 3: Testing Google OAuth

### 3.1 Restart Server

```powershell
# Stop server yang sedang berjalan (Ctrl+C)
# Jalankan ulang
node server.js
```

Output yang benar:
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

### 3.2 Test Endpoint Root

```powershell
Invoke-RestMethod -Uri "http://localhost:3000" -Method Get
```

Expected response harus menunjukkan:
```json
{
  "googleOAuth": {
    "status": "Configured ✅"
  }
}
```

### 3.3 Test Google OAuth Flow (Browser)

#### Method 1: Via Browser (Recommended untuk first test)

1. **Buka browser:**
   ```
   http://localhost:3000/auth/google
   ```

2. **Expected Flow:**
   - Browser redirect ke Google Login
   - Pilih akun Google Anda
   - Google akan minta izin akses (email, profile)
   - Klik "Allow"
   - Redirect kembali ke `http://localhost:3000/auth/google/callback`
   - Server return JSON dengan JWT tokens

3. **Expected Response:**
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

4. **Copy Access Token** untuk testing endpoint lain

#### Method 2: Via PowerShell (Untuk automated testing)

**Note:** Google OAuth via browser lebih mudah untuk first test. PowerShell bisa digunakan setelah mendapat token.

### 3.4 Test JWT Token dari Google Login

Setelah mendapat token dari Google login, test apakah token bisa digunakan:

```powershell
# Ganti YOUR_TOKEN_FROM_GOOGLE_LOGIN dengan token yang didapat
$token = "YOUR_TOKEN_FROM_GOOGLE_LOGIN"
$headers = @{ Authorization = "Bearer $token" }

# Test akses profile
Invoke-RestMethod -Uri "http://localhost:3000/profile" -Method Get -Headers $headers

# Test akses documents
Invoke-RestMethod -Uri "http://localhost:3000/documents" -Method Get -Headers $headers
```

Expected: ✅ Bisa akses semua protected endpoints

### 3.5 Verify User di Database

```powershell
# Login sebagai admin dulu
$body = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $body -ContentType "application/json"
$adminToken = $response.accessToken

# Lihat semua users (termasuk user Google yang baru login)
$headers = @{ Authorization = "Bearer $adminToken" }
Invoke-RestMethod -Uri "http://localhost:3000/admin/users" -Method Get -Headers $headers
```

Expected: ✅ User baru dengan provider='google' ada di list

---

## Step 4: Integrasi dengan Frontend

### 4.1 HTML + JavaScript Simple Test Page

Buat file `test-google-login.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Google Login Test</title>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
    <h1>Test Google OAuth 2.0</h1>
    
    <!-- Method 1: Server-side Flow -->
    <div>
        <h2>Method 1: Server-side OAuth Flow</h2>
        <a href="http://localhost:3000/auth/google">
            <button>Login with Google (Server-side)</button>
        </a>
    </div>

    <hr>

    <!-- Method 2: Client-side Flow (Google Sign-In Button) -->
    <div>
        <h2>Method 2: Client-side OAuth Flow</h2>
        <div id="g_id_onload"
             data-client_id="YOUR_GOOGLE_CLIENT_ID"
             data-callback="handleCredentialResponse">
        </div>
        <div class="g_id_signin" data-type="standard"></div>
    </div>

    <div id="result" style="margin-top: 20px; padding: 10px; background: #f0f0f0;"></div>

    <script>
        // Handle Google Sign-In response (Method 2)
        async function handleCredentialResponse(response) {
            console.log("Encoded JWT ID token: " + response.credential);
            
            // Send credential to our backend
            const result = await fetch('http://localhost:3000/auth/google/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credential: response.credential
                })
            });

            const data = await result.json();
            console.log('Backend response:', data);

            // Display result
            document.getElementById('result').innerHTML = `
                <h3>Login Success!</h3>
                <p><strong>User:</strong> ${data.user.username}</p>
                <p><strong>Email:</strong> ${data.user.email}</p>
                <p><strong>Role:</strong> ${data.user.role}</p>
                <p><strong>Access Token:</strong> ${data.accessToken.substring(0, 50)}...</p>
                <button onclick="testProtectedEndpoint('${data.accessToken}')">
                    Test Protected Endpoint
                </button>
            `;

            // Save token to localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
        }

        // Test protected endpoint
        async function testProtectedEndpoint(token) {
            const result = await fetch('http://localhost:3000/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await result.json();
            alert('Protected endpoint test: ' + JSON.stringify(data, null, 2));
        }
    </script>
</body>
</html>
```

**Cara menggunakan:**
1. Ganti `YOUR_GOOGLE_CLIENT_ID` dengan Client ID Anda
2. Buka file di browser: `file:///path/to/test-google-login.html`
3. Klik tombol "Login with Google"

### 4.2 React/Vue.js Integration Example

```javascript
// Example: React component
import { GoogleLogin } from '@react-oauth/google';

function LoginPage() {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:3000/auth/google/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: credentialResponse.credential
        })
      });

      const data = await response.json();
      
      // Save tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => console.log('Login Failed')}
    />
  );
}
```

---

## Step 5: Troubleshooting

### Error: "redirect_uri_mismatch"

**Penyebab:** Redirect URI di code tidak match dengan yang di Google Console

**Solusi:**
1. Cek `.env` file: `GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback`
2. Pastikan di Google Console ada exact URL yang sama
3. **PENTING:** URL harus exact match (termasuk http/https, port, trailing slash)

### Error: "invalid_client"

**Penyebab:** Client ID atau Client Secret salah

**Solusi:**
1. Cek kembali credentials di Google Console
2. Copy paste ulang ke `.env`
3. Restart server

### Error: "Access blocked: This app's request is invalid"

**Penyebab:** OAuth consent screen belum configured atau app masih dalam testing mode

**Solusi:**
1. Configure OAuth consent screen dengan lengkap
2. Tambahkan email Anda sebagai test user
3. Atau publish app (untuk production)

### Error: User tidak ter-save atau token tidak valid

**Penyebab:** JWT secret key berbeda atau user structure tidak sesuai

**Solusi:**
1. Cek `SECRET_KEY` di `.env` sama dengan yang digunakan server
2. Restart server setelah update `.env`
3. Clear browser cache/cookies

---

## Step 6: Security Best Practices

### 6.1 Environment Variables

✅ **DO:**
- Gunakan `.env` file untuk credentials
- Tambahkan `.env` ke `.gitignore`
- Gunakan environment variables yang berbeda untuk dev/production

❌ **DON'T:**
- Hardcode credentials di code
- Commit `.env` ke Git
- Share credentials di public

### 6.2 Token Management

✅ **DO:**
- Set expiry time untuk tokens
- Implement refresh token rotation
- Validate tokens di setiap request

❌ **DON'T:**
- Store tokens di URL atau localStorage tanpa encryption
- Use tokens tanpa expiry
- Skip token validation

### 6.3 HTTPS di Production

⚠️ **IMPORTANT:**
```
Development: http://localhost:3000 ✅
Production: https://yourdomain.com ✅ HTTPS REQUIRED!
```

Google OAuth **REQUIRES HTTPS** di production (kecuali localhost).

---

## 📋 Checklist Setup

- [ ] Google Cloud Project dibuat
- [ ] OAuth Consent Screen configured
- [ ] OAuth Client ID created
- [ ] Credentials copied ke `.env`
- [ ] Redirect URI match antara code dan Google Console
- [ ] Server restarted setelah update `.env`
- [ ] Test user ditambahkan (untuk external app)
- [ ] Browser test: `/auth/google` berhasil
- [ ] Token dari Google bisa digunakan untuk akses API
- [ ] User Google ter-save di database

---

## 🎯 Next Steps

Setelah Google OAuth working:
1. ✅ Implement frontend login page
2. ✅ Add more OAuth providers (Facebook, GitHub, etc)
3. ✅ Implement user profile page with avatar
4. ✅ Add role management for OAuth users
5. ✅ Implement account linking (Google + local account)

---

## 📞 Support

Jika ada masalah:
1. Cek console logs di terminal server
2. Cek browser console untuk errors
3. Verify credentials di Google Console
4. Cek `.env` file configuration
5. Restart server

---

**Created:** 21 Oktober 2025  
**Version:** 2.0.0  
**Status:** Ready for Testing
