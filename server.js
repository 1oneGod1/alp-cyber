const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-production';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Middleware untuk parsing JSON
app.use(express.json());

// Database simulasi (dalam production, gunakan database sesungguhnya)
// Password akan di-hash saat registrasi atau bisa di-set manual
// Untuk kemudahan testing, kita akan hash password saat server start
let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: '', // akan di-set saat server start
    role: 'admin',
    provider: 'local' // local, google, facebook, etc
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    password: '', // akan di-set saat server start
    role: 'user',
    provider: 'local'
  }
];

let documents = [
  { id: 1, title: 'Dokumen Admin 1', content: 'Konten dokumen admin', ownerId: 1 },
  { id: 2, title: 'Dokumen User 1', content: 'Konten dokumen user', ownerId: 2 }
];

// Middleware untuk verifikasi JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid' });
    }
    req.user = user;
    next();
  });
}

// Middleware RBAC: Otorisasi berdasarkan role
function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User tidak terautentikasi' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Akses ditolak. Anda tidak memiliki izin untuk mengakses resource ini.',
        requiredRole: allowedRoles,
        yourRole: req.user.role
      });
    }

    next();
  };
}

// Middleware ABAC: Cek kepemilikan resource
function checkOwnership(resourceType) {
  return (req, res, next) => {
    const resourceId = parseInt(req.params.id);
    let resource;

    if (resourceType === 'document') {
      resource = documents.find(doc => doc.id === resourceId);
    } else if (resourceType === 'user') {
      resource = users.find(user => user.id === resourceId);
    }

    if (!resource) {
      return res.status(404).json({ message: `${resourceType} tidak ditemukan` });
    }

    // Admin bisa akses semua resource
    if (req.user.role === 'admin') {
      req.resource = resource;
      return next();
    }

    // User biasa hanya bisa akses miliknya sendiri
    const ownerId = resourceType === 'document' ? resource.ownerId : resource.id;
    if (ownerId !== req.user.id) {
      return res.status(403).json({ 
        message: `Akses ditolak. Anda hanya bisa mengakses ${resourceType} milik Anda sendiri.` 
      });
    }

    req.resource = resource;
    next();
  };
}

// ============================================
// ROUTES - AUTHENTICATION
// ============================================

// Route: Registrasi user baru
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password harus diisi' });
    }

    // Cek apakah username sudah ada
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      role: role || 'user' // Default role adalah 'user'
    };

    users.push(newUser);

    res.status(201).json({ 
      message: 'Registrasi berhasil',
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// Route: Login
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password harus diisi' });
    }

    // Cari user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    // Buat JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      SECRET_KEY,
      { expiresIn: '1h' } // Token berlaku 1 jam
    );

    // Buat refresh token (berlaku lebih lama)
    const refreshToken = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      SECRET_KEY,
      { expiresIn: '7d' } // Refresh token berlaku 7 hari
    );

    res.json({ 
      message: 'Login berhasil',
      accessToken: token,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// Route: Refresh token
app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token tidak ditemukan' });
  }

  jwt.verify(refreshToken, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Refresh token tidak valid' });
    }

    // Buat access token baru
    const newAccessToken = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ 
      accessToken: newAccessToken 
    });
  });
});

// ============================================
// ROUTES - GOOGLE OAUTH 2.0
// ============================================

// Route: Inisiasi Google OAuth Login
app.get('/auth/google', (req, res) => {
  const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    prompt: 'consent'
  });

  const authUrl = `${googleAuthUrl}?${params.toString()}`;
  
  // Redirect user ke Google login page
  res.redirect(authUrl);
});

