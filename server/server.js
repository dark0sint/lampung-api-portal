require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./src/swagger');
const authRoutes = require('./src/routes/auth.routes');
const apikeysRoutes = require('./src/routes/apikeys.routes');
const statsRoutes = require('./src/routes/stats.routes');
const ticketsRoutes = require('./src/routes/tickets.routes');
const webhooksRoutes = require('./src/routes/webhooks.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const { authRateLimiter } = require('./src/middleware/rateLimit');

require('./src/seed/run'); // otomatis isi data contoh + akun admin saat pertama kali dijalankan

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({ contentSecurityPolicy: false })); // CSP dimatikan agar Swagger UI tampil normal
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/keys', apikeysRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/v1', statsRoutes); // endpoint data publik: /api/v1/stats, /api/v1/meta

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Dokumentasi API — Portal Data Lampung',
}));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.use((req, res) => {
  res.status(404).json({ error: 'not_found', message: 'Endpoint tidak ditemukan.' });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error', message: 'Terjadi kesalahan pada server.' });
});

app.listen(PORT, () => {
  console.log(`Portal Data Lampung API berjalan di http://localhost:${PORT}`);
  console.log(`Dokumentasi interaktif: http://localhost:${PORT}/api-docs`);
});
