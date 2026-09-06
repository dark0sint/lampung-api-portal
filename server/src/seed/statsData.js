// Data contoh (dummy) untuk demo — struktur mengikuti pola data BPS/OPD.
// Ganti dengan data resmi dari OPD terkait saat implementasi produksi.
const { v4: uuid } = require('uuid');

const WILAYAH = [
  'Bandar Lampung', 'Metro', 'Lampung Selatan', 'Lampung Tengah', 'Lampung Timur',
  'Lampung Utara', 'Lampung Barat', 'Pesawaran', 'Pringsewu', 'Tanggamus',
  'Tulang Bawang', 'Tulang Bawang Barat', 'Way Kanan', 'Mesuji', 'Pesisir Barat',
];

const KATEGORI = [
  { nama: 'Kependudukan', indikator: 'Jumlah Penduduk', satuan: 'jiwa', base: 250000, sensitif: false },
  { nama: 'Ekonomi', indikator: 'Laju Inflasi', satuan: '%', base: 3.2, sensitif: false },
  { nama: 'Ketenagakerjaan', indikator: 'Tingkat Pengangguran Terbuka', satuan: '%', base: 4.1, sensitif: false },
  { nama: 'Kemiskinan', indikator: 'Persentase Penduduk Miskin', satuan: '%', base: 11.5, sensitif: false },
  { nama: 'Pendidikan', indikator: 'Angka Partisipasi Sekolah', satuan: '%', base: 92.4, sensitif: false },
  { nama: 'Kesehatan', indikator: 'Angka Harapan Hidup', satuan: 'tahun', base: 70.1, sensitif: false },
  { nama: 'Anggaran Internal', indikator: 'Realisasi Belanja OPD', satuan: 'Rp juta', base: 15000, sensitif: true },
  { nama: 'Pengawasan Internal', indikator: 'Temuan Audit Aktif', satuan: 'kasus', base: 3, sensitif: true },
];

function seedRandom(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

function generateStatsData() {
  const rows = [];
  const tahunList = [2022, 2023, 2024, 2025];
  const bulanList = [1, 4, 7, 10];

  WILAYAH.forEach((wilayah) => {
    KATEGORI.forEach((k) => {
      tahunList.forEach((tahun) => {
        bulanList.forEach((bulan) => {
          const rnd = seedRandom(`${wilayah}-${k.indikator}-${tahun}-${bulan}`);
          const variasi = (rnd() - 0.5) * 0.2 * k.base;
          const nilai = Math.round((k.base + variasi + (tahun - 2022) * k.base * 0.01) * 100) / 100;
          rows.push({
            id: uuid(),
            kabupaten_kota: wilayah,
            tahun,
            bulan,
            kategori: k.nama,
            indikator: k.indikator,
            nilai,
            satuan: k.satuan,
            sensitivitas: k.sensitif ? 'internal' : 'public',
            updatedAt: new Date(tahun, bulan - 1, 15).toISOString(),
          });
        });
      });
    });
  });
  return rows;
}

module.exports = { generateStatsData, WILAYAH, KATEGORI };