// Route: Google OAuth Callback
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Authorization code tidak ditemukan' });
  }

  try {
    // Step 1: Exchange authorization code untuk access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const { access_token, id_token } = tokenResponse.data;

    // Step 2: Decode Google ID Token untuk mendapatkan user info
    const googleUser = jwt.decode(id_token);
    
    // Alternative: Fetch user info dari Google API
    // const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
    //   headers: { Authorization: `Bearer ${access_token}` }
    // });
    // const googleUser = userInfoResponse.data;

    // Step 3: Cari atau buat user di database kita
    let user = users.find(u => u.email === googleUser.email);

    if (!user) {
      // Buat user baru jika belum ada
      user = {
        id: users.length + 1,
        username: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email,
        googleId: googleUser.sub, // Google User ID
        password: '', // No password untuk OAuth users
        role: 'user', // Default role
        avatar: googleUser.picture,
        provider: 'google'
      };
      users.push(user);
      
      console.log(`✅ New Google user registered: ${user.email}`);
    } else {
      console.log(`✅ Existing Google user logged in: ${user.email}`);
    }

    // Step 4: Generate JWT token internal kita
    const jwtToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    // Step 5: Return tokens ke client
    // Dalam production, redirect ke frontend dengan tokens
    res.json({
      message: 'Login dengan Google berhasil',
      accessToken: jwtToken,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider
      }
    });

    // Alternative: Redirect ke frontend dengan token di URL (untuk production)
    // const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // res.redirect(`${frontendUrl}/auth/callback?token=${jwtToken}&refresh=${refreshToken}`);

  } catch (error) {
    console.error('Google OAuth Error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Gagal login dengan Google',
      error: error.response?.data || error.message 
    });
  }
});

// Route: Verify Google Token (optional - untuk client-side Google Sign-In)
app.post('/auth/google/verify', async (req, res) => {
  try {
    const { credential } = req.body; // Google ID Token dari client

    if (!credential) {
      return res.status(400).json({ message: 'Google credential tidak ditemukan' });
    }

    // Verify token dengan Google
    const ticket = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );

    const googleUser = ticket.data;

    // Validasi client ID
    if (googleUser.aud !== GOOGLE_CLIENT_ID) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Cari atau buat user
    let user = users.find(u => u.email === googleUser.email);

    if (!user) {
      user = {
        id: users.length + 1,
        username: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email,
        googleId: googleUser.sub,
        password: '',
        role: 'user',
        avatar: googleUser.picture,
        provider: 'google'
      };
      users.push(user);
    }

    // Generate JWT internal
    const jwtToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login dengan Google berhasil',
      accessToken: jwtToken,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider
      }
    });

  } catch (error) {
    console.error('Google Token Verification Error:', error.response?.data || error.message);
    res.status(401).json({ 
      message: 'Token Google tidak valid',
      error: error.response?.data || error.message 
    });
  }
});

// ============================================
// ROUTES - ADMIN ONLY (RBAC)
// ============================================

// Route: Lihat semua user (hanya admin)
app.get('/admin/users', authenticateToken, authorizeRole('admin'), (req, res) => {
  const usersWithoutPassword = users.map(({ password, ...user }) => user);
  res.json({ 
    message: 'Daftar semua user',
    users: usersWithoutPassword 
  });
});

// Route: Hapus user (hanya admin)
app.delete('/admin/users/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  const deletedUser = users.splice(userIndex, 1)[0];
  res.json({ 
    message: 'User berhasil dihapus',
    user: {
      id: deletedUser.id,
      username: deletedUser.username,
      role: deletedUser.role
    }
  });
});

// ============================================
// ROUTES - DOCUMENTS (RBAC + ABAC)
// ============================================

// Route: Lihat semua dokumen
app.get('/documents', authenticateToken, (req, res) => {
  // Admin bisa lihat semua dokumen
  if (req.user.role === 'admin') {
    return res.json({ 
      message: 'Semua dokumen (Admin view)',
      documents: documents 
    });
  }

  // User biasa hanya bisa lihat dokumen miliknya
  const userDocuments = documents.filter(doc => doc.ownerId === req.user.id);
  res.json({ 
    message: 'Dokumen Anda',
    documents: userDocuments 
  });
});

