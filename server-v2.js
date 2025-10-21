const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Import configurations
const connectDB = require('./config/database');
const { logger } = require('./config/logger');

// Import models
const User = require('./models/User');
const Document = require('./models/Document');
const AuditLog = require('./models/AuditLog');

// Import middleware
const { AppError, notFound, errorHandler } = require('./middleware/errorHandler');
const { generalLimiter, authLimiter, apiLimiter, registerLimiter } = require('./middleware/rateLimiter');
const { auditMiddleware, createAuditLog } = require('./middleware/audit');
const {
  registerValidation,
  loginValidation,
  documentValidation,
  profileUpdateValidation
} = require('./middleware/validator');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-production';

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Document Management System API',
      version: '2.0.0',
      description: 'API for Document Management System with JWT, RBAC, ABAC, and Google OAuth',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./server-v2.js', './routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Serve static files
app.use(express.static('public'));

// ============================================
// MIDDLEWARE FUNCTIONS
// ============================================

// Middleware untuk verifikasi JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('Token not found', 401));
  }

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      return next(new AppError('Invalid or expired token', 403));
    }
    
    // Fetch user from database
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (!user || !user.isActive) {
        return next(new AppError('User not found or inactive', 401));
      }
      
      req.user = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role
      };
      next();
    } catch (error) {
      next(new AppError('Authentication failed', 401));
    }
  });
}

// Middleware RBAC: Otorisasi berdasarkan role
function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Log access denied
      createAuditLog({
        userId: req.user.id,
        username: req.user.username,
        action: 'ACCESS_DENIED',
        resourceType: 'system',
        details: {
          requiredRole: allowedRoles,
          userRole: req.user.role,
          path: req.path
        },
        ipAddress: req.ip,
        status: 'warning'
      });
      
      return next(new AppError(`Access denied. Required role: ${allowedRoles.join(' or ')}`, 403));
    }

    next();
  };
}

// Middleware ABAC: Cek kepemilikan resource
function checkOwnership(Model, resourceName = 'resource') {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return next(new AppError(`${resourceName} not found`, 404));
      }

      // Admin bisa akses semua resource
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // User biasa hanya bisa akses miliknya sendiri
      const ownerId = resource.owner ? resource.owner.toString() : resource._id.toString();
      if (ownerId !== req.user.id) {
        // Log access denied
        createAuditLog({
          userId: req.user.id,
          username: req.user.username,
          action: 'ACCESS_DENIED',
          resourceType: resourceName,
          resourceId: resourceId,
          details: {
            reason: 'Not the owner',
            ownerId: ownerId,
            requesterId: req.user.id
          },
          ipAddress: req.ip,
          status: 'warning'
        });
        
        return next(new AppError(`Access denied. You can only access your own ${resourceName}`, 403));
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// ============================================
// ROUTES - AUTHENTICATION
// ============================================

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user, moderator]
 *     responses:
 *       201:
 *         description: User registered successfully
 */
