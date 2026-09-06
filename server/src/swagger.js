const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portal API Data Statistik Terbuka — Diskominfotik Provinsi Lampung',
      version: '1.0.0',
      description:
        'API resmi untuk mengakses data statistik daerah Provinsi Lampung. ' +
        'Gunakan menu "Authorize" untuk mengisi API Key Anda, lalu coba langsung setiap endpoint (Try it out).',
      contact: { name: 'Diskominfotik Provinsi Lampung' },
    },
    servers: [{ url: '/', description: 'Server saat ini' }],
    tags: [
      { name: 'Auth', description: 'Registrasi & login dashboard' },
      { name: 'API Keys', description: 'Manajemen API Key mandiri' },
      { name: 'Data Statistik', description: 'Endpoint data publik/internal (butuh x-api-key)' },
      { name: 'Ticketing', description: 'Permintaan data baru' },
      { name: 'Webhooks', description: 'Notifikasi otomatis pembaruan data' },
      { name: 'Dashboard', description: 'Kuota, log, dan statistik pemakaian' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        apiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJSDoc(options);
