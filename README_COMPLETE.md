# 🚀 Document Management System - Complete Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Security Features](#security-features)
- [Project Structure](#project-structure)

---

## 🎯 Overview

This is a complete **Document Management System** with advanced authentication and authorization features:

- **JWT Authentication** - Secure token-based authentication
- **Google OAuth 2.0** - Social login integration
- **RBAC** (Role-Based Access Control) - Admin, User, Moderator roles
- **ABAC** (Attribute-Based Access Control) - Resource ownership validation
- **MongoDB Database** - Persistent data storage
- **Audit Logging** - Complete activity tracking
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - XSS and injection prevention
- **API Documentation** - Interactive Swagger UI

---

## ✨ Features

### Authentication & Authorization
- ✅ User registration with email validation
- ✅ Login with username/email and password
- ✅ Google OAuth 2.0 login
- ✅ JWT token with refresh mechanism
- ✅ Password hashing with bcrypt
- ✅ Account lockout after failed attempts
- ✅ Role-based access control (RBAC)
- ✅ Resource ownership validation (ABAC)

### Document Management
- ✅ Create, read, update, delete documents
- ✅ Document ownership tracking
- ✅ View count tracking
- ✅ Document status (draft, published, archived)
- ✅ Tags and categorization
- ✅ Public/private documents

### Admin Features
- ✅ View all users
- ✅ Delete users
- ✅ View audit logs
- ✅ Access all documents

### Security Features
- ✅ Password complexity validation
- ✅ Rate limiting on authentication endpoints
- ✅ Audit logging for all actions
- ✅ Input sanitization
- ✅ XSS protection
- ✅ MongoDB injection prevention

---

## 🛠️ Technologies

| Category | Technology |
|----------|-----------|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JWT, Google OAuth 2.0, bcryptjs |
| **Validation** | express-validator |
| **Security** | express-rate-limit, CORS |
| **Logging** | Winston, Morgan |
| **Documentation** | Swagger (OpenAPI 3.0) |
| **Testing** | Jest, Supertest |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |

---

## 📦 Installation

### Prerequisites
- Node.js v14+ (LTS recommended)
- MongoDB 4.4+
- pnpm, npm, or yarn
- Google Cloud Console account (for OAuth)

### Step 1: Clone Repository
```powershell
cd "d:\ALP Cyber\alp-cyber"
```

### Step 2: Install Dependencies
```powershell
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### Step 3: Install MongoDB
Download and install MongoDB from https://www.mongodb.com/try/download/community

Or use MongoDB Atlas (cloud):
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string

---

## ⚙️ Configuration

### Step 1: Environment Variables

Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

Edit `.env`:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/document-management

# JWT Secret Key (CHANGE THIS!)
SECRET_KEY=your-very-secure-secret-key-change-this

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Logging
LOG_LEVEL=info
```

### Step 2: Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Secret to `.env`

See `GOOGLE_OAUTH_SETUP.md` for detailed instructions.

---

## 🚀 Running the Application

### Step 1: Start MongoDB

```powershell
# If installed locally
mongod
```

### Step 2: Seed Database (Optional)

```powershell
node seed.js
```

This creates default users:
- **Admin**: username: `admin`, password: `Admin123`
- **User**: username: `johndoe`, password: `User123`
- **Moderator**: username: `moderator`, password: `Mod123`

### Step 3: Start Server

```powershell
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

Server will run at: http://localhost:3000

### Step 4: Access Application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **API Root**: http://localhost:3000

---

## 📚 API Documentation

### Interactive Documentation

Visit http://localhost:3000/api-docs for interactive Swagger UI.

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "User123",
  "role": "user"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Document Endpoints

All document endpoints require authentication header:
```
Authorization: Bearer <access_token>
```

#### Create Document
```http
POST /documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Document",
  "content": "Document content here...",
  "status": "draft",
  "tags": ["important", "project"],
  "isPublic": false
}
```

#### Get All Documents
```http
GET /documents
Authorization: Bearer <token>
```

#### Get Document by ID
```http
GET /documents/:id
Authorization: Bearer <token>
```

#### Update Document
```http
PUT /documents/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### Delete Document
```http
DELETE /documents/:id
Authorization: Bearer <token>
```

### Admin Endpoints (Admin Only)

#### Get All Users
```http
GET /admin/users
Authorization: Bearer <admin_token>
```

#### Delete User
```http
DELETE /admin/users/:id
Authorization: Bearer <admin_token>
```

#### Get Audit Logs
```http
GET /admin/audit-logs?limit=100&action=USER_LOGIN
Authorization: Bearer <admin_token>
```

---

## 🧪 Testing

### Run All Tests
```powershell
npm test
```

### Run Tests with Coverage
```powershell
npm run test:coverage
```

### Test Scenarios Covered

✅ **Authentication Tests**
- User registration with validation
- Login with username/email
- Token refresh mechanism
- Invalid credentials handling

✅ **RBAC Tests**
- Admin access to admin endpoints
- User denied access to admin endpoints
- Role-based authorization

✅ **ABAC Tests**
- User can access own documents
- User denied access to other's documents
- Admin can access all documents
- Ownership validation

✅ **Document Management Tests**
- Create, read, update, delete documents
- Input validation
- Authorization checks

---

## 🔐 Security Features

### Password Security
- ✅ Bcrypt hashing with salt rounds = 10
- ✅ Password complexity validation
  - Minimum 6 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number

