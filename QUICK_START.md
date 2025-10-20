# 🚀 Quick Start Guide

## ⚠️ PENTING: npm Anda Bermasalah!

npm di Node.js v24.0.1 Anda mengalami error. Ada 2 pilihan:

---

## ✅ PILIHAN 1: Download Node.js LTS (REKOMENDASI)

1. **Download Node.js LTS:**
   - Buka: https://nodejs.org/
   - Pilih versi **LTS** (Long Term Support) - versi 20.x.x atau 18.x.x
   - Download dan install

2. **Verifikasi Instalasi:**
   ```powershell
   node --version
   npm --version
   ```

3. **Install Dependencies:**
   ```powershell
   cd "e:\Semester 4\Cyber\ALP"
   npm install
   ```

4. **Jalankan Server:**
   ```powershell
   node server.js
   ```

5. **Testing:**
   - Import `Postman_Collection.json` ke Postman
   - Atau lihat `TESTING_MANUAL.md` untuk testing tanpa Postman

---

## ✅ PILIHAN 2: Install Dependencies Manual

Jika tidak bisa downgrade Node.js, install dependencies secara manual:

### Step 1: Buat folder node_modules
```powershell
cd "e:\Semester 4\Cyber\ALP"
mkdir node_modules
```

### Step 2: Download packages

Buka browser dan download file berikut:

1. **express**: https://registry.npmjs.org/express/-/express-4.18.2.tgz
2. **jsonwebtoken**: https://registry.npmjs.org/jsonwebtoken/-/jsonwebtoken-9.0.2.tgz
3. **bcryptjs**: https://registry.npmjs.org/bcryptjs/-/bcryptjs-2.4.3.tgz

### Step 3: Extract ke node_modules

Extract setiap file .tgz ke folder `node_modules`:
- express-4.18.2.tgz → node_modules/express/
- jsonwebtoken-9.0.2.tgz → node_modules/jsonwebtoken/
- bcryptjs-2.4.3.tgz → node_modules/bcryptjs/

### Step 4: Install dependencies dari dependencies

Packages di atas juga punya dependencies. Yang paling mudah:

**Install pnpm dulu** (lebih reliable dari npm):
```powershell
# Download pnpm installer
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

Lalu:
```powershell
pnpm install
```

---

## ✅ PILIHAN 3: Menggunakan Docker (Advanced)

Jika familiar dengan Docker:

```powershell
# Buat Dockerfile
@"
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
CMD ["node", "server.js"]
"@ | Out-File -FilePath Dockerfile -Encoding utf8

# Build dan run
docker build -t document-management .
docker run -p 3000:3000 document-management
```

---

## 📋 Setelah Dependencies Terinstall

### 1. Jalankan Server
```powershell
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

### 2. Test Server
Buka browser: http://localhost:3000

Atau di PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000"
```

### 3. Testing dengan Postman

**Import Collection:**
1. Buka Postman
2. Klik "Import"
3. Pilih file: `Postman_Collection.json`
4. Buat Environment dengan variable:
   - `base_url`: `http://localhost:3000`

**Urutan Testing:**
1. ✅ Login sebagai Admin
2. ✅ Login sebagai User  
3. ✅ Admin akses `/admin/users` → Status 200
4. ❌ User akses `/admin/users` → Status 403 (Expected)
5. ✅ Buat dokumen sebagai admin dan user
6. ❌ User hapus dokumen admin → Status 403 (Expected)
7. ✅ User hapus dokumen sendiri → Status 200
8. ✅ Admin hapus dokumen siapapun → Status 200

---

## 🎯 Struktur Project Akhir

```
e:\Semester 4\Cyber\ALP\
├── node_modules/          ← Harus ada setelah install
├── .env
├── .gitignore
├── package.json
├── server.js             ← Main file
├── README.md
├── INSTALL_GUIDE.md
├── QUICK_START.md        ← File ini
├── TESTING_MANUAL.md
├── Postman_Collection.json
└── generate-password.js
```

---

## 🐛 Troubleshooting

### Error: Cannot find module 'express'
Dependencies belum terinstall. Kembali ke langkah instalasi.

### Error: EADDRINUSE
Port 3000 sudah digunakan. Ganti port di server.js atau matikan aplikasi yang menggunakan port 3000.

### Error: Token tidak valid
Token expired (berlaku 1 jam). Login ulang untuk dapat token baru.

### Password tidak cocok
Gunakan password default:
- Admin: `admin123`
- User: `user123`

---

## 📞 Next Steps

Setelah testing berhasil:
1. ✅ Pastikan semua test RBAC & ABAC berhasil
2. 📝 Screenshot hasil testing untuk dokumentasi
3. 🎓 Pahami konsep JWT, RBAC, dan ABAC dari code
4. 🚀 Lanjut ke Langkah 2: Integrasi Database

---

**Semoga berhasil! 🎉**
