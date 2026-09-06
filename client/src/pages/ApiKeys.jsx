import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import client from '../api/client';

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [name, setName] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState('');

  function load() {
    client.get('/api/keys').then((res) => setKeys(res.data));
  }
  useEffect(load, []);

  async function createKey(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return;
    try {
      await client.post('/api/keys', { name });
      setName('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat API Key.');
    }
  }

  async function toggleStatus(key) {
    const status = key.status === 'active' ? 'revoked' : 'active';
    await client.put(`/api/keys/${key.id}`, { status });
    load();
  }

  async function remove(key) {
    if (!confirm(`Hapus API Key "${key.name}"? Aplikasi yang memakainya akan langsung berhenti berfungsi.`)) return;
    await client.delete(`/api/keys/${key.id}`);
    load();
  }

  function copy(key) {
    navigator.clipboard.writeText(key.key);
    setCopiedId(key.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <Layout title="API Key Saya">
      <div className="section-panel rounded-sm p-6 mb-6">
        <h3 className="font-display font-semibold text-base mb-3">Buat API Key baru</h3>
        <form onSubmit={createKey} className="flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring outline-none"
            placeholder="Label, mis. 'Dashboard Monitoring Dinas Kesehatan'"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="bg-ink text-white px-5 py-2 rounded-sm text-sm font-medium hover:bg-ink-2 transition-colors">
            Buat API Key
          </button>
        </form>
        {error && <p className="text-sm text-danger mt-2">{error}</p>}
        <p className="text-xs text-muted mt-2">API Key mewarisi peran akun Anda dan menentukan batas request per menit serta akses data internal.</p>
      </div>

      <div className="section-panel rounded-sm p-6">
        <h3 className="font-display font-semibold text-base mb-4">Daftar API Key</h3>
        <div className="space-y-4">
          {keys.length === 0 && <p className="text-sm text-muted">Belum ada API Key. Buat satu di atas untuk mulai memanggil API.</p>}
          {keys.map((k) => (
            <div key={k.id} className="border border-[#EFEBE0] rounded-sm p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <p className="font-medium text-sm">{k.name}</p>
                <StatusBadge status={k.status} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <code className="mono text-xs bg-[#F3EFE4] px-2 py-1 rounded-sm break-all">{k.key}</code>
                <button onClick={() => copy(k)} className="text-xs text-teal font-medium hover:underline shrink-0">
                  {copiedId === k.id ? 'Tersalin' : 'Salin'}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span>Peran: {k.role} · Batas {k.limitPerMinute} req/menit · Terpakai: {k.used}x</span>
                <div className="flex gap-3">
                  <button onClick={() => toggleStatus(k)} className="text-teal font-medium hover:underline">
                    {k.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button onClick={() => remove(k)} className="text-danger font-medium hover:underline">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
