import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import client from '../api/client';

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState([]);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState({});

  function load() { client.get('/api/webhooks').then((res) => setWebhooks(res.data)); }
  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    setError('');
    try {
      await client.post('/api/webhooks', { url, event: 'data.updated' });
      setUrl('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'URL tidak valid.');
    }
  }

  async function toggle(wh) {
    await client.put(`/api/webhooks/${wh.id}`, { active: !wh.active });
    load();
  }

  async function remove(wh) {
    if (!confirm('Hapus webhook ini?')) return;
    await client.delete(`/api/webhooks/${wh.id}`);
    load();
  }

  async function test(wh) {
    await client.post(`/api/webhooks/${wh.id}/test`);
    const res = await client.get(`/api/webhooks/${wh.id}/logs`);
    setLogs((prev) => ({ ...prev, [wh.id]: res.data }));
  }

  return (
    <Layout title="Webhook Notifikasi">
      <div className="section-panel rounded-sm p-6 mb-6">
        <h3 className="font-display font-semibold text-base mb-1">Daftarkan URL notifikasi</h3>
        <p className="text-sm text-muted mb-4">
          Sistem akan mengirim POST request ke URL ini setiap kali ada pembaruan data statistik baru dari Komdigi Lampung.
        </p>
        <form onSubmit={create} className="flex flex-col sm:flex-row gap-3">
          <input required placeholder="https://aplikasi-anda.go.id/webhook/lampung-data"
            className="flex-1 border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring outline-none mono"
            value={url} onChange={(e) => setUrl(e.target.value)} />
          <button className="bg-ink text-white px-5 py-2 rounded-sm text-sm font-medium hover:bg-ink-2 transition-colors">
            Daftarkan Webhook
          </button>
        </form>
        {error && <p className="text-sm text-danger mt-2">{error}</p>}
      </div>

      <div className="section-panel rounded-sm p-6">
        <h3 className="font-display font-semibold text-base mb-4">Webhook Terdaftar</h3>
        <div className="space-y-4">
          {webhooks.length === 0 && <p className="text-sm text-muted">Belum ada webhook terdaftar.</p>}
          {webhooks.map((wh) => (
            <div key={wh.id} className="border border-[#EFEBE0] rounded-sm p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <code className="mono text-xs break-all">{wh.url}</code>
                <span className={`text-xs px-2 py-0.5 rounded-sm ${wh.active ? 'badge-active' : 'badge-revoked'}`}>
                  {wh.active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <p className="text-xs text-muted mb-3">Event: {wh.event} · Secret: <span className="mono">{wh.secret.slice(0, 10)}…</span></p>
              <div className="flex gap-3 text-xs">
                <button onClick={() => test(wh)} className="text-teal font-medium hover:underline">Kirim Uji Coba</button>
                <button onClick={() => toggle(wh)} className="text-teal font-medium hover:underline">{wh.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                <button onClick={() => remove(wh)} className="text-danger font-medium hover:underline">Hapus</button>
              </div>
              {logs[wh.id] && (
                <div className="mt-3 border-t border-[#F3EFE4] pt-2 space-y-1">
                  {logs[wh.id].slice(0, 3).map((l) => (
                    <p key={l.id} className="text-xs mono text-muted">
                      {new Date(l.timestamp).toLocaleTimeString('id-ID')} — {l.status} — {l.detail}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
