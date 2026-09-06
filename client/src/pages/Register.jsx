import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', instansi: '', role: 'public' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Pendaftaran gagal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-md section-panel rounded-sm p-8">
        <h2 className="font-display text-2xl font-semibold text-ink mb-1">Daftar akun portal</h2>
        <p className="text-sm text-muted mb-6">
          Akun peran "Dinas/OPD" akan diverifikasi lebih lanjut untuk akses data internal antar-dinas.
        </p>

        {success && (
          <div className="mb-4 text-sm text-success bg-success/10 border border-success/20 px-3 py-2 rounded-sm">
            Pendaftaran berhasil. Mengalihkan ke halaman masuk…
          </div>
        )}
        {error && (
          <div className="mb-4 text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama lengkap</label>
            <input required className="w-full border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring outline-none"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required className="w-full border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring outline-none"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kata sandi</label>
            <input type="password" required minLength={6} className="w-full border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring outline-none"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instansi / Afiliasi</label>
            <input className="w-full border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring outline-none"
              placeholder="mis. Universitas Lampung / Dinas PUPR"
              value={form.instansi} onChange={(e) => setForm({ ...form, instansi: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Saya mendaftar sebagai</label>
            <select className="w-full border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring outline-none bg-white"
              value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="public">Publik / Umum</option>
              <option value="akademisi">Akademisi / Peneliti</option>
              <option value="dinas">Dinas / OPD Pemprov Lampung</option>
            </select>
          </div>
          <button disabled={loading}
            className="w-full bg-ink text-white py-2.5 rounded-sm text-sm font-medium hover:bg-ink-2 transition-colors disabled:opacity-60">
            {loading ? 'Memproses…' : 'Daftar'}
          </button>
        </form>

        <p className="text-sm text-muted mt-6">
          Sudah punya akun? <Link to="/login" className="text-teal font-medium hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
