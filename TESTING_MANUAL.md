# Testing Manual dengan curl atau PowerShell

## Jika Anda tidak punya Postman, gunakan PowerShell untuk testing

### 1. Test Server Running
```powershell
Invoke-WebRequest -Uri "http://localhost:3000" -Method GET
```

### 2. Registrasi User Baru
```powershell
$body = @{
    username = "testuser"
    password = "test123"
    role = "user"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### 3. Login sebagai Admin
```powershell
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Lihat response
$response.Content | ConvertFrom-Json

# Simpan token (copy dari response)
$adminToken = "PASTE_TOKEN_DISINI"
```

### 4. Login sebagai User
```powershell
$body = @{
    username = "user"
    password = "user123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$response.Content | ConvertFrom-Json

# Simpan token
$userToken = "PASTE_TOKEN_DISINI"
```

### 5. Test RBAC - Admin akses /admin/users (SUKSES)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/admin/users" `
    -Method GET `
    -Headers @{Authorization = "Bearer $adminToken"}
```

### 6. Test RBAC - User akses /admin/users (GAGAL - 403)
```powershell
# Ini harus gagal dengan status 403
Invoke-WebRequest -Uri "http://localhost:3000/admin/users" `
    -Method GET `
    -Headers @{Authorization = "Bearer $userToken"}
```

### 7. Buat Dokumen sebagai Admin
```powershell
$body = @{
    title = "Dokumen Admin Test"
    content = "Ini dokumen milik admin"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/documents" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{Authorization = "Bearer $adminToken"} `
    -Body $body
```

### 8. Buat Dokumen sebagai User
```powershell
$body = @{
    title = "Dokumen User Test"
    content = "Ini dokumen milik user"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/documents" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{Authorization = "Bearer $userToken"} `
    -Body $body
```

### 9. Lihat Semua Dokumen
```powershell
# Sebagai Admin (lihat semua)
Invoke-WebRequest -Uri "http://localhost:3000/documents" `
    -Method GET `
    -Headers @{Authorization = "Bearer $adminToken"}

# Sebagai User (hanya lihat miliknya)
Invoke-WebRequest -Uri "http://localhost:3000/documents" `
    -Method GET `
    -Headers @{Authorization = "Bearer $userToken"}
```

### 10. Test ABAC - User hapus dokumen Admin (GAGAL - 403)
```powershell
# Dokumen ID 1 milik admin, user coba hapus - harus gagal
Invoke-WebRequest -Uri "http://localhost:3000/documents/1" `
    -Method DELETE `
    -Headers @{Authorization = "Bearer $userToken"}
```

### 11. Test ABAC - User hapus dokumen sendiri (SUKSES)
```powershell
# Dokumen ID 2 milik user, user bisa hapus - harus sukses
Invoke-WebRequest -Uri "http://localhost:3000/documents/2" `
    -Method DELETE `
    -Headers @{Authorization = "Bearer $userToken"}
```

### 12. Test ABAC - Admin hapus dokumen siapapun (SUKSES)
```powershell
# Admin bisa hapus dokumen siapapun - harus sukses
Invoke-WebRequest -Uri "http://localhost:3000/documents/2" `
    -Method DELETE `
    -Headers @{Authorization = "Bearer $adminToken"}
```

---

## Alternative: Menggunakan curl (jika tersedia)

### Login Admin
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

### Test Admin Access
```bash
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test User Access (harus gagal)
```bash
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer USER_TOKEN_HERE"
```

---

## 📋 Checklist Testing

- [ ] Server berhasil dijalankan
- [ ] Registrasi user baru berhasil
- [ ] Login admin berhasil & dapat token
- [ ] Login user berhasil & dapat token
- [ ] Admin bisa akses /admin/users ✅
- [ ] User TIDAK bisa akses /admin/users ❌ (403)
- [ ] User bisa buat dokumen
- [ ] User TIDAK bisa hapus dokumen admin ❌ (403)
- [ ] User bisa hapus dokumennya sendiri ✅
- [ ] Admin bisa hapus dokumen siapapun ✅

## 💡 Tips

1. **Copy Token**: Saat login, copy nilai `accessToken` dari response
2. **Replace Token**: Ganti `YOUR_TOKEN_HERE` dengan token yang sudah di-copy
3. **Check Status Code**: 
   - 200/201 = Sukses
   - 403 = Forbidden (expected untuk test RBAC/ABAC)
   - 401 = Unauthorized (token tidak valid/expired)
4. **Format JSON**: Pastikan JSON body valid (gunakan quotes ganda `"`)

## 🐛 Troubleshooting

### Error: "Token tidak valid"
- Token mungkin expired (berlaku 1 jam)
- Login ulang untuk dapat token baru

### Error: "Connection refused"
- Server belum jalan
- Jalankan dulu: `node server.js`

### Error: "Cannot convert..."
- Response mungkin error dari server
- Lihat content dengan: `$response.Content`
