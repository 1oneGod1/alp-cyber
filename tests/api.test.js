const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server-v2');
const User = require('../models/User');
const Document = require('../models/Document');

let adminToken, userToken, adminId, userId, documentId;

// Connect to test database before all tests
beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/document-management-test';
  await mongoose.connect(mongoUri);
});

// Clear database before each test
beforeEach(async () => {
  await User.deleteMany({});
  await Document.deleteMany({});
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication Tests', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test123',
          role: 'user'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('username', 'testuser');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'Test123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with weak password', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'weak'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with duplicate username', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123'
      });

      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'another@example.com',
          password: 'Test123'
        });

      expect(res.statusCode).toBe(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create test users
      const admin = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'Admin123',
        role: 'admin'
      });
      adminId = admin._id;

      const user = await User.create({
        username: 'user',
        email: 'user@example.com',
        password: 'User123',
        role: 'user'
      });
      userId = user._id;
    });

    it('should login successfully with username', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'Admin123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.role).toBe('admin');

      adminToken = res.body.accessToken;
    });

    it('should login successfully with email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'User123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('accessToken');
      
      userToken = res.body.accessToken;
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'WrongPassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with non-existent user', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'Test123'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123'
      });

      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'Test123'
        });

      refreshToken = loginRes.body.refreshToken;
    });

    it('should refresh token successfully', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('accessToken');
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.statusCode).toBe(403);
    });
  });
});

describe('RBAC Tests (Role-Based Access Control)', () => {
  beforeEach(async () => {
    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123',
      role: 'admin'
    });

    // Create regular user
    const user = await User.create({
      username: 'user',
      email: 'user@example.com',
      password: 'User123',
      role: 'user'
    });

    // Login as admin
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'Admin123' });
    adminToken = adminLogin.body.accessToken;

    // Login as user
    const userLogin = await request(app)
      .post('/auth/login')
      .send({ username: 'user', password: 'User123' });
    userToken = userLogin.body.accessToken;
  });

  describe('GET /admin/users', () => {
    it('should allow admin to access user list', async () => {
      const res = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.users).toBeInstanceOf(Array);
      expect(res.body.users.length).toBeGreaterThan(0);
    });

    it('should deny regular user access to user list', async () => {
      const res = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should deny access without token', async () => {
      const res = await request(app)
        .get('/admin/users');

      expect(res.statusCode).toBe(401);
    });
  });
});

describe('ABAC Tests (Attribute-Based Access Control)', () => {
  beforeEach(async () => {
    // Create users
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123',
      role: 'admin'
    });
    adminId = admin._id;

    const user = await User.create({
      username: 'user',
      email: 'user@example.com',
      password: 'User123',
      role: 'user'
    });
    userId = user._id;

    // Login
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'Admin123' });
    adminToken = adminLogin.body.accessToken;

    const userLogin = await request(app)
      .post('/auth/login')
      .send({ username: 'user', password: 'User123' });
    userToken = userLogin.body.accessToken;

    // Create documents
    const adminDoc = await Document.create({
      title: 'Admin Document',
      content: 'This is admin document',
      owner: adminId
    });

    const userDoc = await Document.create({
      title: 'User Document',
      content: 'This is user document',
      owner: userId
    });
    documentId = userDoc._id;
  });

  describe('Document Ownership Tests', () => {
    it('should allow user to access their own document', async () => {
      const res = await request(app)
        .get(`/documents/${documentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.document.title).toBe('User Document');
    });

    it('should deny user access to other user document', async () => {
      const adminDocs = await Document.find({ owner: adminId });
      const adminDocId = adminDocs[0]._id;

      const res = await request(app)
        .get(`/documents/${adminDocId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin to access any document', async () => {
      const res = await request(app)
        .get(`/documents/${documentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should allow user to delete their own document', async () => {
      const res = await request(app)
        .delete(`/documents/${documentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const deletedDoc = await Document.findById(documentId);
      expect(deletedDoc).toBeNull();
    });

    it('should deny user deletion of other user document', async () => {
      const adminDocs = await Document.find({ owner: adminId });
      const adminDocId = adminDocs[0]._id;

      const res = await request(app)
        .delete(`/documents/${adminDocId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);

      const doc = await Document.findById(adminDocId);
      expect(doc).not.toBeNull();
    });

    it('should allow admin to delete any document', async () => {
      const res = await request(app)
        .delete(`/documents/${documentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('Document Management Tests', () => {
  beforeEach(async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123'
    });
    userId = user._id;

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'Test123' });
    userToken = loginRes.body.accessToken;
  });

  describe('POST /documents', () => {
    it('should create document successfully', async () => {
      const res = await request(app)
        .post('/documents')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Document',
          content: 'This is test content'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.document.title).toBe('Test Document');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/documents')
        .send({
          title: 'Test Document',
          content: 'This is test content'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should fail with invalid data', async () => {
      const res = await request(app)
        .post('/documents')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'AB', // Too short
          content: 'Content'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /documents', () => {
    it('should get user documents', async () => {
      await Document.create({
        title: 'Doc 1',
        content: 'Content 1',
        owner: userId
      });

      const res = await request(app)
        .get('/documents')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.documents).toBeInstanceOf(Array);
      expect(res.body.documents.length).toBe(1);
    });
  });

  describe('PUT /documents/:id', () => {
    it('should update document successfully', async () => {
      const doc = await Document.create({
        title: 'Original Title',
        content: 'Original Content',
        owner: userId
      });

      const res = await request(app)
        .put(`/documents/${doc._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated Title',
          content: 'Updated Content'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.document.title).toBe('Updated Title');
    });
  });
});

describe('Profile Management Tests', () => {
  let token;

  beforeEach(async () => {
    await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123'
    });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'Test123' });
    token = loginRes.body.accessToken;
  });

  describe('GET /profile', () => {
    it('should get user profile', async () => {
      const res = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.user).not.toHaveProperty('password');
    });
  });

  describe('PUT /profile', () => {
    it('should update profile successfully', async () => {
      const res = await request(app)
        .put('/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'updateduser',
          email: 'updated@example.com'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe('updateduser');
    });
  });
});
