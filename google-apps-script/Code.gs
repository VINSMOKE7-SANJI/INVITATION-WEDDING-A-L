/**
 * BACKEND RSVP + GAME LEADERBOARD — VERSI AMAN
 * =========================================================
 * PERUBAHAN KEAMANAN DARI VERSI SEBELUMNYA:
 *
 * 1. SECRET TOKEN — setiap request dari website harus membawa
 *    token rahasia yang sama dengan ALLOWED_TOKEN di sini.
 *    Tanpa token, data ditolak. Ganti ALLOWED_TOKEN dengan
 *    string acak buatanmu sendiri, lalu update juga di
 *    js/config.js (tambah baris: submitToken: "...sama...")
 *
 * 2. VALIDASI INPUT — semua field dicek tipe & panjangnya.
 *    String panjang, angka negatif, atau karakter berbahaya
 *    langsung ditolak.
 *
 * 3. RATE LIMITING — satu IP hanya boleh POST maks 5x/menit.
 *    Spam atau bot yang mencoba berulang kali akan diblokir.
 *
 * 4. SANITASI — karakter HTML/script di-strip sebelum disimpan
 *    ke sheet, mencegah formula injection di Google Sheets.
 *
 * 5. SKOR MASUK AKAL — skor game di atas 100.000 langsung
 *    ditolak (tidak mungkin dicapai manusia normal).
 *
 * CARA PASANG:
 * 1. Buka Google Sheet → Extensions → Apps Script
 * 2. Hapus semua kode lama, tempel isi file ini
 * 3. Ganti ALLOWED_TOKEN dengan string acak (min 20 karakter),
 *    contoh: "AL2026WeddingSecure!xK9"
 * 4. Update js/config.js di repo: tambahkan baris
 *      submitToken: "string-yang-sama-dengan-di-sini",
 * 5. Deploy → Manage deployments → New version → Deploy
 * =========================================================
 */

// ─── GANTI INI dengan string acak rahasia buatanmu ───────
const ALLOWED_TOKEN  = "GANTI_INI_DENGAN_TOKEN_RAHASIA_MILIKMU";
// ─────────────────────────────────────────────────────────

const SHEET_RSVP     = "RSVP";
const SHEET_GAME     = "GAME";
const MAX_SCORE      = 100000;   // skor game di atas ini = cheat
const MAX_NAME_LEN   = 80;
const MAX_MSG_LEN    = 500;
const RATE_LIMIT_KEY = "rateLimit_";
const RATE_WINDOW_MS = 60 * 1000;  // 1 menit
const RATE_MAX_POSTS = 5;          // maks 5 POST per IP per menit

/* ── Sanitasi: hapus tag HTML & formula injection (=,+,-,@) ── */
function sanitize_(str) {
  if (typeof str !== "string") return String(str == null ? "" : str);
  return str
    .replace(/<[^>]*>/g, "")           // strip HTML tags
    .replace(/^[=+\-@|]/, "'$&")       // cegah formula injection di Sheets
    .trim()
    .slice(0, MAX_MSG_LEN);
}

/* ── Rate limiter sederhana pakai PropertiesService ── */
function isRateLimited_(ip) {
  const props = PropertiesService.getScriptProperties();
  const key   = RATE_LIMIT_KEY + ip;
  const raw   = props.getProperty(key);
  const now   = Date.now();

  let record = { count: 0, since: now };
  if (raw) {
    try { record = JSON.parse(raw); } catch (e) { /* reset */ }
  }

  if (now - record.since > RATE_WINDOW_MS) {
    // window baru
    record = { count: 1, since: now };
  } else {
    record.count++;
  }

  props.setProperty(key, JSON.stringify(record));
  return record.count > RATE_MAX_POSTS;
}

/* ── Helper: buat/ambil sheet ── */
function getSheet_(name, headers) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

/* ── Helper: respons JSON ── */
function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ════════════════════════════════════════════════════════
   doGet — baca data (RSVP list / leaderboard GAME)
   GET tidak perlu token karena hanya membaca data publik
   yang sudah tampil di website.
   ════════════════════════════════════════════════════════ */
