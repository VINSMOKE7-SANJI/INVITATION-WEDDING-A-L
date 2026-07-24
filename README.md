# Undangan Pernikahan Digital — Alfa & Lenny

Website undangan pernikahan statis (HTML/CSS/JS), siap diunggah ke **GitHub Pages**.
Tema: elegant dark forest green & gold, sesuai referensi video yang diminta.

---

## 1. Struktur folder

```
├── index.html                 -> halaman utama undangan
├── css/style.css              -> semua styling
├── js/config.js               -> pengaturan mudah (tanggal, jumlah foto, URL backend RSVP)
├── js/script.js                -> logika (countdown, galeri, RSVP, dll)
├── assets/images/              -> semua foto (16 galeri + cover + foto mempelai)
├── assets/audio/                -> taruh musik latar di sini (music.mp3)
└── google-apps-script/Code.gs  -> backend RSVP ke Google Sheets
```

Semua **16 foto galeri, foto cover, dan foto kedua mempelai masih placeholder**
bertema hijau-emas — gantilah dengan foto asli kalian (lihat bagian 3).

---

## 2. Upload ke GitHub & aktifkan GitHub Pages

Repo tujuan kamu: `https://github.com/VINSMOKE7-SANJI/INVITATION-WEDDING-A-L.git`

```bash
git clone https://github.com/VINSMOKE7-SANJI/INVITATION-WEDDING-A-L.git
cd INVITATION-WEDDING-A-L
# salin semua isi folder ini ke dalam folder repo tadi
git add .
git commit -m "Undangan pernikahan Alfa & Lenny"
git push
```

Lalu di GitHub:
1. Buka repo → **Settings** → **Pages**
2. Source: `Deploy from a branch` → Branch: `main` / folder `/ (root)` → **Save**
3. Tunggu 1-2 menit, link undangan akan aktif di:
   `https://vinsmoke7-sanji.github.io/INVITATION-WEDDING-A-L/`

### Mengirim ke tamu dengan nama otomatis
Tambahkan `?to=NamaTamu` di akhir link, contoh:
```
https://vinsmoke7-sanji.github.io/INVITATION-WEDDING-A-L/?to=Bapak+Budi+Santoso
```
Nama tamu akan otomatis muncul di halaman pembuka undangan.

---

## 3. Mengganti foto

Ganti file di `assets/images/` dengan nama file **yang sama persis**:

| Nama file | Kegunaan |
|---|---|
| `cover.jpg` | Foto besar di halaman hero (setelah undangan dibuka) |
| `groom.jpg` | Foto mempelai pria (bulat) |
| `bride.jpg` | Foto mempelai wanita (bulat) |
| `bg-open.jpg` | Foto latar di halaman sampul/pembuka |
| `gallery-01.jpg` s/d `gallery-16.jpg` | 16 foto galeri |
| `og-image.jpg` | Gambar preview saat link dibagikan di WhatsApp/sosmed |

Kalau jumlah foto galeri kamu kurang/lebih dari 16, ubah angka
`galleryCount` di `js/config.js`.

---

## 4. Menambahkan musik latar

Taruh file musik dengan nama **`music.mp3`** di folder `assets/audio/`.
Tombol musik ada di pojok kiri bawah — otomatis mencoba memutar begitu
tombol "Buka Undangan" ditekan (browser modern butuh interaksi pengguna
dulu sebelum bisa autoplay, dan tombol itulah interaksinya).

---

## 5. Menyambungkan RSVP ke Google Sheets (WAJIB agar RSVP tersimpan)

RSVP & ucapan tamu disimpan otomatis ke Google Sheets memakai Google Apps
Script (gratis, tanpa perlu server sendiri).

1. Buka [sheets.google.com](https://sheets.google.com) → buat spreadsheet baru,
   beri nama misalnya **"RSVP Alfa Lenny"**.
2. Di spreadsheet itu: **Extensions → Apps Script**.
3. Hapus semua kode default, lalu tempel seluruh isi file
   `google-apps-script/Code.gs` dari folder ini.
4. Klik **Deploy → New deployment**.
   - Klik ikon gerigi → pilih tipe **Web app**.
   - Description: bebas, misal "RSVP Backend".
   - Execute as: **Me**.
   - Who has access: **Anyone**.
   - Klik **Deploy**, lalu izinkan akses (Authorize access) dengan akun Google-mu.
5. Salin **URL Web app** yang muncul (diakhiri `/exec`).
6. Buka `js/config.js`, isi:
   ```js
   scriptURL: "TEMPEL_URL_WEB_APP_DI_SINI",
   ```
7. Commit & push perubahan ini ke GitHub.

Setelah itu, sheet akan otomatis punya tab **"RSVP"** dengan kolom:
`Timestamp | Nama | Kehadiran | JumlahTamu | Ucapan | WA_Target`.

> Setiap kali Code.gs diedit lagi di masa depan, kamu perlu **Deploy → Manage
> deployments → edit (ikon pensil) → New version → Deploy** supaya perubahan
> ikut aktif di URL yang sama.

### Soal fitur "pilihan WhatsApp" setelah RSVP dikirim
Setelah tamu menekan **Kirim Konfirmasi**, muncul 2 tombol: **Alfa** dan
**Lenny**. Saat salah satu diklik:
- WhatsApp terbuka otomatis ke nomor yang dipilih dengan pesan konfirmasi.
- Pilihan nomor itu ikut tersimpan ke kolom `WA_Target` di Google Sheet
  (jadi kalian tahu tamu tsb menghubungi lewat WA siapa).
- Kolom itu **sengaja tidak ditampilkan** di dinding ucapan/RSVP publik di
  website — tamu lain hanya melihat nama, status kehadiran, dan ucapan.

Nomor WhatsApp diatur di `js/config.js` bagian `whatsapp`.

---

## 6. Mengubah tanggal, lokasi, teks lainnya

- **Tanggal countdown**: `js/config.js` → `weddingDateTime`.
- **Tanggal/jam/lokasi yang tertulis, nama mempelai, dll**: langsung edit
  teksnya di `index.html` (sudah diberi komentar per bagian, contoh
  `<!-- ===== ACARA (EVENTS) ===== -->`).
- **Link Google Maps**: sudah dipasang sesuai link yang diberikan. Kalau mau
  memperbarui, cari `href="https://maps.app.goo.gl/...">Buka di Google Maps`
  di `index.html`.

---

## 7. Cek lokal sebelum upload (opsional)

Buka `index.html` langsung di browser, atau jalankan server lokal:
```bash
python3 -m http.server 8080
```
lalu buka `http://localhost:8080` di browser.

---

Selamat mempersiapkan hari bahagianya, Alfa & Lenny! 🤍
