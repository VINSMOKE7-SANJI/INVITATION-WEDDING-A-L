/**
 * BACKEND GOOGLE APPS SCRIPT ALFA & LENNY
 */

const SHEET_RSVP_NAME = "RSVP";
const SHEET_GAME_NAME = "GAME";

function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : "";
    let result = [];

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "list") {
      const sheet = ss.getSheetByName(SHEET_RSVP_NAME);
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          if (data[i][1]) {
            result.push({
              name: data[i][1],
              attend: data[i][2] || "",
              guests: data[i][3] || 1,
              message: data[i][4] || ""
            });
          }
        }
      }
    } else if (action === "leaderboard") {
      const sheet = ss.getSheetByName(SHEET_GAME_NAME);
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        const scores = [];
        for (let i = 1; i < data.length; i++) {
          if (data[i][1]) {
            scores.push({
              name: data[i][1],
              score: parseInt(data[i][2], 10) || 0
            });
          }
        }
        // Urutkan skor tertinggi ke terendah
        scores.sort((a, b) => b.score - a.score);
        result = scores;
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const action = payload.action;
    const timestamp = new Date();
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "rsvp") {
      let sheet = ss.getSheetByName(SHEET_RSVP_NAME);
      if (!sheet) {
        sheet = ss.insertSheet(SHEET_RSVP_NAME);
        sheet.appendRow(["Timestamp", "Nama", "Kehadiran", "Jumlah Tamu", "Pesan"]);
      }
      sheet.appendRow([
        timestamp,
        payload.name || "",
        payload.attend || "",
        payload.guests || 1,
        payload.message || ""
      ]);
    } else if (action === "GAME") {
      let sheet = ss.getSheetByName(SHEET_GAME_NAME);
      if (!sheet) {
        sheet = ss.insertSheet(SHEET_GAME_NAME);
        sheet.appendRow(["Timestamp", "Nama", "Skor"]);
      }
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
