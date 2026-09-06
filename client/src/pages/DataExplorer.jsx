import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import client from '../api/client';

export default function DataExplorer() {
  const [meta, setMeta] = useState({ wilayah: [], kategori: [], tahun: [], bulan: [] });
  const [apiKeys, setApiKeys] = useState([]);
  const [activeKey, setActiveKey] = useState('');
  const [filters, setFilters] = useState({ kabupaten_kota: '', kategori: '', tahun: '', bulan: '' });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: { totalPages: 1, total: 0 } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/api/keys').then((res) => {
      setApiKeys(res.data);
      if (res.data.length > 0) setActiveKey(res.data[0].key);
    });
  }, []);

  useEffect(() => {
    if (!activeKey) return;
    client.get('/api/v1/meta', { headers: { 'x-api-key': activeKey } }).then((res) => setMeta(res.data)).catch(() => {});
  }, [activeKey]);

  async function search(targetPage = 1) {
    if (!activeKey) { setError('Anda memerlukan API Key aktif untuk menjelajah data. Buat di menu "API Key Saya".'); return; }
    setError('');
    setLoading(true);
    setPage(targetPage);
    try {
      const params = { ...filters, page: targetPage, limit: 10 };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await client.get('/api/v1/stats', { params, headers: { 'x-api-key': activeKey } });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (activeKey) search(1); /* eslint-disable-next-line */ }, [activeKey]);

  function download(format) {
    if (!activeKey) return;
    const params = new URLSearchParams({ ...filters, format });
    Object.keys(filters).forEach((k) => { if (!filters[k]) params.delete(k); });
    const url = `/api/v1/stats?${params.toString()}`;
    fetch(url, { headers: { 'x-api-key': activeKey } })
      .then((r) => r.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `statistik-lampung.${format}`;
        link.click();
      });
  }

  return (
    <Layout title="Jelajah Data Statistik">
      <div className="section-panel rounded-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <label className="text-sm font-medium shrink-0">Gunakan API Key</label>
          <select value={activeKey} onChange={(e) => setActiveKey(e.target.value)}
            className="border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm bg-white flex-1 mono focus-ring outline-none">
            {apiKeys.length === 0 && <option value="">Tidak ada API Key</option>}
            {apiKeys.map((k) => <option key={k.id} value={k.key}>{k.name} — {k.key.slice(0, 14)}…</option>)}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select label="Kabupaten/Kota" value={filters.kabupaten_kota} options={meta.wilayah}
            onChange={(v) => setFilters({ ...filters, kabupaten_kota: v })} />
          <Select label="Kategori" value={filters.kategori} options={meta.kategori.map((k) => k.nama)}
            onChange={(v) => setFilters({ ...filters, kategori: v })} />
          <Select label="Tahun" value={filters.tahun} options={meta.tahun}
            onChange={(v) => setFilters({ ...filters, tahun: v })} />
          <Select label="Bulan" value={filters.bulan} options={meta.bulan}
            onChange={(v) => setFilters({ ...filters, bulan: v })} />
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button onClick={() => search(1)} className="bg-ink text-white px-5 py-2 rounded-sm text-sm font-medium hover:bg-ink-2 transition-colors">
            Terapkan Filter
          </button>
          <button onClick={() => download('csv')} className="border border-[#D8D2C2] px-4 py-2 rounded-sm text-sm font-medium hover:border-gold transition-colors">
            Unduh CSV
          </button>
          <button onClick={() => download('xlsx')} className="border border-[#D8D2C2] px-4 py-2 rounded-sm text-sm font-medium hover:border-gold transition-colors">
            Unduh XLSX
          </button>
          <span className="text-xs text-muted ml-auto">Format JSON tersedia langsung lewat endpoint /api/v1/stats</span>
        </div>
        {error && <p className="text-sm text-danger mt-3">{error}</p>}
      </div>

      <div className="section-panel rounded-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-base">Hasil ({result.pagination?.total ?? 0} baris)</h3>
          {loading && <span className="text-xs text-muted">Memuat…</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-[#EFEBE0]">
                <th className="py-2 pr-4">Wilayah</th>
                <th className="py-2 pr-4">Kategori</th>
                <th className="py-2 pr-4">Indikator</th>
                <th className="py-2 pr-4">Periode</th>
                <th className="py-2 pr-4">Nilai</th>
                <th className="py-2">Sensitivitas</th>
              </tr>
            </thead>
            <tbody>
              {result.data.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-muted">Tidak ada data untuk filter ini.</td></tr>
              )}
              {result.data.map((row) => (
                <tr key={row.id} className="border-b border-[#F3EFE4] last:border-0">
                  <td className="py-2 pr-4">{row.kabupaten_kota}</td>
                  <td className="py-2 pr-4">{row.kategori}</td>
                  <td className="py-2 pr-4">{row.indikator}</td>
                  <td className="py-2 pr-4">{row.bulan}/{row.tahun}</td>
                  <td className="py-2 pr-4 mono">{row.nilai} {row.satuan}</td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-sm ${row.sensitivitas === 'internal' ? 'badge-open' : 'badge-active'}`}>
                      {row.sensitivitas}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result.pagination?.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4 text-sm">
            <button disabled={page <= 1} onClick={() => search(page - 1)} className="px-3 py-1 border border-[#D8D2C2] rounded-sm disabled:opacity-40">← Sebelumnya</button>
            <span className="text-muted">Halaman {page} dari {result.pagination.totalPages}</span>
            <button disabled={page >= result.pagination.totalPages} onClick={() => search(page + 1)} className="px-3 py-1 border border-[#D8D2C2] rounded-sm disabled:opacity-40">Berikutnya →</button>
          </div>
        )}
      </div>
    </Layout>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm bg-white focus-ring outline-none">
        <option value="">Semua</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
