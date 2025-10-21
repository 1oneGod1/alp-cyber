const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Document = require('./models/Document');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/document-management');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Document.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123',
      role: 'admin',
      provider: 'local'
    });

    const user1 = await User.create({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'User123',
      role: 'user',
      provider: 'local'
    });

    const user2 = await User.create({
      username: 'janedoe',
      email: 'jane@example.com',
      password: 'User123',
      role: 'user',
      provider: 'local'
    });

    const moderator = await User.create({
      username: 'moderator',
      email: 'mod@example.com',
      password: 'Mod123',
      role: 'moderator',
      provider: 'local'
    });

    console.log('✅ Created users');

    // Create documents
    await Document.create([
      {
        title: 'Company Policy 2025',
        content: 'This document outlines the company policies for the year 2025...',
        owner: admin._id,
        status: 'published',
        tags: ['policy', 'company', 'official'],
        isPublic: true
      },
      {
        title: 'Q1 Financial Report',
        content: 'Financial summary for Q1 2025...',
        owner: admin._id,
        status: 'published',
        tags: ['finance', 'quarterly', 'report']
      },
      {
        title: 'My Project Proposal',
        content: 'This is my proposal for the new project...',
        owner: user1._id,
        status: 'draft',
        tags: ['project', 'proposal']
      },
      {
        title: 'Meeting Notes - Jan 2025',
        content: 'Notes from the January 2025 team meeting...',
        owner: user1._id,
        status: 'published',
        tags: ['meeting', 'notes']
      },
      {
        title: 'Research Findings',
        content: 'My research findings on cybersecurity trends...',
        owner: user2._id,
        status: 'draft',
        tags: ['research', 'cybersecurity']
      },
      {
        title: 'Guidelines for New Members',
        content: 'Welcome guide for new team members...',
        owner: moderator._id,
        status: 'published',
        tags: ['guidelines', 'onboarding'],
        isPublic: true
      }
    ]);

    console.log('✅ Created documents');

    console.log('\n📊 Database Seeded Successfully!\n');
    console.log('=== Default Users ===');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Email: admin@example.com');
    console.log('  Password: Admin123');
    console.log('  Role: admin\n');
    
    console.log('User 1:');
    console.log('  Username: johndoe');
    console.log('  Email: john@example.com');
    console.log('  Password: User123');
    console.log('  Role: user\n');
    
    console.log('User 2:');
    console.log('  Username: janedoe');
    console.log('  Email: jane@example.com');
    console.log('  Password: User123');
    console.log('  Role: user\n');
    
    console.log('Moderator:');
    console.log('  Username: moderator');
    console.log('  Email: mod@example.com');
    console.log('  Password: Mod123');
    console.log('  Role: moderator\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

connectDB().then(seedDatabase);
