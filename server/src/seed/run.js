// Jalankan: npm run seed
// Mengisi database dengan data statistik contoh + akun admin default.
const db = require('../db');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { generateStatsData } = require('./statsData');

const existingStats = db.get('statsData').value();
if (!existingStats || existingStats.length === 0) {
  db.set('statsData', generateStatsData()).write();
  console.log(`[seed] ${db.get('statsData').size().value()} baris data statistik ditambahkan.`);
} else {
  console.log('[seed] Data statistik sudah ada, dilewati.');
}

const adminEmail = 'admin@komdigi.lampungprov.go.id';
const existingAdmin = db.get('users').find({ email: adminEmail }).value();
if (!existingAdmin) {
  const passwordHash = bcrypt.hashSync('Admin#12345', 10);
  db.get('users')
    .push({
      id: uuid(),
      name: 'Administrator Komdigi',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      instansi: 'Diskominfotik Provinsi Lampung',
      createdAt: new Date().toISOString(),
    })
    .write();
  console.log(`[seed] Akun admin dibuat -> ${adminEmail} / Admin#12345 (segera ganti password!)`);
} else {
  console.log('[seed] Akun admin sudah ada, dilewati.');
}

console.log('[seed] Selesai.');
