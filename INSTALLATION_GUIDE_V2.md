# 📦 INSTALLATION GUIDE - Version 2.0

## Panduan Instalasi Lengkap Step-by-Step

---

## 🎯 Prerequisites

### Yang Harus Sudah Terinstall:
- [ ] **Node.js** v14 atau lebih tinggi
  - Download: https://nodejs.org/
  - Recommended: LTS version
  
- [ ] **Package Manager** (salah satu):
  - pnpm (recommended) - https://pnpm.io/
  - npm (bundled with Node.js)
  - yarn - https://yarnpkg.com/
  
- [ ] **MongoDB** (salah satu):
  - MongoDB Community Edition (local)
  - MongoDB Atlas (cloud - free tier)

### Optional:
- [ ] Git (untuk version control)
- [ ] Postman (untuk API testing)
- [ ] VS Code (recommended code editor)

---

## 📥 STEP 1: Install Node.js

### Windows:
1. Download installer dari https://nodejs.org/
2. Run installer
3. Check installation:
```powershell
node --version
npm --version
```

Expected output:
```
v20.x.x (atau lebih tinggi)
10.x.x (atau lebih tinggi)
```

---

## 📥 STEP 2: Install pnpm (Recommended)

```powershell
npm install -g pnpm
```

Verify:
```powershell
pnpm --version
```

**Kenapa pnpm?**
- ✅ Lebih cepat dari npm
- ✅ Lebih hemat disk space
- ✅ Lebih reliable

---

## 📥 STEP 3: Install MongoDB

### Option A: Local Installation (Recommended untuk Development)

#### Windows:
1. Download MongoDB Community Server:
   https://www.mongodb.com/try/download/community

2. Run installer:
   - Pilih "Complete" installation
   - Install MongoDB as a Service ✅
   - Install MongoDB Compass (optional GUI)

3. Verify installation:
```powershell
mongod --version
```

4. Start MongoDB:
```powershell
# MongoDB should auto-start as service
# Or manually start:
mongod
```

---

### Option B: MongoDB Atlas (Cloud - Free)

1. **Sign up** di https://www.mongodb.com/cloud/atlas

2. **Create Free Cluster**:
   - Click "Build a Database"
   - Choose "FREE" tier
   - Select cloud provider & region (closest to you)
   - Click "Create Cluster"

3. **Setup Database Access**:
   - Click "Database Access" (left sidebar)
   - Add New Database User
   - Set username & password
   - Set role: "Read and write to any database"

4. **Setup Network Access**:
   - Click "Network Access"
   - Add IP Address
   - For development: "Allow Access from Anywhere" (0.0.0.0/0)

5. **Get Connection String**:
   - Click "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your actual password
   
   Example:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/document-management?retryWrites=true&w=majority
   ```

---

## 📥 STEP 4: Setup Project

### Navigate to Project Directory:
```powershell
cd "d:\ALP Cyber\alp-cyber"
```

### Install Dependencies:
```powershell
pnpm install
```

**This will install**:
- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- express-validator - Input validation
- express-rate-limit - Rate limiting
- winston - Logging
- swagger-ui-express - API docs
- jest - Testing
- And more...

**Expected time**: 2-3 minutes

---

## ⚙️ STEP 5: Configure Environment

### Create .env file:
```powershell
Copy-Item .env.example .env
```

### Edit .env:
```powershell
notepad .env
```

### Configuration:

#### For Local MongoDB:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/document-management
SECRET_KEY=your-very-secure-secret-key-12345
LOG_LEVEL=info
```

