# Undangan Pernikahan Digital — Alfa & Lenny

Website undangan pernikahan statis (HTML/CSS/JS), siap diunggah ke **GitHub Pages**.
Tema: **cream/ivory + maroon + gold**, dengan latar video bergerak di bagian
tengah halaman dan galeri foto yang auto-scroll tanpa henti.

---

## Struktur folder

```
├── index.html                       -> halaman utama undangan
├── css/style.css                    -> semua styling
├── js/config.js                     -> pengaturan mudah (tanggal, galeri, backend, dll)
├── js/script.js                     -> logika (countdown, galeri, RSVP, dll)
├── assets/images/                   -> semua foto (16 galeri + cover + foto mempelai)
├── assets/audio/                    -> taruh musik latar di sini (music.mp3)
├── assets/background.mp4            -> video latar (lihat spesifikasi di bawah)
└── google-apps-script/Code.gs       -> backend RSVP ke Google Sheets
```

---

## 1. Upload ke GitHub & aktifkan GitHub Pages

Repo tujuan: `https://github.com/VINSMOKE7-SANJI/INVITATION-WEDDING-A-L.git`

```bash
git clone https://github.com/VINSMOKE7-SANJI/INVITATION-WEDDING-A-L.git
cd INVITATION-WEDDING-A-L
# salin semua isi folder ini ke dalam folder repo tadi
git add .
git commit -m "Update undangan Alfa & Lenny"
git push
```

Lalu di GitHub: **Settings → Pages** → Source: `Deploy from a branch` →
Branch `main` / folder `/ (root)` → **Save**. Tunggu 1-2 menit, link aktif di:
`https://vinsmoke7-sanji.github.io/INVITATION-WEDDING-A-L/`

**Kirim ke tamu dengan nama otomatis**: tambahkan `?to=NamaTamu` di akhir link.

> ⚠️ File video (`background.mp4`) dan musik bisa membuat ukuran repo lumayan
> besar. GitHub punya batas 100MB per file dan disarankan repo di bawah 1GB —
> pastikan video kamu sudah dikompres (lihat spesifikasi di bagian 2).

---

## 2. Video latar (assets/background.mp4)

Video ini tampil sebagai latar bergerak mulai dari bagian ayat "Efesus 5:28"
sampai bagian akhir "Ucapan & Doa" — video akan "menempel" di layar selagi
kamu scroll melewati bagian-bagian tersebut, lalu lepas normal setelahnya.

**Spesifikasi yang disarankan:**
- Resolusi: **1080 x 1920 px (portrait, rasio 9:16)**
- Durasi: **10–20 detik**, dibuat **loop mulus** (frame awal & akhir menyambung)
- Format: **MP4 (H.264)**, tanpa suara/di-mute
- Ukuran file: usahakan **di bawah 10 MB** (idealnya 3-8MB) supaya loading cepat
- Isi video sebaiknya gerakan **lembut & tidak ramai** (contoh: kelopak bunga
  jatuh perlahan, bokeh cahaya lembut, asap tipis, partikel emas mengambang)
  supaya teks di atasnya tetap mudah dibaca

Video contoh (placeholder) sudah aku sertakan supaya efeknya langsung bisa
dicoba — tinggal timpa file `assets/background.mp4` dengan video pilihanmu
sendiri (nama file harus tetap `background.mp4`).

Kalau video gagal dimuat (misal lupa upload), halaman otomatis jatuh ke
gradasi warna cream-ke-maroon sebagai cadangan, jadi tampilan tidak rusak.

---

## 3. Mengganti foto

Ganti file di `assets/images/` dengan nama file **yang sama persis**:

| Nama file | Kegunaan |
|---|---|
| `cover.jpg` | Foto besar di halaman hero & latar penutup |
| `groom.jpg` | Foto mempelai pria (bulat, mengambang otomatis) |
| `bride.jpg` | Foto mempelai wanita (bulat, mengambang otomatis) |
| `bg-open.jpg` | Foto latar di halaman sampul/pembuka |
| `gallery-01.jpg` s/d `gallery-16.jpg` | 16 foto galeri (berjalan otomatis) |
| `og-image.jpg` | Gambar preview saat link dibagikan di WhatsApp/sosmed |

