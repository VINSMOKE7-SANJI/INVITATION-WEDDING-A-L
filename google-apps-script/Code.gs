function doGet(e) {
  var action = e.parameter.action;
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Ambil Data Leaderboard
  if (action === "getLeaderboard") {
    var leaderboardSheet = sheet.getSheetByName("Leaderboard");
    if (!leaderboardSheet) {
      return responseJSON({ status: "success", leaderboard: [] });
    }
    
    var data = leaderboardSheet.getDataRange().getValues();
    var leaderboard = [];
    
    // Baris 0 adalah Header (Nama, Skor), mulai dari baris 1
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) { // Jika nama tidak kosong
        leaderboard.push({
          nama: data[i][0],
          skor: Number(data[i][1])
        });
      }
    }
    
    // Urutkan skor terbesar ke terkecil
    leaderboard.sort(function(a, b) {
      return b.skor - a.skor;
    });
    
    // Ambil Top 10 saja
    leaderboard = leaderboard.slice(0, 10);
    
    return responseJSON({ status: "success", leaderboard: leaderboard });
  }
  
  // 2. Ambil Data Ucapan RSVP
  if (action === "getWishes") {
    var rsvpSheet = sheet.getSheetByName("RSVP");
    if (!rsvpSheet) {
      return responseJSON({ status: "success", wishes: [] });
    }
    var data = rsvpSheet.getDataRange().getValues();
    var wishes = [];
    for (var i = 1; i < data.length; i++) {
      wishes.push({
        nama: data[i][0],
        kehadiran: data[i][1],
        jumlah: data[i][2],
        ucapan: data[i][3],
        waktu: data[i][4]
      });
    }
    return responseJSON({ status: "success", wishes: wishes.reverse() });
  }

  return responseJSON({ status: "error", message: "Action tidak dikenal" });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet();

    // A. SIMPAN SKOR GAME
    if (data.action === "saveScore") {
      var leaderboardSheet = sheet.getSheetByName("Leaderboard");
      if (!leaderboardSheet) {
        leaderboardSheet = sheet.insertSheet("Leaderboard");
        leaderboardSheet.appendRow(["Nama", "Skor", "Waktu"]);
      }

      leaderboardSheet.appendRow([
        data.nama,
        data.skor,
        new Date()
      ]);

      return responseJSON({ status: "success", message: "Skor berhasil disimpan" });
    }

    // B. SIMPAN RSVP / UCAPAN
    if (data.action === "saveRSVP" || !data.action) {
      var rsvpSheet = sheet.getSheetByName("RSVP");
      if (!rsvpSheet) {
        rsvpSheet = sheet.insertSheet("RSVP");
        rsvpSheet.appendRow(["Nama", "Kehadiran", "Jumlah Guest", "Ucapan", "Waktu"]);
      }

      rsvpSheet.appendRow([
        data.nama,
        data.kehadiran,
        data.jumlah,
        data.ucapan,
        new Date()
      ]);

      return responseJSON({ status: "success", message: "RSVP berhasil disimpan" });
    }

  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

// Helper Response Format JSON
function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
