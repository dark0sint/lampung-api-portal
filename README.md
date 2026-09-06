# Portal API Data Statistik Terbuka — Komdigi Provinsi Lampung

Aplikasi web + REST API untuk berbagi data statistik daerah Provinsi Lampung
kepada dinas lain, akademisi, dan publik. Dibangun dengan **React (Vite)** di
sisi klien dan **Node.js/Express** di sisi server.

## Fitur

1. **Manajemen API Key mandiri** — buat, aktifkan/nonaktifkan, dan hapus API Key dari dashboard.
2. **Dokumentasi interaktif** (Swagger/OpenAPI) di `/api-docs`, lengkap dengan tombol *Try it out*.
3. **Filter dinamis**: kabupaten/kota, kategori statistik, tahun, bulan.
4. **Format output**: JSON, CSV, dan XLSX (`?format=json|csv|xlsx`).
5. **Paginasi**: `?page=&limit=` (maks. 500 baris/halaman).
6. **Rate limiting**: 30/90/180/600 request per menit tergantung peran (publik/akademisi/dinas/admin).
7. **RBAC**: data bertanda `internal` hanya terbuka untuk peran `dinas` dan `admin`.
8. **Dashboard kuota & log** pemakaian API per pengguna.
9. **Ticketing** permintaan data baru yang belum tersedia di API.
10. **Webhook** notifikasi otomatis saat admin mempublikasikan pembaruan data.

## Struktur folder

```
lampung-api-portal/
├── server/     # REST API (Express + lowdb)
├── client/     # Dashboard (React + Vite + Tailwind)
└── docker-compose.yml
```

## Menjalankan secara lokal (tanpa Docker)

Prasyarat: Node.js 18+ terpasang.

```bash
# 1. Backend
cd server
cp .env.example .env      # sesuaikan JWT_SECRET
npm install
npm run seed               # isi data contoh + akun admin default
npm run dev                 # jalan di http://localhost:4000

# 2. Frontend (terminal baru)
cd client
npm install
npm run dev                 # jalan di http://localhost:5173
```

Akun admin default (ganti password setelah login pertama):

```
Email    : admin@komdigi.lampungprov.go.id
Password : Admin#12345
```

Dokumentasi API interaktif: **http://localhost:4000/api-docs**

## Instalasi di server produksi (VPS/cloud)

### Opsi A — Docker Compose (disarankan)

```bash
git clone <repo-anda> lampung-api-portal
cd lampung-api-portal
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
docker compose up -d --build
```

- Frontend akan berjalan di port **80** (proxy otomatis ke API).
- Data tersimpan persisten di volume Docker `api_data`.
- Pasang reverse proxy (Nginx/Caddy) + SSL (Let's Encrypt) di depan port 80 untuk domain publik, mis. `data.lampungprov.go.id`.

### Opsi B — Manual dengan PM2 + Nginx

```bash
# Backend
cd server && npm install --omit=dev && npm run seed
pm2 start server.js --name lampung-api

# Frontend (build statis)
cd ../client && npm install && npm run build
# Salin isi folder client/dist ke /var/www/lampung-portal
# Konfigurasi Nginx: serve dist/ sebagai static, proxy /api dan /api-docs ke localhost:4000
```

## Migrasi ke database produksi

Backend memakai `lowdb` (file JSON) agar mudah diinstal tanpa setup database.
Untuk trafik tinggi/multi-server, ganti `server/src/db.js` dengan koneksi
PostgreSQL/MySQL (interface `db.get('koleksi').find(...)` dapat dipetakan ke
query SQL setara) tanpa perlu mengubah routes.

## Keamanan yang sudah diterapkan

- Password di-hash dengan bcrypt.
- Sesi dashboard memakai JWT (12 jam).
- HTTP security headers via Helmet.
- Rate limiting per API Key dan per IP (endpoint login).
- Validasi peran (RBAC) di level middleware sebelum data dikembalikan.

Sebelum go-live: pindahkan `JWT_SECRET` ke secret manager, aktifkan HTTPS,
dan pertimbangkan audit keamanan independen untuk data yang bersifat internal.

## Pratinjau tampilan (UI/UX)

Buka file `ui-preview.html` di browser mana pun (tanpa perlu instalasi) untuk
melihat gambaran visual dashboard: halaman masuk, ringkasan pemakaian,
manajemen API Key, dokumentasi interaktif, jelajah data, dan tiket permintaan data.
