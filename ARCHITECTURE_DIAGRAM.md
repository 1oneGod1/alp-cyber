# 📐 ARSITEKTUR APLIKASI - Visual Diagram

## 🏗️ System Architecture Overview

<img width="394" height="573" alt="Gambar1" src="https://github.com/user-attachments/assets/5fd87e50-955e-4db5-988e-5a49fabd45a2" />



## 🔄 Request Flow Diagram

### Scenario 1: User Login

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. POST /auth/login
     │    { username, password }
     ▼
┌─────────────────┐
│  Rate Limiter   │ ◄─── Max 5 attempts / 15 min
└────┬────────────┘
     │ 2. Check rate limit
     ▼
┌─────────────────┐
│   Validator     │ ◄─── Check username & password format
└────┬────────────┘
     │ 3. Validate input
     ▼
┌─────────────────┐
│  Login Route    │
└────┬────────────┘
     │ 4. Find user in DB
     ▼
┌─────────────────┐
│  User Model     │
└────┬────────────┘
     │ 5. Compare password (bcrypt)
     ▼
┌─────────────────┐
│   MongoDB       │
└────┬────────────┘
     │ 6. User found & password match
     ▼
┌─────────────────┐
│  Generate JWT   │ ◄─── Sign with SECRET_KEY
└────┬────────────┘
     │ 7. Create access & refresh tokens
     ▼
┌─────────────────┐
│  Audit Log      │ ◄─── Log successful login
└────┬────────────┘
     │ 8. Return tokens + user info
     ▼
┌──────────┐
│  Client  │ ◄─── Store tokens in localStorage
└──────────┘
```

---

### Scenario 2: Access Protected Resource (RBAC + ABAC)

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. GET /documents/123
     │    Authorization: Bearer <token>
     ▼
┌─────────────────┐
│  Rate Limiter   │ ◄─── Max 50 requests / 15 min
└────┬────────────┘
     │ 2. Check API rate limit
     ▼
┌─────────────────┐
│  JWT Auth       │ ◄─── Verify token signature
│  Middleware     │
└────┬────────────┘
     │ 3. Extract user from token
     │    req.user = { id, username, role }
     ▼
┌─────────────────┐
│  ABAC Check     │ ◄─── Check ownership
│  Middleware     │
└────┬────────────┘
     │ 4. Query document from DB
     ▼
┌─────────────────┐
│  MongoDB        │
└────┬────────────┘
     │ 5. Check: doc.owner === req.user.id
     │    OR req.user.role === 'admin'
     ▼
     ├─── YES ──┐
     │          ▼
     │     ┌─────────────────┐
     │     │  Grant Access   │
     │     └────┬────────────┘
     │          │ 6. Return document
     │          ▼
     │     ┌─────────────────┐
     │     │  Audit Log      │ ◄─── Log DOCUMENT_READ
     │     └────┬────────────┘
     │          │
     │          ▼
     │     ┌──────────┐
     │     │  Client  │ ◄─── 200 OK + document
     │     └──────────┘
     │
     └─── NO ───┐
                ▼
           ┌─────────────────┐
           │  Deny Access    │
           └────┬────────────┘
                │ 7. Return 403
                ▼
           ┌─────────────────┐
           │  Audit Log      │ ◄─── Log ACCESS_DENIED
           └────┬────────────┘
                │
                ▼
           ┌──────────┐
           │  Client  │ ◄─── 403 Forbidden
           └──────────┘
```

---

## 📊 Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    INPUT VALIDATION FLOW                        │
└────────────────────────────────────────────────────────────────┘

Request Body
     │
     ▼
┌─────────────────┐
│  Validator      │
│  Middleware     │
│                 │
│ • Check types   │
│ • Check length  │
│ • Check format  │
│ • Sanitize XSS  │
└────┬────────────┘
     │
     ├──── VALID ────┐
     │               ▼
     │          ┌──────────┐
     │          │ Continue │
     │          └──────────┘
     │
     └──── INVALID ──┐
                     ▼
                ┌────────────────┐
                │ Return 400     │
                │ Validation     │
                │ Errors         │
                └────────────────┘


