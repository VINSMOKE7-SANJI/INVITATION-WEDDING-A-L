/**
 * BACKEND RSVP + GAME LEADERBOARD -> GOOGLE SHEETS
 * =========================================================
 * Cara pakai singkat (lengkapnya ada di README.md):
 * 1. Buat Google Sheet baru. Tab-tab di bawah ini akan dibuat OTOMATIS oleh
 *    skrip ini saat pertama kali dipakai -- tidak perlu dibuat manual.
 *      - "RSVP"      : Timestamp | Nama | Kehadiran | JumlahTamu | Ucapan | WA_Target
 *      - "GameScore" : Timestamp | Nama | Skor
 * 2. Buka Extensions > Apps Script, hapus isi default, tempel semua isi file ini.
 * 3. Klik Deploy > New deployment > Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Salin URL yang dihasilkan (.../exec) ke variabel scriptURL di js/config.js
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
    const sheet = getSheet_(SHEET_RSVP, ["Timestamp", "Nama", "Kehadiran", "JumlahTamu", "Ucapan", "WA_Target"]);
    sheet.appendRow([
      new Date(),
      payload.name || "",
      payload.attend || "",
      payload.guests || "",
      payload.message || "",
      "" // WA_Target kosong dulu, diisi saat tombol WA diklik
    ]);
    return jsonResponse_({ ok: true });
  }

  if (payload.action === "wa_choice") {
    const sheet = getSheet_(SHEET_RSVP, ["Timestamp", "Nama", "Kehadiran", "JumlahTamu", "Ucapan", "WA_Target"]);
    const data = sheet.getDataRange().getValues();
    for (let r = data.length - 1; r >= 1; r--) {
      if (data[r][1] === payload.name) {
        sheet.getRange(r + 1, 6).setValue(payload.wa_target || "");
        break;
      }
    }
    return jsonResponse_({ ok: true });
  }

  if (payload.action === "game_score") {
    const sheet = getSheet_(SHEET_GAME, ["Timestamp", "Nama", "Skor"]);
    sheet.appendRow([new Date(), payload.name || "Tamu", payload.score || 0]);
    return jsonResponse_({ ok: true });
  }

  return jsonResponse_({ ok: false, error: "unknown_action" });
}

function doGet(e) {
  const action = e.parameter.action;

  if (action === "list") {
    const sheet = getSheet_(SHEET_RSVP, ["Timestamp", "Nama", "Kehadiran", "JumlahTamu", "Ucapan", "WA_Target"]);
    const data = sheet.getDataRange().getValues();
    const rows = [];
    // lewati header (baris 0). Sengaja TIDAK menyertakan kolom WA_Target
    // supaya nomor WA yang dipilih tamu tidak tampil di RSVP wall publik.
    for (let r = 1; r < data.length; r++) {
      const [, name, attend, guests, message] = data[r];
      if (!name) continue;
      rows.push({ name: name, attend: attend, guests: guests, message: message });
    }
    return jsonResponse_(rows);
  }

  if (action === "leaderboard") {
    const sheet = getSheet_(SHEET_GAME, ["Timestamp", "Nama", "Skor"]);
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