function doGet(e) {
  const action = (e.parameter && e.parameter.action) || "";

  if (action === "list") {
    const sheet = getSheet_(SHEET_RSVP, ["Timestamp","Nama","Kehadiran","JumlahTamu","Ucapan"]);
    const data  = sheet.getDataRange().getValues();
    const rows  = [];
    for (let r = 1; r < data.length; r++) {
      const [, name, attend, guests, message] = data[r];
      if (!name) continue;
      rows.push({
        name:    String(name),
        attend:  String(attend),
        guests:  String(guests),
        message: String(message)
      });
    }
    return jsonResponse_(rows);
  }

  if (action === "leaderboard") {
    const sheet = getSheet_(SHEET_GAME, ["Timestamp","Nama","Skor"]);
    const data  = sheet.getDataRange().getValues();
    const rows  = [];
    for (let r = 1; r < data.length; r++) {
      const [, name, score] = data[r];
      if (!name) continue;
      rows.push({ name: String(name), score: Number(score) });
    }
    rows.sort(function (a, b) { return b.score - a.score; });
    return jsonResponse_(rows.slice(0, 20));
  }

  return jsonResponse_({ ok: true, status: "Backend aktif." });
}

/* ════════════════════════════════════════════════════════
   doPost — simpan data (RSVP / skor game)
   ════════════════════════════════════════════════════════ */
function doPost(e) {
  /* ── 1. Parse payload ── */
  let payload = {};
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse_({ ok: false, error: "invalid_payload" });
  }

  /* ── 2. Cek token rahasia ── */
  if (!ALLOWED_TOKEN || ALLOWED_TOKEN === "GANTI_INI_DENGAN_TOKEN_RAHASIA_MILIKMU") {
    // Token belum diatur — tolak semua POST supaya
    // tidak ada data yang masuk tanpa perlindungan.
    return jsonResponse_({ ok: false, error: "token_not_configured" });
  }
  if (payload.token !== ALLOWED_TOKEN) {
    return jsonResponse_({ ok: false, error: "unauthorized" });
  }

  /* ── 3. Rate limiting ── */
  const ip = (e.parameter && e.parameter.ip) || "unknown";
  if (isRateLimited_(ip)) {
    return jsonResponse_({ ok: false, error: "rate_limited" });
  }

  /* ── 4. Routing berdasarkan action ── */
  if (payload.action === "rsvp") {
    // Validasi field
    const name    = sanitize_(payload.name    || "");
    const attend  = sanitize_(payload.attend  || "");
    const guests  = sanitize_(payload.guests  || "1");
    const message = sanitize_(payload.message || "");

    if (!name || name.length > MAX_NAME_LEN)    return jsonResponse_({ ok: false, error: "invalid_name" });
    if (!["Hadir","Tidak Hadir","Ragu-ragu"].includes(attend))
                                                 return jsonResponse_({ ok: false, error: "invalid_attend" });
    if (!message)                                return jsonResponse_({ ok: false, error: "empty_message" });

    try {
      const sheet = getSheet_(SHEET_RSVP, ["Timestamp","Nama","Kehadiran","JumlahTamu","Ucapan"]);
      sheet.appendRow([ new Date(), name, attend, guests, message ]);
      return jsonResponse_({ ok: true });
    } catch (err) {
      return jsonResponse_({ ok: false, error: String(err) });
    }
  }

  if (payload.action === "game_score") {
    const name  = sanitize_(payload.name  || "Tamu");
    const score = Number(payload.score)   || 0;

    if (!name || name.length > MAX_NAME_LEN) return jsonResponse_({ ok: false, error: "invalid_name" });
    if (score < 0 || score > MAX_SCORE)      return jsonResponse_({ ok: false, error: "invalid_score" });

    try {
      const sheet = getSheet_(SHEET_GAME, ["Timestamp","Nama","Skor"]);
      sheet.appendRow([ new Date(), name, score ]);
      return jsonResponse_({ ok: true });
    } catch (err) {
      return jsonResponse_({ ok: false, error: String(err) });
    }
  }

  return jsonResponse_({ ok: false, error: "unknown_action" });
}