┌────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                              │
└────────────────────────────────────────────────────────────────┘

Layer 1: Rate Limiting
    ↓
Layer 2: Input Validation
    ↓
Layer 3: JWT Authentication
    ↓
Layer 4: RBAC (Role Check)
    ↓
Layer 5: ABAC (Ownership Check)
    ↓
Layer 6: Audit Logging
    ↓
Access Granted


┌────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING FLOW                          │
└────────────────────────────────────────────────────────────────┘

Error Occurs
     │
     ▼
┌─────────────────┐
│ Error Handler   │
│  Middleware     │
└────┬────────────┘
     │
     ├─── Mongoose Error ──┐
     │                     ▼
     │              ┌─────────────┐
     │              │ • Cast Error│
     │              │ • Duplicate │
     │              │ • Validation│
     │              └──────┬──────┘
     │                     │
     │                     ▼
     │              Transform to
     │              App Error
     │
     ├─── JWT Error ───────┐
     │                     ▼
     │              ┌─────────────┐
     │              │ • Invalid   │
     │              │ • Expired   │
     │              └──────┬──────┘
     │                     │
     │                     ▼
     │              Return 401
     │
     └─── Other Errors ────┐
                           ▼
                    Log to Winston
                           │
                           ▼
                    Return 500
```

---

## 🗂️ File Organization

```
alp-cyber/
│
├── 📁 config/              # Configuration files
│   ├── database.js         # MongoDB connection
│   └── logger.js           # Winston logger setup
│
├── 📁 middleware/          # Express middlewares
│   ├── audit.js            # Audit logging
│   ├── errorHandler.js     # Error handling
│   ├── rateLimiter.js      # Rate limiting
│   └── validator.js        # Input validation
│
├── 📁 models/              # Mongoose models
│   ├── User.js             # User schema & methods
│   ├── Document.js         # Document schema
│   └── AuditLog.js         # Audit log schema
│
├── 📁 public/              # Static files
│   └── index.html          # Frontend SPA
│
├── 📁 tests/               # Test files
│   └── api.test.js         # Jest tests
│
├── 📁 logs/                # Log files (auto-created)
│   ├── combined.log        # All logs
│   ├── error.log           # Error logs
│   └── audit.log           # Audit logs
│
├── 📄 server.js            # Original server (v1)
├── 📄 server-v2.js         # Enhanced server (v2) ⭐
├── 📄 seed.js              # Database seeding
├── 📄 package.json         # Dependencies
├── 📄 jest.config.js       # Jest configuration
├── 📄 .env                 # Environment variables
└── 📄 .env.example         # Environment template
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Network Security                                   │
│ • CORS Configuration                                        │
│ • HTTPS (Production)                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Rate Limiting                                      │
│ • Prevent DDoS attacks                                      │
│ • Prevent brute force                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Input Validation                                   │
│ • XSS Prevention                                            │
│ • SQL/NoSQL Injection Prevention                           │
│ • Data Type Validation                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Authentication                                     │
│ • JWT Token Verification                                    │
│ • Token Expiry Check                                        │
│ • User Identity Verification                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Authorization (RBAC)                               │
│ • Role-Based Access Control                                 │
│ • Admin/User/Moderator Permissions                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 6: Authorization (ABAC)                               │
│ • Attribute-Based Access Control                            │
│ • Resource Ownership Validation                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 7: Audit & Monitoring                                 │
│ • All Actions Logged                                        │
│ • IP Tracking                                               │
│ • Timestamp Recording                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ✅ ACCESS GRANTED
```

---

## 📈 Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│              DATABASE OPTIMIZATION                           │
└─────────────────────────────────────────────────────────────┘

1. Indexes
   ├── users.email (unique)
   ├── users.username (unique)
   ├── documents.owner + createdAt (compound)
   └── auditlogs.userId + timestamp (compound)

2. Query Optimization
   ├── Use .select() to limit fields
   ├── Use .populate() for references
   └── Implement pagination (future)

3. Connection Pooling
   └── Mongoose default pool size: 5
```

---

**Created**: October 21, 2025  
**Version**: 2.0.0  
**Status**: Complete & Documented
