const express = require('express');
const db = require('../db');
const { requireLogin, requireRole } = require('../middleware/auth');
const { LIMIT_PER_ROLE } = require('../middleware/rateLimit');
const { dispatchWebhookEvent } = require('../utils/webhookDispatcher');

const router = express.Router();
router.use(requireLogin);

/**
 * @openapi
 * /api/dashboard/usage:
 *   get:
 *     summary: Ringkasan pemakaian API, kuota, dan log request milik pengguna
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/usage', (req, res) => {
  const myKeys = db.get('apikeys').filter({ userId: req.user.id }).value();
  const keyIds = myKeys.map((k) => k.id);
  const logs = db.get('logs').filter((l) => keyIds.includes(l.apiKeyId)).value();

  const now = new Date();
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const requestsByDay = last7Days.map((day) => ({
    tanggal: day,
    jumlah: logs.filter((l) => l.timestamp.slice(0, 10) === day).length,
  }));

  const totalRequests = logs.length;
  const failedRequests = logs.filter((l) => l.status >= 400).length;

  res.json({
    totalApiKeys: myKeys.length,
    totalRequests,
    failedRequests,
    successRate: totalRequests ? Math.round(((totalRequests - failedRequests) / totalRequests) * 1000) / 10 : 100,
    requestsByDay,
    recentLogs: logs.slice(-20).reverse(),
    keys: myKeys.map((k) => ({
      id: k.id,
      name: k.name,
      role: k.role,
      status: k.status,
      used: k.used || 0,
      limitPerMinute: LIMIT_PER_ROLE[k.role] || LIMIT_PER_ROLE.public,
    })),
  });
});

/**
 * @openapi
 * /api/dashboard/admin-overview:
 *   get:
 *     summary: Ringkasan sistem untuk admin (total pengguna, key, request, tiket)
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/admin-overview', requireRole('admin'), (req, res) => {
  res.json({
    totalUsers: db.get('users').size().value(),
    totalApiKeys: db.get('apikeys').size().value(),
    activeApiKeys: db.get('apikeys').filter({ status: 'active' }).size().value(),
    totalRequests: db.get('logs').size().value(),
    openTickets: db.get('tickets').filter((t) => t.status === 'diajukan' || t.status === 'diproses').size().value(),
    totalWebhooks: db.get('webhooks').size().value(),
    usersByRole: ['public', 'akademisi', 'dinas', 'admin'].map((role) => ({
      role,
      jumlah: db.get('users').filter({ role }).size().value(),
    })),
  });
});

/**
 * @openapi
 * /api/dashboard/publish-update:
 *   post:
 *     summary: (Admin) Menandai adanya pembaruan data baru dan memicu notifikasi webhook ke seluruh pelanggan
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/publish-update', requireRole('admin'), async (req, res) => {
  const { kategori, keterangan } = req.body;
  const result = await dispatchWebhookEvent('data.updated', {
    kategori: kategori || 'Umum',
    keterangan: keterangan || 'Data statistik terbaru telah tersedia di Portal Data Lampung.',
    waktu: new Date().toISOString(),
  });
  res.json({ message: 'Notifikasi pembaruan data dikirim ke pelanggan webhook.', ...result });
});

router.get('/users', requireRole('admin'), (req, res) => {
  res.json(db.get('users').map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, instansi: u.instansi, createdAt: u.createdAt })).value());
});

router.put('/users/:id/role', requireRole('admin'), (req, res) => {
  const { role } = req.body;
  const valid = ['public', 'akademisi', 'dinas', 'admin'];
  if (!valid.includes(role)) return res.status(400).json({ error: 'bad_request' });
  const user = db.get('users').find({ id: req.params.id }).value();
  if (!user) return res.status(404).json({ error: 'not_found' });
  db.get('users').find({ id: req.params.id }).assign({ role }).write();
  res.json({ message: 'Peran pengguna diperbarui.' });
});

module.exports = router;
