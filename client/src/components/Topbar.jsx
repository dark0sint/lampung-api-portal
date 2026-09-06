import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_LABEL = { public: 'Publik', akademisi: 'Akademisi', dinas: 'Dinas/OPD', admin: 'Administrator' };

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-paper/95 backdrop-blur border-b border-[#E7E2D6] px-4 sm:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-xl px-1 focus-ring" aria-label="Buka menu">☰</button>
        <h1 className="font-display font-semibold text-xl text-ink">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline text-xs px-2.5 py-1 rounded-sm bg-teal/10 text-teal font-medium">
          {ROLE_LABEL[user?.role] || 'Publik'}
        </span>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium leading-tight">{user?.name}</p>
          <p className="text-xs text-muted leading-tight">{user?.instansi || user?.email}</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="text-sm text-muted hover:text-danger transition-colors focus-ring px-2 py-1"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
