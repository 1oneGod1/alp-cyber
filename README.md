# Sistem Manajemen Dokumen Internal Perusahaan

Aplikasi backend untuk mengelola dokumen internal perusahaan dengan fitur autentikasi JWT, RBAC (Role-Based Access Control), dan ABAC (Attribute-Based Access Control).

## 📋 Fitur Utama

- ✅ **Autentikasi JWT**: Registrasi, Login, Refresh Token
- ✅ **RBAC**: Kontrol akses berdasarkan role (Admin, User)
- ✅ **ABAC**: Kontrol akses berdasarkan kepemilikan resource
- ✅ **Manajemen Dokumen**: CRUD operations untuk dokumen
- ✅ **User Management**: Admin dapat mengelola semua user

## 🛠️ Teknologi yang Digunakan

- **Express.js**: Web framework untuk Node.js
- **JSON Web Token (JWT)**: Untuk autentikasi
- **bcryptjs**: Untuk hashing password

## 📦 Instalasi

1. Clone repository atau download project
2. Install dependencies:

```bash
npm install
```

3. Jalankan server:

```bash
npm start
```

Atau untuk development dengan auto-reload:

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 👥 Default Users

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | admin |
| user     | user123   | user  |

## 📝 API Endpoints

### Authentication

#### 1. Register User Baru
- **POST** `/auth/register`
- **Body**:
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "user"
}
```

#### 2. Login
- **POST** `/auth/login`
- **Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```
- **Response**:
```json
{
  "message": "Login berhasil",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

#### 3. Refresh Token
- **POST** `/auth/refresh`
- **Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Admin Routes (RBAC - Admin Only)

#### 4. Lihat Semua User
- **GET** `/admin/users`
- **Headers**: `Authorization: Bearer <access_token>`
- **Role Required**: Admin

#### 5. Hapus User
- **DELETE** `/admin/users/:id`
- **Headers**: `Authorization: Bearer <access_token>`
- **Role Required**: Admin

### Document Routes (RBAC + ABAC)

#### 6. Lihat Semua Dokumen
- **GET** `/documents`
- **Headers**: `Authorization: Bearer <access_token>`
- Admin: melihat semua dokumen
- User: hanya melihat dokumen miliknya

#### 7. Lihat Detail Dokumen
- **GET** `/documents/:id`
- **Headers**: `Authorization: Bearer <access_token>`
- ABAC: Hanya owner atau admin yang bisa akses

#### 8. Buat Dokumen Baru
- **POST** `/documents`
- **Headers**: `Authorization: Bearer <access_token>`
- **Body**:
```json
{
  "title": "Judul Dokumen",
  "content": "Isi dokumen..."
}
```

#### 9. Update Dokumen
- **PUT** `/documents/:id`
- **Headers**: `Authorization: Bearer <access_token>`
- **Body**:
```json
{
  "title": "Judul Baru",
  "content": "Isi baru..."
}
```
- ABAC: Hanya owner atau admin yang bisa update

#### 10. Hapus Dokumen
- **DELETE** `/documents/:id`
- **Headers**: `Authorization: Bearer <access_token>`
- ABAC: Hanya owner atau admin yang bisa hapus

### Profile Routes

#### 11. Lihat Profil Sendiri
- **GET** `/profile`
- **Headers**: `Authorization: Bearer <access_token>`

#### 12. Update Profil
- **PUT** `/profile`
- **Headers**: `Authorization: Bearer <access_token>`
- **Body**:
```json
{
  "username": "newusername",
  "password": "newpassword"
}
```

## 🧪 Testing dengan Postman

### Step 1: Setup Environment di Postman

1. Buka Postman
2. Buat Environment baru dengan nama "Document Management"
3. Tambahkan variables:
   - `base_url`: `http://localhost:3000`
   - `access_token`: (kosongkan dulu)
   - `admin_token`: (kosongkan dulu)
   - `user_token`: (kosongkan dulu)

### Step 2: Test Registrasi User Baru

**Request:**
- Method: `POST`
- URL: `{{base_url}}/auth/register`
- Body (JSON):
```json
{
  "username": "testuser",
  "password": "test123",
  "role": "user"
}
```

**Expected Response:** Status 201
```json
{
  "message": "Registrasi berhasil",
  "user": {
    "id": 3,
    "username": "testuser",
    "role": "user"
  }
}
```

### Step 3: Test Login sebagai Admin

**Request:**
- Method: `POST`
- URL: `{{base_url}}/auth/login`
- Body (JSON):
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Expected Response:** Status 200
```json
{
  "message": "Login berhasil",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  ...
}
```

**Postman Tests Script** (tambahkan di tab "Tests"):
```javascript
// Simpan access token ke environment variable
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("admin_token", jsonData.accessToken);
    pm.environment.set("access_token", jsonData.accessToken);
}
```

### Step 4: Test Login sebagai User

