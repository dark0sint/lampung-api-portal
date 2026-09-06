// Lapisan database sederhana berbasis file JSON (lowdb).
// Cukup untuk skala pilot/OPD; ganti dengan PostgreSQL/MySQL saat volume trafik naik
// (lihat README bagian "Migrasi ke database produksi").
const low = require('lowdb');
const FileSync = require('lowdb/FileSync');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const adapter = new FileSync(path.join(dataDir, 'db.json'));
const db = low(adapter);

db.defaults({
  users: [],
  apikeys: [],
  logs: [],
  tickets: [],
  webhooks: [],
  webhookLogs: [],
  statsData: [],
}).write();

module.exports = db;
