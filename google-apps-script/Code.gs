/**
 * BACKEND RSVP + GAME LEADERBOARD → GOOGLE SHEETS
 * =========================================================
 * Tab yang dibuat otomatis:
 *   - "RSVP" : Timestamp | Nama | Kehadiran | JumlahTamu | Ucapan
 *   - "GAME"  : Timestamp | Nama | Skor
 *
 * Cara pakai:
 * 1. Buka Google Sheet → Extensions → Apps Script
 * 2. Hapus semua kode, tempel isi file ini
 * 3. Deploy → New deployment → Web app
 *    Execute as: Me   |   Who has access: Anyone
 * 4. Salin URL /exec → tempel ke scriptURL di js/config.js
 * 5. Setiap kali Code.gs diubah: Deploy → Manage deployments
 *    → edit (pensil) → New version → Deploy
 * =========================================================
 */

const SHEET_RSVP = "RSVP";
const SHEET_GAME = "GAME";

/* --------------------------------------------------------
   Helper: ambil (atau buat) sheet dengan nama tertentu
   -------------------------------------------------------- */
function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

/* --------------------------------------------------------
   Helper: buat respons JSON dengan header CORS lengkap.
   Ini yang membuat browser tidak error CORS walau fetch
   dijalankan dari domain lain (GitHub Pages, dll).
   -------------------------------------------------------- */
function jsonResponse_(obj) {
  const output = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

/* --------------------------------------------------------
   doGet: ambil data (list RSVP / leaderboard GAME)
   -------------------------------------------------------- */
function doGet(e) {
  const action = (e.parameter && e.parameter.action) || "";

  if (action === "list") {
    const sheet = getSheet_(SHEET_RSVP, ["Timestamp","Nama","Kehadiran","JumlahTamu","Ucapan"]);
    const data = sheet.getDataRange().getValues();
    const rows = [];
    for (let r = 1; r < data.length; r++) {
      const [, name, attend, guests, message] = data[r];
      if (!name) continue;
      rows.push({ name: String(name), attend: String(attend), guests: String(guests), message: String(message) });
    }
    return jsonResponse_(rows);
  }

  if (action === "leaderboard") {
    const sheet = getSheet_(SHEET_GAME, ["Timestamp","Nama","Skor"]);
    const data = sheet.getDataRange().getValues();
    const rows = [];
    for (let r = 1; r < data.length; r++) {
      const [, name, score] = data[r];
      if (!name) continue;
      rows.push({ name: String(name), score: Number(score) });
    }
    rows.sort(function (a, b) { return b.score - a.score; });
    return jsonResponse_(rows.slice(0, 20));
  }

  return jsonResponse_({ ok: true, status: "RSVP + GAME backend aktif." });
}

/* --------------------------------------------------------
   doPost: simpan data (RSVP / skor game)

   Google Apps Script tidak bisa set header CORS pada POST
   response lewat ContentService. Solusinya: kirim data
   lewat URL parameter (GET) yang BISA baca response-nya.
   Kode di js/script.js dan js/game.js sudah disesuaikan.
   -------------------------------------------------------- */
function doPost(e) {
  let payload = {};
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse_({ ok: false, error: "invalid_payload" });
  }

  if (payload.action === "rsvp") {
    try {
      const sheet = getSheet_(SHEET_RSVP, ["Timestamp","Nama","Kehadiran","JumlahTamu","Ucapan"]);
      sheet.appendRow([
        new Date(),
        payload.name    || "",
        payload.attend  || "",
        payload.guests  || "",
        payload.message || ""
      ]);
      return jsonResponse_({ ok: true });
    } catch (err) {
      return jsonResponse_({ ok: false, error: String(err) });
    }
  }

  if (payload.action === "game_score") {
    try {
      const sheet = getSheet_(SHEET_GAME, ["Timestamp","Nama","Skor"]);
      sheet.appendRow([new Date(), payload.name || "Tamu", Number(payload.score) || 0]);
      return jsonResponse_({ ok: true });
    } catch (err) {
      return jsonResponse_({ ok: false, error: String(err) });
    }
  }

  return jsonResponse_({ ok: false, error: "unknown_action" });
}
