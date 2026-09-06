const axios = require('axios');
const { v4: uuid } = require('uuid');
const db = require('../db');

// Mengirim notifikasi ke semua webhook aktif yang berlangganan event tertentu.
// Dipanggil saat admin mempublikasikan pembaruan data (lihat routes/dashboard.routes.js).
async function dispatchWebhookEvent(eventName, payload) {
  const subscribers = db.get('webhooks').filter({ event: eventName, active: true }).value();

  const results = await Promise.allSettled(
    subscribers.map((wh) =>
      axios.post(
        wh.url,
        { event: eventName, data: payload, sentAt: new Date().toISOString() },
        { headers: { 'X-Webhook-Secret': wh.secret }, timeout: 5000 }
      )
    )
  );

  results.forEach((result, idx) => {
    const wh = subscribers[idx];
    db.get('webhookLogs')
      .push({
        id: uuid(),
        webhookId: wh.id,
        event: eventName,
        status: result.status === 'fulfilled' ? 'success' : 'failed',
        detail: result.status === 'fulfilled' ? `HTTP ${result.value.status}` : String(result.reason?.message || 'error'),
        timestamp: new Date().toISOString(),
      })
      .write();
  });

  return { totalSubscribers: subscribers.length };
}

module.exports = { dispatchWebhookEvent };
