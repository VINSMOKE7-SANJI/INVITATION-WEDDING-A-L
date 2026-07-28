/**
 * BACKEND RSVP + GAME LEADERBOARD -> GOOGLE SHEETS
 * =========================================================
 * Cara pakai singkat (lengkapnya ada di README.md):
 * 1. Buat Google Sheet baru. Tab-tab di bawah ini akan dibuat OTOMATIS oleh
 *    skrip ini saat pertama kali dipakai -- tidak perlu dibuat manual.
 *      - "RSVP"      : Timestamp | Nama | Kehadiran | JumlahTamu | Ucapan
 *      - "GameScore" : Timestamp | Nama | Skor
 * 2. Buka Extensions > Apps Script, hapus isi default, tempel semua isi file ini.
 * 3. Klik Deploy > New deployment > Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Salin URL yang dihasilkan (.../exec) ke variabel scriptURL di js/config.js
 *
 * Catatan privasi: data RSVP (nama, kehadiran, ucapan) HANYA tersimpan di
 * Google Sheet ini. Tidak ada nomor WhatsApp tamu yang diminta atau
 * disimpan di mana pun oleh website ini.
 * =========================================================
 */

const SHEET_RSVP = "RSVP";
const SHEET_GAME = "GameScore";

function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function doPost(e) {
  let payload = {};
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse_({ ok: false, error: "invalid_payload" });
  }

  if (payload.action === "rsvp") {
    const sheet = getSheet_(SHEET_RSVP, ["Timestamp", "Nama", "Kehadiran", "JumlahTamu", "Ucapan"]);
    sheet.appendRow([
      new Date(),
      payload.name || "",
      payload.attend || "",
      payload.guests || "",
      payload.message || ""
    ]);
    return jsonResponse_({ ok: true });
  }

  if (payload.action === "game_score") {
    const sheet = getSheet_(SHEET_GameScore, ["Timestamp", "Nama", "Skor"]);
    sheet.appendRow([new Date(), payload.name || "Tamu", payload.score || 0]);
    return jsonResponse_({ ok: true });
  }

  return jsonResponse_({ ok: false, error: "unknown_action" });
}

function doGet(e) {
  const action = e.parameter.action;

  if (action === "list") {
    const sheet = getSheet_(SHEET_RSVP, ["Timestamp", "Nama", "Kehadiran", "JumlahTamu", "Ucapan"]);
    const data = sheet.getDataRange().getValues();
    const rows = [];
    for (let r = 1; r < data.length; r++) {
      const [, name, attend, guests, message] = data[r];
      if (!name) continue;
      rows.push({ name: name, attend: attend, guests: guests, message: message });
    }
    return jsonResponse_(rows);
  }

  if (action === "leaderboard") {
    const sheet = getSheet_(SHEET_GameScore, ["Timestamp", "Nama", "Skor"]);
    const data = sheet.getDataRange().getValues();
    const rows = [];
    for (let r = 1; r < data.length; r++) {
      const [, name, score] = data[r];
      if (!name) continue;
      rows.push({ name: name, score: score });
    }
    rows.sort(function (a, b) { return b.score - a.score; });
    return jsonResponse_(rows.slice(0, 20)); // top 20 saja
  }

  return jsonResponse_({ ok: true, message: "RSVP backend aktif." });
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
