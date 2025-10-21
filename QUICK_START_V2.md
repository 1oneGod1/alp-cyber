# 🚀 QUICK START GUIDE - Version 2.0

## Langkah Cepat Menjalankan Aplikasi (5 Menit)

### 📋 Prerequisites
- ✅ Node.js installed
- ✅ MongoDB installed (atau gunakan MongoDB Atlas)
- ✅ pnpm/npm installed

---

## 🎯 Setup Langkah-per-Langkah

### 1️⃣ Install Dependencies
```powershell
cd "d:\ALP Cyber\alp-cyber"
pnpm install
```

**Catatan**: Jika pnpm tidak ada, gunakan:
```powershell
npm install
```

---

### 2️⃣ Setup MongoDB

#### Option A: Local MongoDB
```powershell
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Sign up di https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `.env` dengan connection string

---

### 3️⃣ Configure Environment Variables

Edit file `.env`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/document-management
SECRET_KEY=your-secret-key-change-this
```

**PENTING**: Jika pakai MongoDB Atlas, ubah MONGODB_URI

---

### 4️⃣ Seed Database (Optional tapi Recommended)
```powershell
node seed.js
```

Ini akan membuat:
- ✅ Admin user (username: `admin`, password: `Admin123`)
- ✅ Regular users (username: `johndoe`, password: `User123`)
- ✅ Sample documents

---

### 5️⃣ Start Server

#### Versi 2.0 (dengan semua fitur lengkap):
```powershell
node server-v2.js
```

#### Atau dengan auto-reload:
```powershell
npm run dev
```

**Expected Output**:
```
✅ MongoDB Connected: localhost
🚀 Server running on http://localhost:3000
📚 API Documentation: http://localhost:3000/api-docs
```

---

## 🎉 Aplikasi Sudah Jalan!

### Akses:
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **API Root**: http://localhost:3000

---

## 🧪 Testing Cepat

### Via Frontend
1. Buka http://localhost:3000
2. Login dengan:
   - Username: `admin`
   - Password: `Admin123`
3. Create document
4. Test features

### Via Postman
1. Import `Postman_Collection_v2_OAuth.json`
2. Set environment variable `base_url` = `http://localhost:3000`
3. Run collection

### Via Terminal (PowerShell)
```powershell
# Test root endpoint
Invoke-RestMethod -Uri "http://localhost:3000" -Method Get

# Test login
$body = @{
    username = "admin"
    password = "Admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# Save token
$token = $response.accessToken

# Test protected endpoint
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3000/documents" `
    -Method Get `
    -Headers $headers
```

---

## 🧪 Run Tests
```powershell
# Run all tests
npm test

# Run dengan watch mode
npm run test:watch
```

---

## 📊 Default Users

| Username | Password | Role | Email |
|----------|----------|------|-------|
| admin | Admin123 | admin | admin@example.com |
| johndoe | User123 | user | john@example.com |
| janedoe | User123 | user | jane@example.com |
| moderator | Mod123 | moderator | mod@example.com |

---

## 🔍 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: 
- Make sure MongoDB is running: `mongod`
- Or use MongoDB Atlas dan update `.env`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:
```powershell
# Change port in .env
PORT=3001
```

### Dependencies Error
```
Error: Cannot find module 'express'
```

**Solution**:
```powershell
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
pnpm install
```

---

## 📚 Next Steps

1. ✅ Explore API Documentation: http://localhost:3000/api-docs
2. ✅ Read complete guide: `README_COMPLETE.md`
3. ✅ Check rubrik: `CHECKLIST_RUBRIK.md`
4. ✅ Run tests: `npm test`

---

## 🎯 Demo Scenarios

### Scenario 1: JWT Authentication
```powershell
# 1. Login
$login = @{
    username = "admin"
    password = "Admin123"
} | ConvertTo-Json

$res = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
    -Method Post -ContentType "application/json" -Body $login

# 2. Use token
$headers = @{ Authorization = "Bearer $($res.accessToken)" }
Invoke-RestMethod -Uri "http://localhost:3000/profile" -Headers $headers
```

### Scenario 2: RBAC Test
```powershell
# As regular user, try to access admin endpoint
$userLogin = @{
    username = "johndoe"
    password = "User123"
} | ConvertTo-Json

$userRes = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
    -Method Post -ContentType "application/json" -Body $userLogin

$userHeaders = @{ Authorization = "Bearer $($userRes.accessToken)" }

# This should return 403 Forbidden
Invoke-RestMethod -Uri "http://localhost:3000/admin/users" -Headers $userHeaders
```

### Scenario 3: Create Document
```powershell
$doc = @{
    title = "My Test Document"
    content = "This is a test document content"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/documents" `
    -Method Post `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $doc
```

---

## ✅ Verification Checklist

Before submitting, verify:
- [ ] MongoDB connected successfully
- [ ] Server running on port 3000
- [ ] Can access frontend (http://localhost:3000)
- [ ] Can access API docs (http://localhost:3000/api-docs)
- [ ] Can login as admin
- [ ] Can create documents
- [ ] Tests passing (`npm test`)
- [ ] Logs created in `logs/` folder

---
