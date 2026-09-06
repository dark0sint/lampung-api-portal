const express = require('express');
const db = require('../db');
const { requireApiKey } = require('../middleware/auth');
const { apiKeyRateLimiter, usageLogger } = require('../middleware/rateLimit');
const { filterBySensitivity } = require('../middleware/rbac');
const { sendAsFormat } = require('../utils/exporter');
const { WILAYAH, KATEGORI } = require('../seed/statsData');

const router = express.Router();

/**
 * @openapi
 * /api/v1/stats:
 *   get:
 *     summary: Mengambil data statistik Provinsi Lampung dengan filter dinamis
 *     description: >
 *       Data internal (sensitivitas "internal") hanya akan muncul untuk API Key
 *       berperan "dinas" atau "admin". Gunakan parameter format=csv atau format=xlsx
 *       untuk mengunduh langsung.
 *     tags: [Data Statistik]
 *     security: [{ apiKeyAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: kabupaten_kota
 *         schema: { type: string }
 *         description: Nama kabupaten/kota di Lampung
 *       - in: query
 *         name: kategori
 *         schema: { type: string }
 *       - in: query
 *         name: tahun
 *         schema: { type: integer }
 *       - in: query
 *         name: bulan
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 25 }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, csv, xlsx], default: json }
 *     responses:
 *       200: { description: Data statistik sesuai filter }
 *       401: { description: API Key tidak valid }
 *       429: { description: Batas request per menit terlampaui }
 */
router.get('/stats', requireApiKey, apiKeyRateLimiter, usageLogger, (req, res) => {
  const { kabupaten_kota, kategori, tahun, bulan, format = 'json' } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 25, 1), 500);

  let rows = db.get('statsData').value();
  rows = filterBySensitivity(rows, req.apiKey.role);

  if (kabupaten_kota) rows = rows.filter((r) => r.kabupaten_kota.toLowerCase() === kabupaten_kota.toLowerCase());
  if (kategori) rows = rows.filter((r) => r.kategori.toLowerCase() === kategori.toLowerCase());
  if (tahun) rows = rows.filter((r) => String(r.tahun) === String(tahun));
  if (bulan) rows = rows.filter((r) => String(r.bulan) === String(bulan));

  const total = rows.length;

  if (format === 'csv' || format === 'xlsx') {
    // Untuk unduhan file, kirim seluruh hasil filter (tanpa paginasi) agar analisis tetap utuh.
    return sendAsFormat(res, rows, format, 'statistik-lampung');
  }

  const start = (page - 1) * limit;
  const paginated = rows.slice(start, start + limit);

  res.json({
    data: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

/**
 * @openapi
 * /api/v1/meta:
 *   get:
 *     summary: Daftar wilayah dan kategori yang tersedia (untuk membangun filter di aplikasi klien)
 *     tags: [Data Statistik]
 *     security: [{ apiKeyAuth: [] }]
 */
router.get('/meta', requireApiKey, apiKeyRateLimiter, usageLogger, (req, res) => {
  const kategori = filterBySensitivity(
    KATEGORI.map((k) => ({ nama: k.nama, sensitivitas: k.sensitif ? 'internal' : 'public' })),
    req.apiKey.role
  );
  res.json({
    wilayah: WILAYAH,
    kategori,
    tahun: [2022, 2023, 2024, 2025],
    bulan: [1, 4, 7, 10],
  });
});

module.exports = router;
