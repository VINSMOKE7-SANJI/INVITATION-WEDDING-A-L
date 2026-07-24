/**
 * BACKEND RSVP -> GOOGLE SHEETS
 * =========================================================
 * Cara pakai singkat (lengkapnya ada di README.md):
 * 1. Buat Google Sheet baru, buat 2 sheet/tab bernama persis: "RSVP"
 *    dengan header di baris 1: Timestamp | Nama | Kehadiran | JumlahTamu | Ucapan | WA_Target
 * 2. Buka Extensions > Apps Script, hapus isi default, tempel semua isi file ini.
 * 3. Klik Deploy > New deployment > Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Salin URL yang dihasilkan (.../exec) ke variabel scriptURL di js/config.js
 * =========================================================
 */

const SHEET_NAME = "RSVP";

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Nama", "Kehadiran", "JumlahTamu", "Ucapan", "WA_Target"]);
  }
  return sheet;
}

function doPost(e) {
  const sheet = getSheet_();
  let payload = {};
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse_({ ok: false, error: "invalid_payload" });
  }

  if (payload.action === "rsvp") {
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
    // cari baris RSVP terakhir dengan nama yang sama dan isi kolom WA_Target
    const data = sheet.getDataRange().getValues();
    for (let r = data.length - 1; r >= 1; r--) {
      if (data[r][1] === payload.name) {
        sheet.getRange(r + 1, 6).setValue(payload.wa_target || "");
        break;
      }
    }
    return jsonResponse_({ ok: true });
  }

  return jsonResponse_({ ok: false, error: "unknown_action" });
}

function doGet(e) {
  const sheet = getSheet_();
  const action = e.parameter.action;

  if (action === "list") {
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

  return jsonResponse_({ ok: true, message: "RSVP backend aktif." });
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
