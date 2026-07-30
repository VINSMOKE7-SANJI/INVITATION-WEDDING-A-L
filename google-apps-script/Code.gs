// Nama Sheet yang digunakan di Spreadsheet
const SHEET_GAME = "GameScore";
const SHEET_RSVP = "RSVP";

/**
 * Menerima request GET dari Web (misal: mengambil data Papan Skor atau RSVP)
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    // 1. Ambil Data Papan Skor (Leaderboard)
    if (action === "getScores" || action === "getLeaderboard") {
      const scores = getLeaderboardData();
      return createJsonResponse({ status: "success", data: scores });
    }

    // 2. Ambil Data RSVP (Opsional jika dibutuhkan di frontend)
    if (action === "getRSVP") {
      const rsvpData = getRsvpData();
      return createJsonResponse({ status: "success", data: rsvpData });
    }

    // Default response jika URL diakses biasa
    return createJsonResponse({
      status: "online",
      message: "Google Apps Script API Aktif (RSVP & GameScore)"
    });

  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * Menerima request POST dari Web (misal: kirim Skor baru atau simpan RSVP)
 */
function doPost(e) {
  try {
    let data = {};
    
    // Membaca payload baik dalam format Form-Data/URL-encoded maupun JSON body
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    const action = data.action;

    // --- PROSES 1: SIMPAN SKOR GAME ---
    if (action === "saveScore" || data.skor !== undefined || data.score !== undefined) {
      const nama = data.nama || data.name || "Anonim";
      const skor = Number(data.skor || data.score || 0);

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(SHEET_GAME);
      
      // Buat sheet jika belum ada
      if (!sheet) {
        sheet = ss.insertSheet(SHEET_GAME);
        sheet.appendRow(["Timestamp", "Nama", "Skor"]);
      }

      // Catat Waktu, Nama, Skor
      sheet.appendRow([new Date(), nama, skor]);

      // Kembalikan leaderboard terbaru setelah simpan
      const updatedLeaderboard = getLeaderboardData();

      return createJsonResponse({
        status: "success",
        message: "Skor berhasil disimpan!",
        leaderboard: updatedLeaderboard
      });
    }

    // --- PROSES 2: SIMPAN RSVP ---
    if (action === "rsvp" || data.kehadiran !== undefined || data.attendance !== undefined) {
      const nama = data.nama || data.name || "-";
      const jumlah = data.jumlah || data.pax || 1;
      const kehadiran = data.kehadiran || data.attendance || "-";
      const ucapan = data.ucapan || data.message || "-";

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(SHEET_RSVP);

      if (!sheet) {
        sheet = ss.insertSheet(SHEET_RSVP);
        sheet.appendRow(["Timestamp", "Nama", "Jumlah", "Kehadiran", "Ucapan"]);
      }

      sheet.appendRow([new Date(), nama, jumlah, kehadiran, ucapan]);

      return createJsonResponse({
        status: "success",
        message: "RSVP berhasil disimpan!"
      });
    }

    return createJsonResponse({
      status: "error",
      message: "Action tidak dikenali / Parameter kurang lengkap"
    });

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

/**
 * Helper: Ambil data Skor tertinggi (Top 10 / All)
 */
function getLeaderboardData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_GAME);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Hanya header

  // Abaikan baris header (index 0)
  const rows = data.slice(1);

  const formatted = rows
    .map(row => ({
      timestamp: row[0],
      nama: String(row[1] || "Anonim"),
      skor: Number(row[2] || 0)
    }))
    .filter(item => item.nama.trim() !== "");

  // Urutkan berdasarkan skor tertinggi ke terendah
  formatted.sort((a, b) => b.skor - a.skor);

  // Ambil 10 skor tertinggi (bisa disesuaikan)
  return formatted.slice(0, 10);
}

/**
 * Helper: Ambil data RSVP
 */
function getRsvpData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_RSVP);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  return data.slice(1).map(row => ({
    timestamp: row[0],
    nama: row[1],
    jumlah: row[2],
    kehadiran: row[3],
    ucapan: row[4]
  }));
}

/**
 * Helper Output JSON Response
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
