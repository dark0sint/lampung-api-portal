const rateLimit = require('express-rate-limit');
const { v4: uuid } = require('uuid');
const db = require('../db');

// Batas request/menit berbeda per peran API Key.
// Publik dibatasi ketat, akademisi & dinas mendapat kuota lebih besar.
const LIMIT_PER_ROLE = {
  public: 30,
  akademisi: 90,
  dinas: 180,
  admin: 600,
};

const apiKeyRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  keyGenerator: (req) => (req.apiKey ? req.apiKey.key : req.ip),
  max: (req) => {
    const role = req.apiKey ? req.apiKey.role : 'public';
    return LIMIT_PER_ROLE[role] || LIMIT_PER_ROLE.public;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: (req) => ({
    error: 'rate_limit_exceeded',
    message: 'Batas jumlah request per menit terlampaui. Coba lagi sebentar lagi atau ajukan kenaikan kuota.',
  }),
  handler: (req, res, next, options) => {
    logRequest(req, 429);
    res.status(429).json(options.message(req));
  },
});

// Rate limiter longgar untuk endpoint autentikasi (mencegah brute force login)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_attempts', message: 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.' },
});

function logRequest(req, status) {
  if (!req.apiKey) return;
  db.get('logs')
    .push({
      id: uuid(),
      apiKeyId: req.apiKey.id,
      userId: req.apiKey.userId,
      endpoint: req.originalUrl,
      method: req.method,
      status,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })
    .write();

  db.get('apikeys')
    .find({ id: req.apiKey.id })
    .assign({ lastUsedAt: new Date().toISOString(), used: (req.apiKey.used || 0) + 1 })
    .write();
}

// Middleware pencatat log + penghitung kuota bulanan (dipasang setelah requireApiKey)
function usageLogger(req, res, next) {
  res.on('finish', () => logRequest(req, res.statusCode));
  next();
}

module.exports = { apiKeyRateLimiter, authRateLimiter, usageLogger, LIMIT_PER_ROLE };
