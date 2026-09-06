const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { JWT_SECRET, requireLogin } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Daftar akun pengguna portal (dinas, akademisi, atau publik)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               instansi: { type: string }
 *               role: { type: string, enum: [public, akademisi, dinas] }
 *     responses:
 *       201: { description: Akun berhasil dibuat }
 */
router.post('/register', (req, res) => {
  const { name, email, password, instansi, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'bad_request', message: 'Nama, email, dan kata sandi wajib diisi.' });
  }
  const existing = db.get('users').find({ email }).value();
  if (existing) {
    return res.status(409).json({ error: 'email_exists', message: 'Email sudah terdaftar.' });
  }
  const allowedRoles = ['public', 'akademisi', 'dinas'];
  const finalRole = allowedRoles.includes(role) ? role : 'public';

  const user = {
    id: uuid(),
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: finalRole, // permintaan role "dinas" idealnya diverifikasi manual oleh admin sebelum aktif penuh
    instansi: instansi || '',
    createdAt: new Date().toISOString(),
  };
  db.get('users').push(user).write();
  res.status(201).json({ message: 'Pendaftaran berhasil. Silakan masuk.' });
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Masuk ke dashboard portal
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Berhasil masuk, mengembalikan token }
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.get('users').find({ email }).value();
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) {
    return res.status(401).json({ error: 'invalid_credentials', message: 'Email atau kata sandi salah.' });
  }
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, instansi: user.instansi },
  });
});

router.get('/me', requireLogin, (req, res) => {
  const { id, name, email, role, instansi } = req.user;
  res.json({ id, name, email, role, instansi });
});

module.exports = router;
