import React from 'react';

const MAP = {
  active: ['Aktif', 'badge-active'],
  revoked: ['Nonaktif', 'badge-revoked'],
  diajukan: ['Diajukan', 'badge-open'],
  diproses: ['Diproses', 'badge-progress'],
  selesai: ['Selesai', 'badge-done'],
  ditolak: ['Ditolak', 'badge-revoked'],
  success: ['Berhasil', 'badge-done'],
  failed: ['Gagal', 'badge-revoked'],
};

export default function StatusBadge({ status }) {
  const [label, cls] = MAP[status] || [status, 'badge-progress'];
  return <span className={`inline-block px-2.5 py-0.5 rounded-sm text-xs font-medium ${cls}`}>{label}</span>;
}
