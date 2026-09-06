// Menentukan kategori data mana yang boleh dilihat berdasarkan peran API Key.
// public  -> hanya data bersensitivitas "public"
// akademisi -> sama seperti public (bisa disesuaikan kebijakan per OPD)
// dinas / admin -> boleh melihat data "public" dan "internal"
function allowedSensitivity(role) {
  if (role === 'dinas' || role === 'admin') return ['public', 'internal'];
  return ['public'];
}

function filterBySensitivity(rows, role) {
  const allowed = allowedSensitivity(role);
  return rows.filter((r) => allowed.includes(r.sensitivitas));
}

module.exports = { allowedSensitivity, filterBySensitivity };
