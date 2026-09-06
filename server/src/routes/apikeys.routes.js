const express = require('express');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const { LIMIT_PER_ROLE } = require('../middleware/rateLimit');

const router = express.Router();
router.use(requireLogin);

function generateKey() {
  return 'lpg_' + crypto.randomBytes(24).toString('hex');
}

/**
 * @openapi
 * /api/keys:
 *   get:
 *     summary: Daftar API Key milik pengguna yang sedang login
 *     tags: [API Keys]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Daftar API Key }
 */
router.get('/', (req, res) => {
  const keys = db.get('apikeys').filter({ userId: req.user.id }).value();
  res.json(keys.map(({ id, name, key, role, status, createdAt, lastUsedAt, used }) => ({
    id, name, key, role, status, createdAt, lastUsedAt, used, limitPerMinute: LIMIT_PER_ROLE[role] || LIMIT_PER_ROLE.public,
  })));
});

/**
 * @openapi
 * /api/keys:
 *   post:
 *     summary: Membuat API Key baru
 *     tags: [API Keys]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, description: "Label API Key, mis. 'Aplikasi Monitoring Dinas X'" }
 *     responses:
 *       201: { description: API Key dibuat }
 */
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'bad_request', message: 'Nama/label API Key wajib diisi.' });

  // Peran akses API key mengikuti peran akun pengguna (public/akademisi/dinas),
  // sehingga data internal hanya terbuka untuk akun dinas yang sudah diverifikasi.
  const record = {
    id: uuid(),
    userId: req.user.id,
    name,
    key: generateKey(),
    role: req.user.role,
    status: 'active',
    used: 0,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };
  db.get('apikeys').push(record).write();
  res.status(201).json(record);
});

/**
 * @openapi
 * /api/keys/{id}:
 *   put:
 *     summary: Memperbarui nama atau status (aktif/nonaktif) API Key
 *     tags: [API Keys]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id', (req, res) => {
  const record = db.get('apikeys').find({ id: req.params.id, userId: req.user.id }).value();
  if (!record) return res.status(404).json({ error: 'not_found', message: 'API Key tidak ditemukan.' });

  const { name, status } = req.body;
  const patch = {};
  if (name) patch.name = name;
  if (status && ['active', 'revoked'].includes(status)) patch.status = status;

  db.get('apikeys').find({ id: req.params.id }).assign(patch).write();
  res.json(db.get('apikeys').find({ id: req.params.id }).value());
});

/**
 * @openapi
 * /api/keys/{id}:
 *   delete:
 *     summary: Menghapus API Key
 *     tags: [API Keys]
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', (req, res) => {
  const record = db.get('apikeys').find({ id: req.params.id, userId: req.user.id }).value();
  if (!record) return res.status(404).json({ error: 'not_found', message: 'API Key tidak ditemukan.' });
  db.get('apikeys').remove({ id: req.params.id }).write();
  res.json({ message: 'API Key dihapus.' });
});

module.exports = router;
