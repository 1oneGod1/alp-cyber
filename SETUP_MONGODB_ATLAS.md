# 🗄️ Setup MongoDB Atlas (Cloud Database - GRATIS)

## 📋 Langkah-Langkah Setup (5 Menit)

### **Step 1: Buat Account MongoDB Atlas**

1. Buka: https://www.mongodb.com/cloud/atlas/register
2. Klik **"Sign Up"** atau **"Try Free"**
3. Isi form registrasi:
   - Email Anda
   - Password
   - First Name & Last Name
4. Atau gunakan **Google Account** untuk sign up lebih cepat ✅
5. Klik **"Create your Atlas account"**

---

### **Step 2: Buat Cluster (Database)**

1. Setelah login, Anda akan masuk ke dashboard
2. Klik **"Build a Database"** atau **"Create"**
3. Pilih **"M0 FREE"** (Shared cluster - GRATIS selamanya)
   - ✅ 512 MB Storage (cukup untuk assignment)
   - ✅ Shared RAM
   - ✅ No credit card required
4. Pilih **Cloud Provider**:
   - Pilih **AWS** (recommended)
   - Region: **Singapore (ap-southeast-1)** atau **Mumbai** (paling dekat ke Indonesia)
5. Cluster Name: biarkan default atau ganti jadi `MyFirstCluster`
6. Klik **"Create Cluster"** (tunggu 3-5 menit untuk provisioning)

---

### **Step 3: Setup Database Access (User & Password)**

1. Setelah cluster dibuat, klik tab **"Database Access"** di menu kiri
2. Klik **"Add New Database User"**
3. Isi credential:
   - **Authentication Method**: Password
   - **Username**: `dbadmin` (atau terserah Anda)
   - **Password**: klik **"Autogenerate Secure Password"** lalu **COPY & SIMPAN**
     - Contoh: `XyZ123abc456DEF`
   - **Database User Privileges**: Pilih **"Read and write to any database"**
4. Klik **"Add User"**

⚠️ **PENTING**: Simpan username & password ini! Anda akan butuh nanti.

---

### **Step 4: Setup Network Access (IP Whitelist)**

1. Klik tab **"Network Access"** di menu kiri
2. Klik **"Add IP Address"**
3. Pilih **"Allow Access from Anywhere"** (untuk development)
   - IP Address: `0.0.0.0/0`
   - Description: `Allow all`
4. Klik **"Confirm"**

⚠️ **Note**: Untuk production, Anda harus whitelist IP spesifik Anda saja.

---

### **Step 5: Dapatkan Connection String**

1. Kembali ke tab **"Database"** di menu kiri
2. Klik tombol **"Connect"** pada cluster Anda
3. Pilih **"Connect your application"**
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy **Connection String**:

```
mongodb+srv://dbadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **Replace `<password>`** dengan password yang Anda simpan di Step 3
8. **Tambahkan database name** setelah `.net/`:

```
mongodb+srv://dbadmin:XyZ123abc456DEF@cluster0.xxxxx.mongodb.net/document-management?retryWrites=true&w=majority
```

---

### **Step 6: Update .env File**

1. Buka file `.env` di project Anda
2. Update `MONGODB_URI` dengan connection string dari Step 5:

```env
MONGODB_URI=mongodb+srv://dbadmin:XyZ123abc456DEF@cluster0.xxxxx.mongodb.net/document-management?retryWrites=true&w=majority
```

**Contoh lengkap `.env`:**

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration (ATLAS)
MONGODB_URI=mongodb+srv://dbadmin:XyZ123abc456DEF@cluster0.abc123.mongodb.net/document-management?retryWrites=true&w=majority

# JWT Secret Key
SECRET_KEY=my-super-secret-key-2024-change-this-in-production

# Google OAuth 2.0 (optional - bisa dikosongkan dulu)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Logging Configuration
LOG_LEVEL=info
```

---

### **Step 7: Test Connection**

Jalankan server Anda:

```powershell
npm run start:v2
```

Anda harus melihat output:

```
[INFO] MongoDB connected successfully: document-management
[INFO] Server running on port 3000
[INFO] Environment: development
[INFO] API Documentation available at http://localhost:3000/api-docs
```

✅ **SUKSES!** MongoDB Atlas terkoneksi!

---

## 🎯 Quick Commands

```powershell
# 1. Seed database dengan data sample
node seed.js

# 2. Start server
npm run start:v2

# 3. Test di browser
# Buka: http://localhost:3000
```

---

## 🔍 Troubleshooting

### Error: "MongoNetworkError: failed to connect to server"

**Solusi:**
1. Pastikan IP Address sudah di-whitelist (`0.0.0.0/0`)
2. Cek connection string di `.env` (pastikan password benar)
3. Pastikan tidak ada special characters di password yang belum di-encode

### Error: "Authentication failed"

**Solusi:**
1. Cek username & password di Database Access
2. Pastikan password di connection string sudah benar
3. Jika password ada special characters (`@`, `#`, `%`, dll), encode dengan:
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`

### Connection String Format

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Replace:**
- `<username>` → username Anda (contoh: `dbadmin`)
- `<password>` → password Anda (contoh: `XyZ123abc456DEF`)
- `<cluster>` → cluster URL Anda (contoh: `cluster0.abc123`)
- `<database>` → nama database (contoh: `document-management`)

---

## 📊 Monitoring Database

### Melihat Data di MongoDB Atlas

1. Login ke https://cloud.mongodb.com
2. Klik **"Database"** → pilih cluster Anda
3. Klik **"Browse Collections"**
4. Anda akan melihat:
   - `users` collection (data user)
   - `documents` collection (data dokumen)
   - `auditlogs` collection (audit trail)

---

## 🎉 Selesai!

Sekarang Anda sudah punya:
- ✅ MongoDB Atlas account (gratis)
- ✅ Database cluster
- ✅ Connection string
- ✅ Aplikasi terkoneksi ke database

**Next Step:** Jalankan `node seed.js` untuk populate data sample!

---

## 💡 Tips

1. **Free Tier Limits**:
   - 512 MB storage
   - Cukup untuk ratusan ribu documents
   - Perfect untuk assignment & development

2. **Cluster Management**:
   - Cluster akan tetap aktif 24/7
   - Tidak perlu start/stop seperti MongoDB local

3. **Security**:
   - Untuk production: whitelist IP spesifik
   - Untuk development: `0.0.0.0/0` OK

---

**Butuh bantuan?** Tanya aja! 😊
