import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 min-w-0">
        <Topbar title={title} onMenuClick={() => setOpen(true)} />
        <main className="p-4 sm:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