app.post('/auth/register', 
  registerLimiter,
  registerValidation,
  auditMiddleware('USER_REGISTER', 'user'),
  async (req, res, next) => {
    try {
      const { username, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return next(new AppError('Username or email already exists', 409));
      }

      // Create new user
      const newUser = await User.create({
        username,
        email,
        password,
        role: role || 'user',
        provider: 'local'
      });

      logger.info(`New user registered: ${username}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
app.post('/auth/login',
  authLimiter,
  loginValidation,
  auditMiddleware('USER_LOGIN', 'auth'),
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      // Find user by username or email
      const user = await User.findOne({
        $or: [{ username }, { email }]
      });

      if (!user) {
        return next(new AppError('Invalid credentials', 401));
      }

      // Check if account is locked
      if (user.isLocked()) {
        return next(new AppError('Account is locked. Please try again later', 423));
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        
        createAuditLog({
          userId: user._id,
          username: user.username,
          action: 'USER_LOGIN_FAILED',
          resourceType: 'auth',
          details: { reason: 'Invalid password' },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          status: 'failed'
        });
        
        return next(new AppError('Invalid credentials', 401));
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Generate tokens
      const accessToken = jwt.sign(
        {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        SECRET_KEY,
        { expiresIn: '7d' }
      );

      logger.info(`User logged in: ${user.username}`);

      res.json({
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
app.post('/auth/refresh',
  auditMiddleware('TOKEN_REFRESH', 'auth'),
  (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token not found', 401));
    }

    jwt.verify(refreshToken, SECRET_KEY, (err, user) => {
      if (err) {
        return next(new AppError('Invalid or expired refresh token', 403));
      }

      const newAccessToken = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.json({
        success: true,
        accessToken: newAccessToken
      });
    });
  }
);

// ============================================
// ROUTES - GOOGLE OAUTH 2.0
// ============================================

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
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return next(new AppError('Authorization code not found', 400));
  }

  try {
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const { id_token } = tokenResponse.data;
    const googleUser = jwt.decode(id_token);

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      // Create user without password validation for Google OAuth
      user = new User({
        username: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email,
        googleId: googleUser.sub,
        password: Math.random().toString(36).slice(-12), // Random password (tidak akan digunakan)
        role: 'user',
        avatar: googleUser.picture,
        provider: 'google'
      });
      
      // Save without running validators (skip password validation)
      await user.save({ validateBeforeSave: false });
      
      logger.info(`New Google user registered: ${user.email}`);
      
      await createAuditLog({
        userId: user._id,
        username: user.username,
        action: 'USER_REGISTER',
        resourceType: 'user',
        resourceId: user._id,
        details: { provider: 'google', email: user.email },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'success'
      });
    } else {
      await user.resetLoginAttempts();
      logger.info(`Existing Google user logged in: ${user.email}`);
      
      await createAuditLog({
        userId: user._id,
        username: user.username,
        action: 'USER_LOGIN',
        resourceType: 'user',
        resourceId: user._id,
        details: { provider: 'google', email: user.email },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'success'
      });
    }

    const jwtToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    // Return HTML page that will auto-login user
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Login Successful</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
          }
          .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Login Successful!</h1>
          <div class="spinner"></div>
          <p>Redirecting to application...</p>
        </div>
        <script>
          // Save tokens to localStorage
          localStorage.setItem('accessToken', '${jwtToken}');
          localStorage.setItem('refreshToken', '${refreshToken}');
          localStorage.setItem('user', JSON.stringify({
            id: '${user._id}',
            username: '${user.username}',
            email: '${user.email}',
            role: '${user.role}',
            avatar: '${user.avatar || ''}',
            provider: 'google'
          }));
          
          // Redirect to main app after 1 second
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
});

// ============================================
// ROUTES - ADMIN ONLY (RBAC)
// ============================================

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
app.get('/admin/users',
  apiLimiter,
  authenticateToken,
  authorizeRole('admin'),
  auditMiddleware('USER_READ', 'user'),
  async (req, res, next) => {
    try {
      const users = await User.find().select('-password');
      
      res.json({
        success: true,
        message: 'All users',
        count: users.length,
        users
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
app.delete('/admin/users/:id',
  apiLimiter,
  authenticateToken,
  authorizeRole('admin'),
  auditMiddleware('USER_DELETE', 'user'),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      await User.findByIdAndDelete(req.params.id);
      
      logger.info(`User deleted by admin: ${user.username}`);

      res.json({
        success: true,
        message: 'User deleted successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: Get audit logs (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of logs to return
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *     responses:
 *       200:
 *         description: List of audit logs
 */
app.get('/admin/audit-logs',
  apiLimiter,
  authenticateToken,
  authorizeRole('admin'),
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const { action, userId } = req.query;
      
      const filter = {};
      if (action) filter.action = action;
      if (userId) filter.userId = userId;
      
      const logs = await AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('userId', 'username email');
      
      res.json({
        success: true,
        count: logs.length,
        logs
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// ROUTES - DOCUMENTS (RBAC + ABAC)
// ============================================

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get all documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents
 */
app.get('/documents',
  apiLimiter,
  authenticateToken,
  auditMiddleware('DOCUMENT_READ', 'document'),
  async (req, res, next) => {
    try {
      let documents;
      
      if (req.user.role === 'admin') {
        documents = await Document.find().populate('owner', 'username email');
      } else {
        documents = await Document.find({ owner: req.user.id }).populate('owner', 'username email');
      }

      res.json({
        success: true,
        message: req.user.role === 'admin' ? 'All documents' : 'Your documents',
        count: documents.length,
        documents
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document details
 */
app.get('/documents/:id',
  apiLimiter,
  authenticateToken,
  checkOwnership(Document, 'document'),
  auditMiddleware('DOCUMENT_READ', 'document'),
  async (req, res, next) => {
    try {
      await req.resource.incrementViewCount();
      
      res.json({
        success: true,
        message: 'Document details',
        document: req.resource
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Create new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Document created successfully
 */
app.post('/documents',
  apiLimiter,
  authenticateToken,
  documentValidation,
  auditMiddleware('DOCUMENT_CREATE', 'document'),
  async (req, res, next) => {
    try {
      const { title, content, status, tags, isPublic } = req.body;

      const newDocument = await Document.create({
        title,
        content,
        owner: req.user.id,
        status: status || 'draft',
        tags: tags || [],
        isPublic: isPublic || false
      });

      logger.info(`Document created by ${req.user.username}: ${title}`);

      res.status(201).json({
        success: true,
        message: 'Document created successfully',
        document: newDocument
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /documents/{id}:
 *   put:
 *     summary: Update document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Document updated successfully
 */
app.put('/documents/:id',
  apiLimiter,
  authenticateToken,
  checkOwnership(Document, 'document'),
  documentValidation,
  auditMiddleware('DOCUMENT_UPDATE', 'document'),
  async (req, res, next) => {
    try {
      const { title, content, status, tags, isPublic } = req.body;

      const updatedDocument = await Document.findByIdAndUpdate(
        req.params.id,
        { title, content, status, tags, isPublic },
        { new: true, runValidators: true }
      );

      logger.info(`Document updated: ${updatedDocument.title}`);

      res.json({
        success: true,
        message: 'Document updated successfully',
        document: updatedDocument
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 */
app.delete('/documents/:id',
  apiLimiter,
  authenticateToken,
  checkOwnership(Document, 'document'),
  auditMiddleware('DOCUMENT_DELETE', 'document'),
  async (req, res, next) => {
    try {
      await Document.findByIdAndDelete(req.params.id);
      
      logger.info(`Document deleted: ${req.resource.title}`);

      res.json({
        success: true,
        message: 'Document deleted successfully',
        deletedDocument: req.resource
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// ROUTES - USER PROFILE
// ============================================

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
app.get('/profile',
  apiLimiter,
  authenticateToken,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select('-password');

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      res.json({
        success: true,
        message: 'Your profile',
        user
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
app.put('/profile',
  apiLimiter,
  authenticateToken,
  profileUpdateValidation,
  auditMiddleware('USER_UPDATE', 'user'),
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      if (username) user.username = username;
      if (email) user.email = email;
      if (password) user.password = password;

      await user.save();

      logger.info(`Profile updated: ${user.username}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// ROOT ROUTE
// ============================================

/**
 * @swagger
 * /:
 *   get:
 *     summary: API information
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API information and available endpoints
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Document Management System API v2.0',
    version: '2.0.0',
    features: [
      'JWT Authentication',
      'Google OAuth 2.0',
      'RBAC (Role-Based Access Control)',
      'ABAC (Attribute-Based Access Control)',
      'MongoDB Database',
      'Audit Logging',
      'Rate Limiting',
      'Input Validation',
      'Swagger API Documentation'
    ],
    documentation: `/api-docs`,
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        refresh: 'POST /auth/refresh',
        googleLogin: 'GET /auth/google',
        googleCallback: 'GET /auth/google/callback'
      },
      admin: {
        getAllUsers: 'GET /admin/users',
        deleteUser: 'DELETE /admin/users/:id',
        auditLogs: 'GET /admin/audit-logs'
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
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`📊 Database: MongoDB`);
  console.log(`🔐 Security: JWT + OAuth2.0`);
  console.log(`✅ Features: RBAC, ABAC, Audit Logging, Rate Limiting\n`);
  
  logger.info(`Server started on port ${PORT}`);
});

module.exports = app;