#### For MongoDB Atlas:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/document-management?retryWrites=true&w=majority
SECRET_KEY=your-very-secure-secret-key-12345
LOG_LEVEL=info
```

**IMPORTANT**: 
- Replace `SECRET_KEY` with a strong random string
- Replace MongoDB Atlas credentials

### Generate Secret Key (Optional):
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🌱 STEP 6: Seed Database

```powershell
node seed.js
```

**Expected output**:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
✅ Created users
✅ Created documents

📊 Database Seeded Successfully!

=== Default Users ===
Admin:
  Username: admin
  Email: admin@example.com
  Password: Admin123
  Role: admin

User 1:
  Username: johndoe
  Email: john@example.com
  Password: User123
  Role: user
...
```

---

## 🚀 STEP 7: Start Server

### Start Version 2.0 (Full Features):
```powershell
npm run start:v2
```

### Or with Auto-Reload (Development):
```powershell
npm run dev:v2
```

**Expected output**:
```
✅ MongoDB Connected: localhost
🚀 Server running on http://localhost:3000
📚 API Documentation: http://localhost:3000/api-docs
📊 Database: MongoDB
🔐 Security: JWT + OAuth2.0
✅ Features: RBAC, ABAC, Audit Logging, Rate Limiting
```

---

## ✅ STEP 8: Verify Installation

### Test 1: Access Frontend
Open browser: http://localhost:3000

Expected: Login/Register page

### Test 2: Access API Docs
Open browser: http://localhost:3000/api-docs

Expected: Swagger UI

### Test 3: API Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3000" -Method Get
```

Expected: JSON response with API info

### Test 4: Login Test
```powershell
$body = @{
    username = "admin"
    password = "Admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

Expected: JSON with accessToken and user info

---

## 🧪 STEP 9: Run Tests (Optional)

```powershell
npm test
```

**Expected**: All tests pass ✅

---

## 🎉 Installation Complete!

### You now have:
- ✅ Node.js environment
- ✅ MongoDB database
- ✅ All dependencies installed
- ✅ Environment configured
- ✅ Database seeded
- ✅ Server running
- ✅ Tests passing

### Access URLs:
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **API Root**: http://localhost:3000

### Default Login:
- **Admin**: username: `admin`, password: `Admin123`
- **User**: username: `johndoe`, password: `User123`

---

## 🔧 Troubleshooting

### Problem: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions**:
1. Make sure MongoDB service is running
2. Check MONGODB_URI in .env
3. Try MongoDB Atlas instead

### Problem: Port Already in Use
```
Error: listen EADDRINUSE :::3000
```

**Solution**: Change port in .env
```env
PORT=3001
```

### Problem: pnpm not found
```
pnpm : The term 'pnpm' is not recognized
```

**Solution**:
```powershell
npm install -g pnpm
# Or use npm instead:
npm install
```

### Problem: Dependencies Installation Failed
```
Error: Cannot find module 'express'
```

**Solution**:
```powershell
# Clear and reinstall
Remove-Item -Recurse -Force node_modules
pnpm install
```

### Problem: Tests Failing
```
Error: Cannot connect to test database
```

**Solution**:
1. Make sure MongoDB is running
2. Add to .env:
```env
MONGODB_URI_TEST=mongodb://localhost:27017/document-management-test
```

---

## 📚 Next Steps

1. ✅ Read `README_COMPLETE.md` for full documentation
2. ✅ Read `QUICK_START_V2.md` for usage guide
3. ✅ Explore API docs at http://localhost:3000/api-docs
4. ✅ Try frontend at http://localhost:3000
5. ✅ Run tests: `npm test`

---

## 🆘 Need Help?

### Check Documentation:
- `README_COMPLETE.md` - Complete guide
- `QUICK_START_V2.md` - Quick start
- `CHECKLIST_RUBRIK.md` - Features checklist

### Common Commands:
```powershell
# Start server
npm run start:v2

# Start with auto-reload
npm run dev:v2

# Run tests
npm test

# Seed database
node seed.js

# Clear logs
Remove-Item -Recurse -Force logs
```

---

**Installation Time**: ~15-20 minutes  
**Difficulty**: Easy  
**Support**: Full documentation available

Good luck! 🚀
