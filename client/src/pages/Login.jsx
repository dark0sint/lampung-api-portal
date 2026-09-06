import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal masuk. Periksa email dan kata sandi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-ink">
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'repeating-linear-gradient(135deg, #C89B3C 0 2px, transparent 2px 28px)',
        }} />
        <div className="relative">
          <p className="text-gold font-display font-semibold text-2xl">Portal Data Lampung</p>
          <p className="text-white/50 text-sm mt-1">Diskominfotik Provinsi Lampung</p>
        </div>
        <div className="relative max-w-md">
          <p className="font-display text-white text-3xl leading-snug">
            Satu pintu akses data statistik daerah untuk OPD, akademisi, dan publik.
          </p>
          <p className="text-white/50 text-sm mt-4">
            Kependudukan, ekonomi, ketenagakerjaan, kemiskinan, pendidikan, dan kesehatan —
            terdokumentasi, terpantau, dan siap dipakai lewat API.
          </p>
        </div>
        <p className="relative text-white/30 text-xs">© {new Date().getFullYear()} Pemerintah Provinsi Lampung</p>
      </div>

      <div className="flex-1 bg-paper flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold text-ink mb-1">Masuk ke dashboard</h2>
          <p className="text-sm text-muted mb-6">Kelola API Key dan lihat pemakaian Anda.</p>

          {error && (
            <div className="mb-4 text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email" required
                className="w-full border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring focus:border-gold outline-none"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@instansi.go.id"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kata sandi</label>
              <input
                type="password" required
                className="w-full border border-[#D8D2C2] rounded-sm px-3 py-2 text-sm focus-ring focus:border-gold outline-none"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-ink text-white py-2.5 rounded-sm text-sm font-medium hover:bg-ink-2 transition-colors disabled:opacity-60"
            >
              {loading ? 'Memproses…' : 'Masuk'}
            </button>
          </form>

          <p className="text-sm text-muted mt-6">
            Belum punya akun? <Link to="/register" className="text-teal font-medium hover:underline">Daftar di sini</Link>
          </p>
          <div className="mt-8 text-xs text-muted bg-white border border-[#E7E2D6] rounded-sm p-3">
            <p className="font-medium mb-1">Akun demo admin</p>
            <p className="mono">admin@komdigi.lampungprov.go.id</p>
            <p className="mono">Admin#12345</p>
          </div>
        </div>
      </div>
    </div>
  );
}
