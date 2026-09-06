import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ITEMS = [
  { to: '/', label: 'Ringkasan', icon: '◧' },
  { to: '/api-keys', label: 'API Key Saya', icon: '⚿' },
  { to: '/data', label: 'Jelajah Data', icon: '⌗' },
  { to: '/dokumentasi', label: 'Dokumentasi API', icon: '</>' },
  { to: '/tiket', label: 'Permintaan Data', icon: '✎' },
  { to: '/webhook', label: 'Webhook', icon: '⇄' },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = user?.role === 'admin' ? [...ITEMS, { to: '/admin', label: 'Panel Admin', icon: '⚙' }] : ITEMS;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed z-30 lg:static top-0 left-0 h-full w-64 bg-ink text-white flex flex-col
        transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="px-6 py-6 border-b border-white/10">
          <p className="font-display font-semibold text-lg leading-tight text-white">Portal Data<br/>Lampung</p>
          <p className="text-xs text-white/50 mt-1">Diskominfotik Prov. Lampung</p>
        </div>
        <nav className="flex-1 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-gold border-l-4 border-gold font-medium'
                    : 'text-white/70 border-l-4 border-transparent hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-white/10 text-xs text-white/40">
          v1.0 — Lingkungan Demo
        </div>
      </aside>
    </>
  );
}
