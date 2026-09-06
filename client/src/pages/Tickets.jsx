import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ judul: '', deskripsi: '', wilayah: '', kategori: '' });
  const [error, setError] = useState('');

  function load() { client.get('/api/tickets').then((res) => setTickets(res.data)); }
  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.judul || !form.deskripsi) return;
    try {
      await client.post('/api/tickets', form);
      setForm({ judul: '', deskripsi: '', wilayah: '', kategori: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim permintaan.');
    }
  }

  async function setStatus(id, status) {
    await client.put(`/api/tickets/${id}/status`, { status });
    load();
  }

  return (
    <Layout title="Permintaan Data Baru">
      <div className="section-panel rounded-sm p-6 mb-6">
        <h3 className="font-display font-semibold text-base mb-1">Data yang dicari belum tersedia?</h3>
        <p className="text-sm text-muted mb-4">Ajukan permintaan resmi dan tim OPD terkait akan meninjaunya.</p>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Judul permintaan, mis. 'Data lalu lintas kendaraan per kecamatan'"
            className="w-full border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring outline-none"
            value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Wilayah terkait (opsional)"
              className="border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring outline-none"
              value={form.wilayah} onChange={(e) => setForm({ ...form, wilayah: e.target.value })} />
            <input placeholder="Kategori data (opsional)"
              className="border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring outline-none"
              value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} />
          </div>
          <textarea required rows={3} placeholder="Jelaskan kebutuhan data Anda secara rinci"
            className="w-full border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring outline-none"
            value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
          <button className="bg-ink text-white px-5 py-2 rounded-sm text-sm font-medium hover:bg-ink-2 transition-colors">
            Kirim Permintaan
          </button>
          {error && <p className="text-sm text-danger">{error}</p>}
        </form>
      </div>

      <div className="section-panel rounded-sm p-6">
        <h3 className="font-display font-semibold text-base mb-4">{user?.role === 'admin' ? 'Semua Tiket' : 'Tiket Saya'}</h3>
        <div className="space-y-3">
          {tickets.length === 0 && <p className="text-sm text-muted">Belum ada permintaan data.</p>}
          {tickets.map((t) => (
            <div key={t.id} className="border border-[#EFEBE0] rounded-sm p-4">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                <p className="font-medium text-sm">{t.judul}</p>
                <StatusBadge status={t.status} />
              </div>
              <p className="text-sm text-muted mb-2">{t.deskripsi}</p>
              <p className="text-xs text-muted">
                {t.wilayah !== '-' && `Wilayah: ${t.wilayah} · `}
                {t.kategori !== '-' && `Kategori: ${t.kategori} · `}
                Diajukan {new Date(t.createdAt).toLocaleDateString('id-ID')}
                {user?.role === 'admin' && ` · oleh ${t.requesterName}`}
              </p>
              {user?.role === 'admin' && (
                <div className="flex gap-2 mt-3">
                  {['diajukan', 'diproses', 'selesai', 'ditolak'].map((s) => (
                    <button key={s} onClick={() => setStatus(t.id, s)}
                      className={`text-xs px-2 py-1 rounded-sm border ${t.status === s ? 'border-gold bg-gold/10' : 'border-[#D8D2C2]'}`}>
                      {s}
                    </button>
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
