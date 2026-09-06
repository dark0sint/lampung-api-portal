const express = require('express');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const { dispatchWebhookEvent } = require('../utils/webhookDispatcher');

const router = express.Router();
router.use(requireLogin);

/**
 * @openapi
 * /api/webhooks:
 *   get:
 *     summary: Daftar webhook milik pengguna
 *     tags: [Webhooks]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', (req, res) => {
  res.json(db.get('webhooks').filter({ userId: req.user.id }).value());
});

/**
 * @openapi
 * /api/webhooks:
 *   post:
 *     summary: Mendaftarkan URL webhook untuk menerima notifikasi pembaruan data
 *     tags: [Webhooks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url: { type: string }
 *               event: { type: string, default: 'data.updated' }
 */
router.post('/', (req, res) => {
  const { url, event = 'data.updated' } = req.body;
  if (!url || !/^https?:\/\//.test(url)) {
    return res.status(400).json({ error: 'bad_request', message: 'URL webhook tidak valid (harus diawali http/https).' });
  }
  const webhook = {
    id: uuid(),
    userId: req.user.id,
    url,
    event,
    secret: crypto.randomBytes(16).toString('hex'),
    active: true,
    createdAt: new Date().toISOString(),
  };
  db.get('webhooks').push(webhook).write();
  res.status(201).json(webhook);
});

router.put('/:id', (req, res) => {
  const wh = db.get('webhooks').find({ id: req.params.id, userId: req.user.id }).value();
  if (!wh) return res.status(404).json({ error: 'not_found' });
  const { active } = req.body;
  db.get('webhooks').find({ id: req.params.id }).assign({ active: !!active }).write();
  res.json(db.get('webhooks').find({ id: req.params.id }).value());
});

router.delete('/:id', (req, res) => {
  const wh = db.get('webhooks').find({ id: req.params.id, userId: req.user.id }).value();
  if (!wh) return res.status(404).json({ error: 'not_found' });
  db.get('webhooks').remove({ id: req.params.id }).write();
  res.json({ message: 'Webhook dihapus.' });
});

/**
 * @openapi
 * /api/webhooks/{id}/test:
 *   post:
 *     summary: Mengirim event uji coba ke URL webhook
 *     tags: [Webhooks]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/:id/test', async (req, res) => {
  const wh = db.get('webhooks').find({ id: req.params.id, userId: req.user.id }).value();
  if (!wh) return res.status(404).json({ error: 'not_found' });
  const result = await dispatchWebhookEvent(wh.event, { pesan: 'Ini adalah notifikasi uji coba dari Portal Data Lampung.' });
  res.json({ message: 'Event uji coba dikirim.', ...result });
});

router.get('/:id/logs', (req, res) => {
  const wh = db.get('webhooks').find({ id: req.params.id, userId: req.user.id }).value();
  if (!wh) return res.status(404).json({ error: 'not_found' });
  res.json(db.get('webhookLogs').filter({ webhookId: wh.id }).sortBy('timestamp').reverse().value());
});

module.exports = router;
