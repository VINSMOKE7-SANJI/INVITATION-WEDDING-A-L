/**
 * BACKEND GOOGLE APPS SCRIPT UNTUK UNDANGAN DIGITAL ALFA & LENNY
 * Menangani: RSVP/Ucapan & Skor Game (Leaderboard)
 */

// Nama sheet yang digunakan di Google Sheets
const SHEET_RSVP_NAME = "RSVP";
const SHEET_GAME_NAME = "GameScore";

/**
 * Fungsi pembantu untuk mengambil/membuat sheet jika belum ada
 */
function getOrCreateSheet(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      // Format header agar cetak tebal
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }
  }
  return sheet;
}

/**
 * Menangani permintaan GET (?action=list atau ?action=leaderboard)
 */
function doGet(e) {
  const action = e.parameter.action;
  let result = [];

  if (action === "list") {
    // 1. Ambil daftar ucapan RSVP
    const sheet = getOrCreateSheet(SHEET_RSVP_NAME, ["Timestamp", "Nama", "Kehadiran", "Jumlah Tamu", "Pesan"]);
    const data = sheet.getDataRange().getValues();
    
    // Baris 1 adalah header, jadi mulai dari i = 1
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[1]) { // Pastikan kolom nama tidak kosong
        result.push({
          name: row[1],
          attend: row[2] || "",
          guests: row[3] || 1,
          message: row[4] || ""
        });
      }
    }
  } else if (action === "leaderboard") {
    // 2. Ambil papan peringkat Game Score
    const sheet = getOrCreateSheet(SHEET_GAME_NAME, ["Timestamp", "Nama", "Skor"]);
    const data = sheet.getDataRange().getValues();
    const scores = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[1]) {
        scores.push({
          name: row[1],
          score: parseInt(row[2], 10) || 0
        });
      }
    }

    // Urutkan dari skor tertinggi ke terendah
    scores.sort(function (a, b) {
      return b.score - a.score;
    });

    result = scores;
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Menangani permintaan POST (Simpan RSVP atau Skor Game)
 */
function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const action = payload.action;
    const timestamp = new Date();

    if (action === "rsvp") {
      const sheet = getOrCreateSheet(SHEET_RSVP_NAME, ["Timestamp", "Nama", "Kehadiran", "Jumlah Tamu", "Pesan"]);
      sheet.appendRow([
        timestamp,
        payload.name || "",
        payload.attend || "",
        payload.guests || 1,
        payload.message || ""
      ]);
    } else if (action === "game_score") {
      const sheet = getOrCreateSheet(SHEET_GAME_NAME, ["Timestamp", "Nama", "Skor"]);
      sheet.appendRow([
        timestamp,
        payload.name || "Tamu",
        parseInt(payload.score, 10) || 0
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
