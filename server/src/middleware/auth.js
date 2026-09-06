const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'ganti-secret-ini-di-env';

// Autentikasi untuk dashboard (login pengguna via JWT di header Authorization: Bearer <token>)
function requireLogin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'unauthorized', message: 'Silakan login terlebih dahulu.' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.get('users').find({ id: payload.sub }).value();
    if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Sesi tidak valid.' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized', message: 'Token tidak valid atau kedaluwarsa.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'forbidden', message: 'Anda tidak memiliki izin untuk aksi ini.' });
    }
    next();
  };
}

// Autentikasi untuk konsumsi API publik/data (header x-api-key)
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (!key) {
    return res.status(401).json({
      error: 'missing_api_key',
      message: 'Sertakan API Key melalui header x-api-key. Buat API Key gratis di dashboard portal.',
    });
  }
  const record = db.get('apikeys').find({ key }).value();
  if (!record) {
    return res.status(401).json({ error: 'invalid_api_key', message: 'API Key tidak ditemukan.' });
  }
  if (record.status !== 'active') {
    return res.status(403).json({ error: 'api_key_revoked', message: 'API Key telah dinonaktifkan.' });
  }
  req.apiKey = record;
  next();
}

module.exports = { requireLogin, requireRole, requireApiKey, JWT_SECRET };
