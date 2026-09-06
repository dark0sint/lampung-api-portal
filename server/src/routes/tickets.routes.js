const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { requireLogin, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireLogin);

/**
 * @openapi
 * /api/tickets:
 *   get:
 *     summary: Daftar tiket permintaan data (milik sendiri, atau semua jika admin)
 *     tags: [Ticketing]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', (req, res) => {
  const all = db.get('tickets').value();
  const rows = req.user.role === 'admin' ? all : all.filter((t) => t.userId === req.user.id);
  res.json(rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

/**
 * @openapi
 * /api/tickets:
 *   post:
 *     summary: Mengajukan permintaan data statistik baru yang belum tersedia di API
 *     tags: [Ticketing]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [judul, deskripsi]
 *             properties:
 *               judul: { type: string }
 *               deskripsi: { type: string }
 *               wilayah: { type: string }
 *               kategori: { type: string }
 */
router.post('/', (req, res) => {
  const { judul, deskripsi, wilayah, kategori } = req.body;
  if (!judul || !deskripsi) {
    return res.status(400).json({ error: 'bad_request', message: 'Judul dan deskripsi permintaan wajib diisi.' });
  }
  const ticket = {
    id: uuid(),
    userId: req.user.id,
    requesterName: req.user.name,
    judul,
    deskripsi,
    wilayah: wilayah || '-',
    kategori: kategori || '-',
    status: 'diajukan', // diajukan -> diproses -> selesai / ditolak
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.get('tickets').push(ticket).write();
  res.status(201).json(ticket);
});

/**
 * @openapi
 * /api/tickets/{id}/status:
 *   put:
 *     summary: Mengubah status tiket (khusus admin)
 *     tags: [Ticketing]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id/status', requireRole('admin'), (req, res) => {
  const { status } = req.body;
  const valid = ['diajukan', 'diproses', 'selesai', 'ditolak'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'bad_request', message: 'Status tidak valid.' });

  const ticket = db.get('tickets').find({ id: req.params.id }).value();
  if (!ticket) return res.status(404).json({ error: 'not_found' });

  db.get('tickets').find({ id: req.params.id }).assign({ status, updatedAt: new Date().toISOString() }).write();
  res.json(db.get('tickets').find({ id: req.params.id }).value());
});

module.exports = router;
