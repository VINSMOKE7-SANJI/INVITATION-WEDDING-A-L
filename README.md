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
├── js/game.js                       -> mini game tantangan skor (lihat bagian 11)
├── assets/images/                   -> semua foto (16 galeri + cover + foto mempelai)
├── assets/audio/                    -> taruh musik latar di sini (music.mp3)
├── assets/background.mp4            -> video latar (lihat spesifikasi di bawah)
├── assets/memories.mp4              -> video kenangan sebelum galeri foto (lihat bagian 10)
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

## 2. Video latar bingkai ornamen (assets/background.mp4)

Video ini adalah **bingkai ornamen daun emas & hijau di atas latar hitam**,
tampil dari bagian ayat "Efesus 5:28" sampai bagian akhir "Ucapan & Doa" --
video akan "menempel" (jadi bingkai tetap) selagi kamu scroll, dan bagian
tengahnya yang polos hitam otomatis "diisi" oleh konten undangan (teks,
foto, countdown, RSVP, dll) yang scroll di atasnya. Videonya sudah aku buat
sendiri secara prosedural (bukan foto stok) supaya bagian tengahnya benar-benar
polos/hitam dan konsisten sebagai bingkai, bukan gambar yang ditumpuk.

Video memakai `object-fit: contain` (bukan `cover`) supaya ke-4 sisi bingkai
**selalu utuh terlihat**, tidak pernah terpotong di layar mana pun -- area
kosong di luar video otomatis hitam, menyatu dengan warna latar videonya.

**Kalau mau ganti dengan bingkai/video lain buatanmu sendiri:**
- Resolusi: **1080 x 1920 px (portrait, rasio 9:16)**
- Bagian **tengah sebaiknya polos gelap/hitam** (itu area yang "ditempati"
  konten undangan), ornamen/dekorasi cukup di pinggiran sebagai bingkai
- Durasi bebas (contoh yang terpasang sekarang 5 detik, loop otomatis)
- Format: **MP4 (H.264)**, tanpa suara
- Ukuran file: usahakan di bawah 10 MB (video prosedural ini cuma ~140 KB)

Kalau video gagal dimuat (misal lupa upload), halaman otomatis jatuh ke
gradasi warna hijau-gelap-ke-hitam sebagai cadangan, jadi tampilan tidak rusak.

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
tombol "Buka Undangan" ditekan. Ikonnya sekarang jelas beda antara nyala
(speaker + gelombang suara, tombol warna maroon) dan mati (speaker dicoret,
tombol warna cream) -- sebelumnya cuma piringan berputar yang susah dibedakan.

Musik otomatis **jeda sendiri** saat tamu memutar video kenangan (bagian 11),
dan **otomatis lanjut lagi** begitu video kenangan selesai (atau di-pause).

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
`Timestamp | Nama | Kehadiran | JumlahTamu | Ucapan`.

> Tiap kali `Code.gs` diedit lagi, perlu **Deploy → Manage deployments → edit
> (pensil) → New version → Deploy** supaya perubahan aktif di URL yang sama.

**Live tanpa refresh:** halaman RSVP otomatis mengambil data terbaru dari
Sheet setiap `rsvpPollSeconds` detik (default 15 detik) — statistik
Hadir/Tidak Hadir/Ragu-ragu dan dinding ucapan ikut ter-update sendiri.

**Privasi:** website ini **tidak meminta atau menyimpan nomor WhatsApp tamu**
sama sekali. Data RSVP (nama, kehadiran, ucapan) hanya tersimpan di Google
Sheet kalian sendiri -- tidak ada tombol/alur yang mengarahkan ke WhatsApp
Alfa atau Lenny di form RSVP.

**Ucapan lebih dari 10:** otomatis muncul tombol "Selanjutnya" (atur jumlah
per halaman lewat `wishesPerPage` di `js/config.js`).

**Nama tamu terkunci dari link undangan:** kalau kamu kirim link pakai
`?to=NamaTamu` (lihat bagian 1), kolom nama di form RSVP otomatis terisi
nama itu dan **tidak bisa diketik ulang/diganti** oleh tamu -- ada catatan
kecil bergembok di bawah kolomnya. Ini mencegah orang yang tidak diundang
asal isi RSVP kalau link-nya tersebar. Kalau tamu buka link dasar tanpa
`?to=...`, kolom nama tetap bisa diisi bebas seperti biasa (fallback).
Nama yang sama ini juga otomatis jadi nama pemain di mini game (bagian 12).

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

## 10. Menu navigasi kiri atas

Ikon garis tiga (☰) di pojok kiri atas membuka panel menu berisi daftar
semua halaman (Beranda, Mempelai, Waktu & Tempat, Video Kenangan, Galeri,
Kirim Kado, RSVP & Ucapan, Main Game). Ada kolom pencarian di atasnya untuk
memfilter daftar sesuai judul yang diketik. Klik salah satu judul untuk
langsung lompat ke bagian itu.

---

## 11. Video kenangan (sebelum galeri foto)

Ada player video biasa (dengan tombol play/pause bawaan browser) di atas
galeri 16 foto, judulnya "Video Kenangan". Taruh video kalian dengan nama
**`assets/memories.mp4`** -- saat ini masih placeholder bertuliskan "Ganti
dengan video asli kalian di sini", tinggal ditimpa dengan file yang sama
namanya. Gambar sampul sebelum diputar (poster) memakai `assets/images/cover.jpg`.

---

## 12. Mini game (tantangan skor terbaik)

Ada game lari-hindari-rintangan original di atas footer (bukan Subway Surfers
asli -- itu properti berhak cipta, jadi aku buatkan versi original bergaya
serupa: 3 lajur, hindari rintangan, kumpulkan koin, kontrol geser/tap/panah).

- **Tutorial** ditampilkan dulu sebelum tombol "Mulai Main" (cara pindah
  jalur, lompat, dan kumpulkan koin).
- **Wajib isi RSVP dulu**: kalau tamu belum mengisi form RSVP, game akan
  menampilkan ajakan "Isi RSVP Dulu Yuk" -- ini supaya nama di papan
  peringkat selalu sama dengan nama yang dipakai saat konfirmasi kehadiran.
- **Main sekali per perangkat**: begitu game over, perangkat itu tidak bisa
  main lagi (disimpan di localStorage browser, bukan akun/login).
- **Batas waktu bermain**: otomatis ditutup setelah tanggal `gameEndDate` di
  `js/config.js` (default 23 Oktober 2026), meskipun tamu belum pernah main.
  Tanggal pengumuman pemenang (`gameAnnounceDate`, default 28 Oktober 2026)
  cuma ditampilkan sebagai teks info -- pengumumannya tetap kamu lakukan
  sendiri secara manual (WA/live/dll).
- **Papan peringkat** di bawah area game menampilkan top skor (jumlahnya
  diatur lewat `leaderboardTopCount`), live update otomatis seperti dinding
  ucapan RSVP.
- **Layar penuh**: ada tombol ⛶ di pojok kanan atas area game.
- Skor tersimpan ke tab baru **"GameScore"** di Google Sheet yang sama
  (kolom: Timestamp, Nama, Skor). Untuk menentukan pemenang, buka tab itu
  dan urutkan kolom Skor dari besar ke kecil (atau lihat langsung papan
  peringkat di website).

## 13. Cek lokal sebelum upload (opsional)

```bash
python3 -m http.server 8080
```
lalu buka `http://localhost:8080` di browser.

---

Selamat mempersiapkan hari bahagianya, Alfa & Lenny! 🤍
