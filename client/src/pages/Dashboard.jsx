import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Layout from '../components/Layout';
import client from '../api/client';

export default function Dashboard() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/api/dashboard/usage').then((res) => setUsage(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Ringkasan Pemakaian">
      {loading && <p className="text-sm text-muted">Memuat data…</p>}
      {usage && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="API Key Aktif" value={usage.totalApiKeys} />
            <StatCard label="Total Request" value={usage.totalRequests} />
            <StatCard label="Request Gagal" value={usage.failedRequests} tone="danger" />
            <StatCard label="Tingkat Sukses" value={`${usage.successRate}%`} tone="teal" />
          </div>

          <div className="section-panel rounded-sm p-6">
            <h3 className="font-display font-semibold text-base mb-4">Request 7 hari terakhir</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={usage.requestsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E2D6" />
                <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="jumlah" stroke="#1F7A6C" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="section-panel rounded-sm p-6">
            <h3 className="font-display font-semibold text-base mb-4">Kuota per API Key</h3>
            <div className="space-y-3">
              {usage.keys.length === 0 && <p className="text-sm text-muted">Anda belum memiliki API Key. Buat di menu "API Key Saya".</p>}
              {usage.keys.map((k) => (
                <div key={k.id} className="flex items-center justify-between text-sm border-b border-[#EFEBE0] pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{k.name}</p>
                    <p className="text-xs text-muted">Peran: {k.role} · Batas {k.limitPerMinute} req/menit</p>
                  </div>
                  <p className="mono text-xs text-muted">{k.used} request terkirim</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-panel rounded-sm p-6">
            <h3 className="font-display font-semibold text-base mb-4">Riwayat request terbaru</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-[#EFEBE0]">
                    <th className="py-2 pr-4">Waktu</th>
                    <th className="py-2 pr-4">Endpoint</th>
                    <th className="py-2 pr-4">Metode</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.recentLogs.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-muted">Belum ada aktivitas request.</td></tr>
                  )}
                  {usage.recentLogs.map((log) => (
                    <tr key={log.id} className="border-b border-[#F3EFE4] last:border-0">
                      <td className="py-2 pr-4 mono text-xs">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                      <td className="py-2 pr-4 mono text-xs">{log.endpoint}</td>
                      <td className="py-2 pr-4">{log.method}</td>
                      <td className={`py-2 font-medium ${log.status >= 400 ? 'text-danger' : 'text-success'}`}>{log.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function StatCard({ label, value, tone }) {
  const toneClass = tone === 'danger' ? 'text-danger' : tone === 'teal' ? 'text-teal' : 'text-ink';
  return (
    <div className="section-panel rounded-sm p-5">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={`font-display text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
