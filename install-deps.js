/**
 * Script untuk download dan install dependencies secara manual
 * Karena npm bermasalah di Node.js v24.0.1
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Manual Dependency Installer');
console.log('================================\n');

// Cek apakah node_modules sudah ada
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  fs.mkdirSync(nodeModulesPath);
  console.log('✅ Folder node_modules dibuat\n');
}

console.log('⚠️  npm di Node.js v24.0.1 Anda bermasalah.');
console.log('📋 Solusi yang tersedia:\n');

console.log('SOLUSI 1: Download Node.js LTS (REKOMENDASI)');
console.log('  1. Buka: https://nodejs.org/');
console.log('  2. Download versi LTS (20.x.x atau 18.x.x)');
console.log('  3. Install dan restart terminal');
console.log('  4. Jalankan: npm install\n');

console.log('SOLUSI 2: Install pnpm (Package Manager Alternatif)');
console.log('  Di PowerShell (sebagai Administrator):');
console.log('  iwr https://get.pnpm.io/install.ps1 -useb | iex');
console.log('  Lalu jalankan: pnpm install\n');

console.log('SOLUSI 3: Gunakan yarn');
console.log('  Download dari: https://classic.yarnpkg.com/en/docs/install');
console.log('  Lalu jalankan: yarn install\n');

console.log('SOLUSI 4: Jalankan server TANPA install dependencies');
console.log('  (Hanya untuk testing, fitur terbatas)');
console.log('  node server-minimal.js\n');

console.log('================================');
console.log('Pilih salah satu solusi di atas untuk melanjutkan.');
