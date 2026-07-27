/* =========================================================
   KONFIGURASI UNDANGAN
   Ubah nilai-nilai di bawah ini sesuai kebutuhan.
   ========================================================= */
const CONFIG = {
  // Tanggal & jam pemberkatan dipakai sebagai target countdown
  // Format: "YYYY-MM-DDTHH:mm:ss" (WIB / GMT+7)
  weddingDateTime: "2026-10-25T07:00:00+07:00",

  // Jumlah foto di folder assets/images/gallery-01.jpg ... gallery-16.jpg
  galleryCount: 16,

  // Pembagian foto galeri ke dalam 3 baris marquee (berjalan otomatis).
  // Total nomor di sini harus sesuai dengan galleryCount di atas.
  galleryGroups: [
    { from: 1, to: 5 },
    { from: 6, to: 10 },
    { from: 11, to: 16 }
  ],

  // URL Web App Google Apps Script (lihat google-apps-script/Code.gs & README.md)
  // Setelah deploy, tempel URL-nya di sini, contoh:
  // "https://script.google.com/macros/s/AKfycb.../exec"
  scriptURL: "",

  // Berapa kali RSVP+stats dicek ulang otomatis (tanpa refresh), dalam detik.
  rsvpPollSeconds: 15,

  // Jumlah ucapan yang ditampilkan per halaman sebelum tombol "Selanjutnya".
  wishesPerPage: 10,

  // Nomor WhatsApp tujuan (format internasional, tanpa tanda + atau spasi)
  whatsapp: {
    alfa: "6281247770168",
    lenny: "6285859866900"
  },

  // Link live streaming (YouTube/Instagram/Zoom, dll). Kosongkan ("") kalau
  // tidak ada live streaming -- section-nya otomatis akan disembunyikan.
  liveStreamingURL: "",

  // Footer iklan "Order Undangan Digital" -- nomor WhatsApp tujuan.
  footerAdWhatsApp: "6281246211461",

  // Batas terakhir tamu boleh main game (setelah tanggal ini, game ditutup
  // otomatis meskipun tamu belum pernah main). Format sama seperti weddingDateTime.
  gameEndDate: "2026-10-23T23:59:59+07:00",

  // Tanggal pengumuman pemenang skor terbaik (cuma ditampilkan sebagai info teks).
  gameAnnounceDate: "2026-10-28T00:00:00+07:00",

  // Jumlah nama teratas yang ditampilkan di papan peringkat game.
  leaderboardTopCount: 10
};
