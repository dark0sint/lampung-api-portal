import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import client from '../api/client';

export default function AdminPanel() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [publishForm, setPublishForm] = useState({ kategori: '', keterangan: '' });
  const [publishMsg, setPublishMsg] = useState('');

  function load() {
    client.get('/api/dashboard/admin-overview').then((res) => setOverview(res.data));
    client.get('/api/dashboard/users').then((res) => setUsers(res.data));
  }
  useEffect(load, []);

  async function changeRole(id, role) {
    await client.put(`/api/dashboard/users/${id}/role`, { role });
    load();
  }

  async function publish(e) {
    e.preventDefault();
    const res = await client.post('/api/dashboard/publish-update', publishForm);
    setPublishMsg(`${res.data.message} (${res.data.totalSubscribers} pelanggan webhook diberi tahu)`);
    setPublishForm({ kategori: '', keterangan: '' });
  }

  return (
    <Layout title="Panel Admin">
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MiniStat label="Total Pengguna" value={overview.totalUsers} />
          <MiniStat label="API Key Aktif" value={overview.activeApiKeys} />
          <MiniStat label="Total Request" value={overview.totalRequests} />
          <MiniStat label="Tiket Terbuka" value={overview.openTickets} />
        </div>
      )}

      <div className="section-panel rounded-sm p-6 mb-6">
        <h3 className="font-display font-semibold text-base mb-1">Publikasikan pembaruan data</h3>
        <p className="text-sm text-muted mb-4">Memicu notifikasi webhook ke semua aplikasi pelanggan yang berlangganan.</p>
        <form onSubmit={publish} className="grid sm:grid-cols-2 gap-3">
          <input placeholder="Kategori data yang diperbarui" className="border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring outline-none"
            value={publishForm.kategori} onChange={(e) => setPublishForm({ ...publishForm, kategori: e.target.value })} />
          <input placeholder="Keterangan singkat" className="border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring outline-none"
            value={publishForm.keterangan} onChange={(e) => setPublishForm({ ...publishForm, keterangan: e.target.value })} />
          <button className="bg-ink text-white px-5 py-2 rounded-sm text-sm font-medium hover:bg-ink-2 transition-colors sm:col-span-2 w-fit">
            Kirim Notifikasi
          </button>
        </form>
        {publishMsg && <p className="text-sm text-success mt-2">{publishMsg}</p>}
      </div>

      <div className="section-panel rounded-sm p-6">
        <h3 className="font-display font-semibold text-base mb-4">Manajemen Peran Pengguna (RBAC)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-[#EFEBE0]">
                <th className="py-2 pr-4">Nama</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Instansi</th>
                <th className="py-2">Peran</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#F3EFE4] last:border-0">
                  <td className="py-2 pr-4">{u.name}</td>
                  <td className="py-2 pr-4 mono text-xs">{u.email}</td>
                  <td className="py-2 pr-4">{u.instansi || '-'}</td>
                  <td className="py-2">
                    <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}
                      className="border border-[#D8D2C2] rounded-sm px-2 py-1 text-xs bg-white">
                      <option value="public">public</option>
                      <option value="akademisi">akademisi</option>
                      <option value="dinas">dinas</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="section-panel rounded-sm p-5">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