### Account Protection
- ✅ Account lockout after 5 failed login attempts
- ✅ Lockout duration: 2 hours
- ✅ Automatic unlock after timeout

### Rate Limiting
- ✅ General API: 100 requests / 15 minutes
- ✅ Authentication: 5 attempts / 15 minutes
- ✅ Registration: 3 accounts / 1 hour
- ✅ API endpoints: 50 requests / 15 minutes

### Input Validation
- ✅ XSS prevention with sanitization
- ✅ MongoDB injection prevention
- ✅ Email format validation
- ✅ Required field validation
- ✅ Data type validation

### Audit Logging
All actions are logged with:
- User ID and username
- Action type
- Resource type and ID
- IP address
- User agent
- Timestamp
- Success/failure status

Logs stored in:
- Database: `AuditLog` collection
- Files: `logs/audit.log`

---

## 📁 Project Structure

```
alp-cyber/
├── config/
│   ├── database.js          # MongoDB connection
│   └── logger.js             # Winston logger configuration
├── middleware/
│   ├── audit.js              # Audit logging middleware
│   ├── errorHandler.js       # Error handling & custom errors
│   ├── rateLimiter.js        # Rate limiting configuration
│   └── validator.js          # Input validation rules
├── models/
│   ├── User.js               # User schema
│   ├── Document.js           # Document schema
│   └── AuditLog.js           # Audit log schema
├── public/
│   └── index.html            # Frontend application
├── tests/
│   └── api.test.js           # Jest test suites
├── logs/
│   ├── combined.log          # All logs
│   ├── error.log             # Error logs
│   └── audit.log             # Audit logs
├── .env                      # Environment variables
├── .env.example              # Environment template
├── .gitignore               # Git ignore rules
├── jest.config.js           # Jest configuration
├── package.json             # Dependencies
├── seed.js                  # Database seeding script
├── server.js                # Original server (v1)
├── server-v2.js             # Enhanced server (v2)
└── README_COMPLETE.md       # This file
```

---

## 📊 RBAC & ABAC Implementation

### RBAC (Role-Based Access Control)

```javascript
// Middleware example
function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

// Usage
app.get('/admin/users', 
  authenticateToken, 
  authorizeRole('admin'),  // Only admin can access
  (req, res) => { ... }
);
```

**Roles:**
- `admin` - Full access to all resources
- `moderator` - Limited admin capabilities
- `user` - Standard user access

### ABAC (Attribute-Based Access Control)

```javascript
// Middleware example
function checkOwnership(Model, resourceName) {
  return async (req, res, next) => {
    const resource = await Model.findById(req.params.id);
    
    // Admin bypass
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check ownership
    if (resource.owner.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'You can only access your own resources' 
      });
    }
    next();
  };
}

// Usage
app.delete('/documents/:id',
  authenticateToken,
  checkOwnership(Document, 'document'),  // Check ownership
  (req, res) => { ... }
);
```

---

## 🎨 Frontend Features

### Login & Registration
- Modern, responsive UI
- Form validation
- Error handling
- Google OAuth button

### Document Management
- Create new documents
- View all user documents
- Delete documents
- Real-time updates

### Admin Panel
- View all users
- User management
- Role badges

### User Experience
- Alert notifications
- Loading states
- Responsive design
- Mobile-friendly

---

## 📈 Performance & Scalability

### Database Optimization
- ✅ Indexed fields for faster queries
- ✅ Efficient schema design
- ✅ Mongoose middleware for automation

### Logging & Monitoring
- ✅ Winston for structured logging
- ✅ Morgan for HTTP request logging
- ✅ Log rotation (5MB max per file)
- ✅ Separate error logs

### Error Handling
- ✅ Custom error classes
- ✅ Centralized error handler
- ✅ Detailed error messages
- ✅ Stack traces in development

---

## 🚀 Deployment Guide

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong `SECRET_KEY`
3. Configure production MongoDB URI
4. Set up proper Google OAuth redirect URIs

### Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Use HTTPS in production
- [ ] Configure CORS properly
- [ ] Set secure cookie flags
- [ ] Enable helmet.js
- [ ] Use environment variables for secrets
- [ ] Set up proper backup strategy
- [ ] Configure firewall rules

### Deployment Platforms

**Recommended:**
- **Backend**: Heroku, Railway, Render, DigitalOcean
- **Database**: MongoDB Atlas
- **Frontend**: Vercel, Netlify, GitHub Pages

---

## 📝 Change Log

### Version 2.0.0 (Current)
- ✅ MongoDB database integration
- ✅ Mongoose models and schemas
- ✅ Audit logging system
- ✅ Rate limiting
- ✅ Input validation with express-validator
- ✅ Swagger API documentation
- ✅ Jest unit tests
- ✅ Frontend application
- ✅ Enhanced error handling
- ✅ Account lockout mechanism

### Version 1.0.0
- ✅ Basic JWT authentication
- ✅ Google OAuth 2.0
- ✅ RBAC and ABAC
- ✅ In-memory storage
- ✅ Basic documentation

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👥 Support

For questions or issues:
- Check the [API Documentation](http://localhost:3000/api-docs)
- Review test files for examples
- Check logs in `logs/` directory

---

## 🎓 Learning Resources

- [JWT Documentation](https://jwt.io/)
- [MongoDB University](https://university.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [OAuth 2.0 Spec](https://oauth.net/2/)
- [OWASP Security Guidelines](https://owasp.org/)

---

**Last Updated**: October 21, 2025  
**Version**: 2.0.0  
**Status**: Production Ready ✅