// Route: Lihat detail dokumen
app.get('/documents/:id', authenticateToken, checkOwnership('document'), (req, res) => {
  res.json({ 
    message: 'Detail dokumen',
    document: req.resource 
  });
});

// Route: Buat dokumen baru
app.post('/documents', authenticateToken, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title dan content harus diisi' });
  }

  const newDocument = {
    id: documents.length + 1,
    title,
    content,
    ownerId: req.user.id
  };

  documents.push(newDocument);

  res.status(201).json({ 
    message: 'Dokumen berhasil dibuat',
    document: newDocument 
  });
});

// Route: Update dokumen (ABAC - hanya owner atau admin)
app.put('/documents/:id', authenticateToken, checkOwnership('document'), (req, res) => {
  const { title, content } = req.body;

  if (title) req.resource.title = title;
  if (content) req.resource.content = content;

  res.json({ 
    message: 'Dokumen berhasil diupdate',
    document: req.resource 
  });
});

// Route: Hapus dokumen (ABAC - hanya owner atau admin)
app.delete('/documents/:id', authenticateToken, checkOwnership('document'), (req, res) => {
  const documentId = parseInt(req.params.id);
  const docIndex = documents.findIndex(doc => doc.id === documentId);

  documents.splice(docIndex, 1);

  res.json({ 
    message: 'Dokumen berhasil dihapus',
    deletedDocument: req.resource 
  });
});

// ============================================
// ROUTES - USER PROFILE
// ============================================

// Route: Lihat profil sendiri
app.get('/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  const { password, ...userWithoutPassword } = user;
  res.json({ 
    message: 'Profil Anda',
    user: userWithoutPassword 
  });
});

// Route: Update profil sendiri
app.put('/profile', authenticateToken, async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  if (username) {
    // Cek apakah username sudah digunakan user lain
    const existingUser = users.find(u => u.username === username && u.id !== req.user.id);
    if (existingUser) {
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }
    user.username = username;
  }

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  res.json({ 
    message: 'Profil berhasil diupdate',
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});

// ============================================
// ROOT ROUTE
// ============================================

app.get('/', (req, res) => {
  res.json({
    message: 'Selamat datang di Sistem Manajemen Dokumen Internal Perusahaan',
    version: '2.0.0',
    features: ['JWT Authentication', 'Google OAuth 2.0', 'RBAC', 'ABAC'],
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        refresh: 'POST /auth/refresh',
        googleLogin: 'GET /auth/google (Redirect to Google)',
        googleCallback: 'GET /auth/google/callback',
        googleVerify: 'POST /auth/google/verify (For client-side Google Sign-In)'
      },
      admin: {
        getAllUsers: 'GET /admin/users (Admin only)',
        deleteUser: 'DELETE /admin/users/:id (Admin only)'
      },
      documents: {
        getAll: 'GET /documents',
        getOne: 'GET /documents/:id',
        create: 'POST /documents',
        update: 'PUT /documents/:id',
        delete: 'DELETE /documents/:id'
      },
      profile: {
        get: 'GET /profile',
        update: 'PUT /profile'
      }
    },
    googleOAuth: {
      status: GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' ? 'Configured ✅' : 'Not Configured ⚠️',
      setupGuide: 'See GOOGLE_OAUTH_SETUP.md for configuration instructions'
    }
  });
});

// Initialize default users dengan password hash
async function initializeDefaultUsers() {
  try {
    // Hash password untuk default users
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('user123', 10);
    
    users[0].password = adminHash;
    users[1].password = userHash;
    
    console.log('✅ Default users initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing default users:', error.message);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`\n🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`\n⏳ Initializing default users...`);
  
  await initializeDefaultUsers();
  
  console.log(`\n=== 👤 Informasi Login Default ===`);
  console.log(`Admin - username: admin, password: admin123`);
  console.log(`User  - username: user, password: user123`);
  console.log(`===================================\n`);
  console.log(`📚 Lihat README.md untuk panduan lengkap`);
  console.log(`🧪 Import Postman_Collection.json untuk testing\n`);
});
