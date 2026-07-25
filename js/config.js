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

  // URL Web App Google Apps Script (lihat google-apps-script/Code.gs & README.md)
  // Setelah deploy, tempel URL-nya di sini, contoh:
  // "https://script.google.com/macros/s/AKfycb.../exec"
  scriptURL: "https://script.google.com/macros/s/AKfycbx0vGnCKqdzPuC7ytGSNsvcRz6lVv5EnVCQYRQ-5kpAzbYwjq82QfX6HBLCtIaJBigOiw/exec",

  // Nomor WhatsApp tujuan (format internasional, tanpa tanda + atau spasi)
  whatsapp: {
    alfa: "6281247770168",
    lenny: "6285859866900"
  },

  // Warna dress code yang disarankan ke tamu. Ubah "color" (kode HEX) dan
  // "label" sesuai keinginan. Boleh tambah/kurangi jumlah warnanya.
  dressCode: [
    { color: "#6b1f21", label: "Maroon" },
    { color: "#b8843c", label: "Gold" },
    { color: "#3a2115", label: "Coklat Tua" }
  ],

  // Link live streaming (YouTube/Instagram/Zoom, dll). Kosongkan ("") kalau
  // tidak ada live streaming -- section-nya otomatis akan disembunyikan.
  liveStreamingURL: ""
};
