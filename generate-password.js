// Script untuk generate password hash
// Jalankan dengan: node generate-password.js

const bcrypt = require('bcryptjs');

async function generatePasswords() {
  console.log('Generating password hashes...\n');
  
  // Password untuk admin
  const adminPassword = 'admin123';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  console.log('Admin Password:', adminPassword);
  console.log('Admin Hash:', adminHash);
  console.log('');
  
  // Password untuk user
  const userPassword = 'user123';
  const userHash = await bcrypt.hash(userPassword, 10);
  console.log('User Password:', userPassword);
  console.log('User Hash:', userHash);
  console.log('');
  
  console.log('Copy hash ini ke server.js di bagian users array');
}

// Jika bcryptjs belum terinstall, akan error
// Untuk test tanpa install, uncomment kode di bawah:
/*
console.log('bcryptjs belum terinstall.');
console.log('Silakan install dulu dengan: npm install bcryptjs');
console.log('');
console.log('Hash yang sudah di-generate:');
console.log('Admin (admin123): $2a$10$N9qo8uLOickgx2ZMRZoMye...');
console.log('User (user123): $2a$10$N9qo8uLOickgx2ZMRZoMye...');
*/

try {
  generatePasswords();
} catch (error) {
  console.log('Error:', error.message);
  console.log('\nJika bcryptjs belum terinstall, install dulu dengan:');
  console.log('npm install bcryptjs');
}