**Request:**
- Method: `POST`
- URL: `{{base_url}}/auth/login`
- Body (JSON):
```json
{
  "username": "user",
  "password": "user123"
}
```

**Postman Tests Script**:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("user_token", jsonData.accessToken);
}
```

### Step 5: Test RBAC - Akses /admin/users sebagai Admin (SUKSES)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/admin/users`
- Headers:
  - `Authorization`: `Bearer {{admin_token}}`

**Expected Response:** Status 200 ✅
```json
{
  "message": "Daftar semua user",
  "users": [...]
}
```

### Step 6: Test RBAC - Akses /admin/users sebagai User (GAGAL)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/admin/users`
- Headers:
  - `Authorization`: `Bearer {{user_token}}`

**Expected Response:** Status 403 ❌
```json
{
  "message": "Akses ditolak. Anda tidak memiliki izin untuk mengakses resource ini.",
  "requiredRole": ["admin"],
  "yourRole": "user"
}
```

### Step 7: Test ABAC - Buat Dokumen sebagai Admin

**Request:**
- Method: `POST`
- URL: `{{base_url}}/documents`
- Headers:
  - `Authorization`: `Bearer {{admin_token}}`
- Body:
```json
{
  "title": "Dokumen Admin Test",
  "content": "Ini adalah dokumen milik admin"
}
```

**Expected Response:** Status 201 ✅

### Step 8: Test ABAC - User mencoba hapus dokumen Admin (GAGAL)

1. Login sebagai admin dan buat dokumen (catat ID-nya, misalnya ID = 1)
2. Login sebagai user
3. Coba hapus dokumen milik admin:

**Request:**
- Method: `DELETE`
- URL: `{{base_url}}/documents/1`
- Headers:
  - `Authorization`: `Bearer {{user_token}}`

**Expected Response:** Status 403 ❌
```json
{
  "message": "Akses ditolak. Anda hanya bisa mengakses document milik Anda sendiri."
}
```

### Step 9: Test ABAC - User hapus dokumennya sendiri (SUKSES)

1. Login sebagai user
2. Buat dokumen baru (catat ID-nya)
3. Hapus dokumen yang baru dibuat:

**Request:**
- Method: `DELETE`
- URL: `{{base_url}}/documents/{id_dokumen_user}`
- Headers:
  - `Authorization`: `Bearer {{user_token}}`

**Expected Response:** Status 200 ✅
```json
{
  "message": "Dokumen berhasil dihapus",
  "deletedDocument": {...}
}
```

### Step 10: Test Admin bisa hapus dokumen siapapun (SUKSES)

**Request:**
- Method: `DELETE`
- URL: `{{base_url}}/documents/{id_dokumen_user}`
- Headers:
  - `Authorization`: `Bearer {{admin_token}}`

**Expected Response:** Status 200 ✅

## 📊 Diagram Alur Autentikasi

Berdasarkan sequence diagram yang Anda berikan:

```
1. User input username & password
2. POST /auth/login
3. Server verifikasi password hash
4. Server kirim access token & refresh token
5. User menyimpan tokens
6. Untuk setiap request ke protected endpoint:
   - Kirim token di header: Authorization: Bearer <token>
7. Server verify token
8. Server kirim response
```

## 🔐 Security Features

1. **Password Hashing**: Menggunakan bcrypt untuk hash password
2. **JWT Token**: Access token expire dalam 1 jam, Refresh token 7 hari
3. **RBAC**: Endpoint tertentu hanya bisa diakses oleh role tertentu
4. **ABAC**: User hanya bisa edit/delete resource miliknya sendiri (kecuali admin)

## 📌 Checklist Testing

- [ ] Registrasi user baru berhasil
- [ ] Login sebagai admin berhasil
- [ ] Login sebagai user berhasil
- [ ] Admin bisa akses `/admin/users` (Status 200) ✅
- [ ] User TIDAK bisa akses `/admin/users` (Status 403) ❌
- [ ] User hanya bisa lihat dokumennya sendiri
- [ ] User bisa buat dokumen baru
- [ ] User bisa edit dokumennya sendiri
- [ ] User TIDAK bisa edit dokumen user lain (Status 403) ❌
- [ ] User TIDAK bisa hapus dokumen user lain (Status 403) ❌
- [ ] Admin bisa lihat semua dokumen
- [ ] Admin bisa edit dokumen siapapun
- [ ] Admin bisa hapus dokumen siapapun

## 🚀 Next Steps

Setelah fondasi ini berjalan dengan baik, Anda bisa:

1. Integrasi dengan database (MongoDB, PostgreSQL, dll)
2. Tambahkan fitur upload file
3. Implementasi logging dan audit trail
4. Tambahkan validasi input yang lebih ketat
5. Implementasi rate limiting
6. Tambahkan unit tests

## 📞 Support

Jika ada pertanyaan atau issues, silakan hubungi tim development.

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-21
#   a l p - c y b e r 
 
 
