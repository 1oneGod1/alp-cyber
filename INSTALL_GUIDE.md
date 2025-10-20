# Panduan Instalasi - Sistem Manajemen Dokumen

## ⚠️ Masalah npm di Node.js v24.0.1

Saat ini npm di Node.js v24.0.1 Anda mengalami masalah. Berikut beberapa solusi alternatif:

## Solusi 1: Downgrade Node.js (REKOMENDASI)

Node.js v24.0.1 masih bleeding edge dan mungkin tidak stabil. Disarankan menggunakan versi LTS.

### Windows:

1. Download Node.js LTS dari https://nodejs.org/ (versi 20.x.x atau 18.x.x)
2. Install seperti biasa
3. Verifikasi instalasi:
```bash
node --version
npm --version
```
4. Install dependencies:
```bash
cd "e:\Semester 4\Cyber\ALP"
npm install
```

## Solusi 2: Menggunakan pnpm

pnpm adalah alternatif npm yang lebih cepat dan reliable.

### Install pnpm:
```powershell
# Via npm (jika npm masih bisa digunakan sedikit)
npm install -g pnpm

# ATAU via PowerShell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

### Install dependencies dengan pnpm:
```bash
cd "e:\Semester 4\Cyber\ALP"
pnpm install
```

### Jalankan server:
```bash
pnpm start
```

## Solusi 3: Install Manual Dependencies

Jika npm benar-benar tidak bisa digunakan, Anda bisa install dependencies secara manual:

1. Buat folder `node_modules` di root project
2. Download packages dari npmjs.com:
   - express@4.18.2
   - jsonwebtoken@9.0.2
   - bcryptjs@2.4.3

### Atau gunakan npx (biasanya lebih stabil):
```bash
npx npm@latest install
```

## Solusi 4: Menggunakan Yarn

### Install Yarn:
```powershell
# Via npm
npm install -g yarn

# Atau download installer dari https://classic.yarnpkg.com/
```

### Install dependencies:
```bash
cd "e:\Semester 4\Cyber\ALP"
yarn install
```

### Jalankan server:
```bash
yarn start
```

## Solusi 5: Reset npm Cache

Kadang masalah npm bisa diselesaikan dengan reset cache:

```bash
npm cache clean --force
npm config set registry https://registry.npmjs.org/
```

Lalu coba install lagi:
```bash
npm install
```

## ✅ Verifikasi Instalasi Berhasil

Setelah dependencies terinstall, Anda harus punya folder `node_modules` dengan struktur seperti ini:

```
e:\Semester 4\Cyber\ALP\
├── node_modules/
│   ├── express/
│   ├── jsonwebtoken/
│   ├── bcryptjs/
│   └── ... (dependencies lainnya)
├── package.json
├── server.js
└── README.md
```

## 🚀 Menjalankan Server

Setelah instalasi berhasil:

```bash
# Masuk ke direktori project
cd "e:\Semester 4\Cyber\ALP"

# Jalankan server
node server.js
```

Atau dengan npm:
```bash
npm start
```

Anda akan melihat output:
```
Server berjalan di http://localhost:3000

=== Informasi Login Default ===
Admin - username: admin, password: admin123
User  - username: user, password: user123
================================
```

## 🧪 Testing dengan Postman

1. **Import Collection:**
   - Buka Postman
   - Klik "Import"
   - Pilih file `Postman_Collection.json`

2. **Setup Environment:**
   - Buat environment baru: "Document Management"
   - Tambahkan variable:
     - `base_url`: `http://localhost:3000`
     - `access_token`: (kosongkan)
     - `admin_token`: (kosongkan)
     - `user_token`: (kosongkan)

3. **Jalankan Tests:**
   - Klik "Runner" atau "Collection Runner"
   - Pilih collection yang sudah diimport
   - Pilih environment yang sudah dibuat
   - Klik "Run"

## 📋 Checklist Testing RBAC & ABAC

Setelah server berjalan, lakukan testing berikut:

### ✅ Test 1: Registrasi User Baru
- [x] POST `/auth/register`
- Expected: Status 201

### ✅ Test 2: Login sebagai Admin
- [x] POST `/auth/login` dengan username: admin, password: admin123
- Expected: Status 200, dapat access token

### ✅ Test 3: Login sebagai User
- [x] POST `/auth/login` dengan username: user, password: user123
- Expected: Status 200, dapat access token

### ✅ Test 4: RBAC - Admin akses /admin/users
- [x] GET `/admin/users` dengan admin token
- Expected: Status 200 (SUKSES) ✅

### ❌ Test 5: RBAC - User akses /admin/users
- [x] GET `/admin/users` dengan user token
- Expected: Status 403 Forbidden (GAGAL) ❌

### ✅ Test 6: ABAC - Buat dokumen
- [x] POST `/documents` sebagai admin
- [x] POST `/documents` sebagai user
- Expected: Kedua berhasil (Status 201)

### ❌ Test 7: ABAC - User hapus dokumen Admin
- [x] DELETE `/documents/1` (dokumen admin) dengan user token
- Expected: Status 403 Forbidden (GAGAL) ❌

### ✅ Test 8: ABAC - User hapus dokumen sendiri
- [x] DELETE `/documents/2` (dokumen user) dengan user token
- Expected: Status 200 (SUKSES) ✅

### ✅ Test 9: ABAC - Admin hapus dokumen siapapun
- [x] DELETE `/documents/2` (dokumen user) dengan admin token
- Expected: Status 200 (SUKSES) ✅

## 🐛 Troubleshooting

### Server tidak jalan?
- Pastikan port 3000 tidak digunakan aplikasi lain
- Coba ganti port di `server.js` (ubah `const PORT = 3000;`)

### Token tidak valid?
- Pastikan menggunakan format: `Bearer <token>` di header Authorization
- Pastikan token tidak expired (berlaku 1 jam)
- Login ulang untuk dapat token baru

### Password tidak cocok?
- Default passwords sudah di-hash dengan bcrypt
- Gunakan password yang benar:
  - Admin: `admin123`
  - User: `user123`

## 📞 Bantuan Lebih Lanjut

Jika masih ada masalah, silakan:
1. Cek console untuk error messages
2. Pastikan semua dependencies terinstall
3. Pastikan menggunakan Node.js versi yang kompatibel (LTS recommended)

---

**Good luck dengan testing! 🚀**