Kalau jumlah foto galeri berubah, sesuaikan `galleryCount` **dan**
`galleryGroups` di `js/config.js` (pembagian 3 baris galeri yang berjalan).

---

## 4. Menambahkan musik latar

Taruh file musik dengan nama **`music.mp3`** di folder `assets/audio/`.
Tombol musik ada di pojok kiri bawah, otomatis mencoba memutar begitu
tombol "Buka Undangan" ditekan.

---

## 5. Menyambungkan RSVP ke Google Sheets (WAJIB agar RSVP tersimpan)

1. Buka [sheets.google.com](https://sheets.google.com) → buat spreadsheet baru,
   misalnya **"RSVP Alfa Lenny"**.
2. Di spreadsheet itu: **Extensions → Apps Script**.
3. Hapus semua kode default, tempel seluruh isi file `google-apps-script/Code.gs`.
4. **Deploy → New deployment** → tipe **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Klik **Deploy**, izinkan akses dengan akun Google-mu.
5. Salin **URL Web app** (diakhiri `/exec`) → tempel ke `scriptURL` di `js/config.js`.
6. Commit & push.

Sheet otomatis punya tab **"RSVP"** dengan kolom:
`Timestamp | Nama | Kehadiran | JumlahTamu | Ucapan | WA_Target`.

> Tiap kali `Code.gs` diedit lagi, perlu **Deploy → Manage deployments → edit
> (pensil) → New version → Deploy** supaya perubahan aktif di URL yang sama.

**Live tanpa refresh:** halaman RSVP otomatis mengambil data terbaru dari
Sheet setiap `rsvpPollSeconds` detik (default 15 detik) — statistik
Hadir/Tidak Hadir/Ragu-ragu dan dinding ucapan ikut ter-update sendiri.

**Pilihan WhatsApp setelah RSVP:** tamu bisa klik tombol Alfa/Lenny yang
tersimpan ke kolom `WA_Target` di Sheet, tapi **tidak** ditampilkan di
dinding ucapan publik.

**Ucapan lebih dari 10:** otomatis muncul tombol "Selanjutnya" (atur jumlah
per halaman lewat `wishesPerPage` di `js/config.js`).

---

## 6. Live streaming (opsional)

Isi `liveStreamingURL` di `js/config.js` dengan link YouTube/Zoom/dll.
Kosongkan (`""`) untuk menyembunyikan section ini otomatis.

---

## 7. Mengubah tanggal, lokasi, teks lainnya

- **Tanggal countdown**: `js/config.js` → `weddingDateTime`.
- **Teks/nama/tanggal/lokasi**: langsung edit di `index.html` (tiap bagian
  sudah diberi komentar, contoh `<!-- ===== ACARA (EVENTS) ===== -->`).
- **Peta**: sudah full interaktif — bisa discroll untuk zoom, digeser, dan
  ganti mode Satelit lewat ikon lapisan di pojok kiri bawah peta.

---

## 8. Kartu kado & tombol salin rekening

Kartu didesain gaya kartu debit premium (chip emas, ikon contactless, logo
GPN). Tombol **"Salin"** menyalin nomor rekening ke clipboard — setelah
diklik, tombol berubah jadi **"Tersalin ✓"** selama ±2 detik sebagai
konfirmasi, lalu kembali normal.

---

## 9. Footer iklan

Tombol iklan "Order Undangan Digital di MANGUNSONG TECH.AI" di paling
bawah halaman akan membuka chat WhatsApp ke nomor yang diatur di
`footerAdWhatsApp` (`js/config.js`).

---

## 10. Cek lokal sebelum upload (opsional)

```bash
python3 -m http.server 8080
```
lalu buka `http://localhost:8080` di browser.

---

Selamat mempersiapkan hari bahagianya, Alfa & Lenny! 🤍
