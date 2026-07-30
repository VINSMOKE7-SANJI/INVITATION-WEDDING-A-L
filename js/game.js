(function () {
  "use strict";

  const GAME_KEY_PLAYED = "al_game_played";
  const GAME_KEY_SCORE = "al_game_score";
  const RSVP_NAME_KEY = "al_rsvp_last_name";

  const section = document.getElementById("gameSection");
  if (!section) return;

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const startBtn = document.getElementById("gameStartBtn");
  const fullscreenBtn = document.getElementById("gameFullscreenBtn");
  const scoreEl = document.getElementById("gameScoreLive");
  const gameStage = document.getElementById("gameStage");
  const gameIntro = document.getElementById("gameIntro");
  const gameNeedName = document.getElementById("gameNeedName");
  const gameClosed = document.getElementById("gameClosed");
  const gameOverEl = document.getElementById("gameOver");
  const gameOverScore = document.getElementById("gameOverScore");
  const gameAlreadyPlayed = document.getElementById("gameAlreadyPlayed");
  const gameAlreadyScore = document.getElementById("gameAlreadyScore");
  const btnLeft = document.getElementById("gameBtnLeft");
  const btnJump = document.getElementById("gameBtnJump");
  const btnRight = document.getElementById("gameBtnRight");

  const ALL_OVERLAYS = [gameIntro, gameNeedName, gameClosed, gameOverEl, gameAlreadyPlayed];
  function showOverlay(el) {
    ALL_OVERLAYS.forEach(function (o) { if (o) o.classList.add("hidden"); });
    if (el) el.classList.remove("hidden");
  }

  function hasPlayed() {
    try { return localStorage.getItem(GAME_KEY_PLAYED) === "true"; } catch (e) { return false; }
  }
  function markPlayed(score) {
    try {
      localStorage.setItem(GAME_KEY_PLAYED, "true");
      localStorage.setItem(GAME_KEY_SCORE, String(score));
    } catch (e) { /* ignore */ }
  }
  function getRsvpName() {
    try { 
      return localStorage.getItem(RSVP_NAME_KEY) || localStorage.getItem("guestName") || ""; 
    } catch (e) { return ""; }
  }

  const BULAN_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  function formatTanggalID(iso) {
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return iso;
    const year = m[1], month = parseInt(m[2], 10) - 1, day = parseInt(m[3], 10);
    return day + " " + BULAN_ID[month] + " " + year;
  }
  ["gameEndDateText"].forEach(function (id) {
    const el = document.getElementById(id);
    if (el && CONFIG.gameEndDate) el.textContent = formatTanggalID(CONFIG.gameEndDate);
  });
  ["gameAnnounceDateText", "gameAnnounceDateText2"].forEach(function (id) {
    const el = document.getElementById(id);
    if (el && CONFIG.gameAnnounceDate) el.textContent = formatTanggalID(CONFIG.gameAnnounceDate);
  });

  function isGameClosedByDate() {
    if (!CONFIG.gameEndDate) return false;
    return Date.now() > new Date(CONFIG.gameEndDate).getTime();
  }

  let gameEnabled = false;

  function refreshGateState() {
    if (hasPlayed()) {
      let prev = 0;
      try { prev = parseInt(localStorage.getItem(GAME_KEY_SCORE) || "0", 10); } catch (e) {}
      if (gameAlreadyScore) gameAlreadyScore.textContent = prev;
      showOverlay(gameAlreadyPlayed);
      gameEnabled = false;
    } else if (isGameClosedByDate()) {
      showOverlay(gameClosed);
      gameEnabled = false;
    } else if (!getRsvpName()) {
      showOverlay(gameNeedName);
      gameEnabled = false;
    } else {
      showOverlay(gameIntro);
      gameEnabled = true;
    }
  }
  refreshGateState();

  window.addEventListener("al:rsvp-submitted", refreshGateState);

  // 1. FUNGSI LOAD LEADERBOARD (Sesuaikan dengan HTML & Code.gs)
  function loadLeaderboard() {
    const listContainer = document.getElementById("leaderboard-list");
    if (!listContainer) return;

    if (!window.CONFIG || !CONFIG.scriptURL) {
      listContainer.innerHTML = '<li>Papan peringkat akan tampil setelah backend disambungkan.</li>';
      return;
    }

    // Panggil action getLeaderboard sesuai Code.gs
    fetch(CONFIG.scriptURL + "?action=getLeaderboard")
      .then(function (res) { return res.json(); })
      .then(function (res) {
        if (res.status === "success" && Array.isArray(res.leaderboard) && res.leaderboard.length > 0) {
          listContainer.innerHTML = "";
          res.leaderboard.forEach(function (player, index) {
            const li = document.createElement("li");
            li.textContent = `#${index + 1} ${escapeHtmlGame(player.nama)} - ${player.skor} Poin`;
            listContainer.appendChild(li);
          });
        } else {
          listContainer.innerHTML = '<li>Belum ada data skor. Jadilah yang pertama!</li>';
        }
      })
      .catch(function () {
        listContainer.innerHTML = '<li>Gagal memuat papan peringkat.</li>';
      });
  }

  function escapeHtmlGame(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  loadLeaderboard();
  if (CONFIG.rsvpPollSeconds) {
    setInterval(loadLeaderboard, CONFIG.rsvpPollSeconds * 1000);
  }

  const LANES = 3;
  let W = 360, H = 560;
  let laneW = W / LANES;

  function resize() {
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    if (!rect.width) return;
    W = Math.min(rect.width, 480);
    H = Math.round(W * 1.55);
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    laneW = W / LANES;
  }
  window.addEventListener("resize", resize);
  const openBtnEl = document.getElementById("openBtn");
  if (openBtnEl) {
    openBtnEl.addEventListener("click", function () { setTimeout(resize, 400); });
  }

  let running = false;
  let raf = null;
  let score = 0;
  let speed = 4.2;
  let elapsed = 0;
  let obstacles = [];
  let coins = [];
  let spawnTimer = 0;
  let coinTimer = 0;

  const player = { lane: 1, x: 0, y: 0, jumping: false, jumpT: 0, r: 18 };

  function laneX(lane) { return laneW * lane + laneW / 2; }

  function resetGame() {
    score = 0; speed = 4.2; elapsed = 0;
    obstacles = []; coins = []; spawnTimer = 0; coinTimer = 0;
    player.lane = 1; player.jumping = false; player.jumpT = 0;
    if (scoreEl) scoreEl.textContent = "0";
  }

  function spawnObstacle() {
    const lane = Math.floor(Math.random() * LANES);
    const type = Math.random() < 0.28 ? "low" : "block";
    obstacles.push({ lane: lane, y: -60, type: type, passed: false });
  }
  function spawnCoin() {
    const lane = Math.floor(Math.random() * LANES);
    coins.push({ lane: lane, y: -40, taken: false });
  }

  function update(dt) {
    elapsed += dt;
    speed = Math.min(4.2 + elapsed * 0.06, 11);
    score += dt * 6;

    spawnTimer -= dt;
    if (spawnTimer <= 0) { spawnObstacle(); spawnTimer = Math.max(1.5 - elapsed * 0.01, 0.65); }
    coinTimer -= dt;
    if (coinTimer <= 0) { spawnCoin(); coinTimer = 1.1; }

    obstacles.forEach(function (o) { o.y += speed; });
    coins.forEach(function (c) { c.y += speed; });
    obstacles = obstacles.filter(function (o) { return o.y < H + 80; });
    coins = coins.filter(function (c) { return c.y < H + 60 && !c.taken; });

    if (player.jumping) {
      player.jumpT += dt;
      if (player.jumpT >= 0.6) { player.jumping = false; player.jumpT = 0; }
    }

    const playerY = H - 90;
    for (let i = 0; i < obstacles.length; i++) {
      const o = obstacles[i];
      if (o.lane !== player.lane) continue;
      if (Math.abs(o.y - playerY) < 30) {
        const overJump = player.jumping && o.type === "low";
        if (!overJump) { gameOver(); return; }
      }
    }
    coins.forEach(function (c) {
      if (c.taken) return;
      if (c.lane === player.lane && Math.abs(c.y - playerY) < 28) { c.taken = true; score += 15; }
    });

    if (scoreEl) scoreEl.textContent = Math.floor(score);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#3a1416";
    ctx.fillRect(0, 0, W, H);
    for (let i = 1; i < LANES; i++) {
      ctx.strokeStyle = "rgba(217,183,108,0.25)";
      ctx.setLineDash([10, 14]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(laneW * i, 0);
      ctx.lineTo(laneW * i, H);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    coins.forEach(function (c) {
      if (c.taken) return;
      ctx.beginPath();
      ctx.fillStyle = "#d9b76c";
      ctx.arc(laneX(c.lane), c.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#f3e6d0";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    obstacles.forEach(function (o) {
      const x = laneX(o.lane);
      if (o.type === "low") {
        ctx.fillStyle = "#8c3336";
        ctx.fillRect(x - laneW * 0.32, o.y - 8, laneW * 0.64, 16);
      } else {
        ctx.fillStyle = "#6b1f21";
        ctx.fillRect(x - laneW * 0.34, o.y - 30, laneW * 0.68, 46);
        ctx.strokeStyle = "rgba(217,183,108,0.5)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x - laneW * 0.34, o.y - 30, laneW * 0.68, 46);
      }
    });

    const px = laneX(player.lane);
    let py = H - 90;
    let scale = 1;
    if (player.jumping) {
      const t = player.jumpT / 0.6;
      const arc = Math.sin(Math.PI * t);
      py -= arc * 46;
      scale = 1 + arc * 0.12;
    }
    ctx.beginPath();
    ctx.fillStyle = "#d9b76c";
    ctx.ellipse(px, H - 68, player.r * 0.9, 8, 0, 0, Math.PI * 2);
    ctx.globalAlpha = 0.25;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.fillStyle = "#f3e6d0";
    ctx.arc(px, py, player.r * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#b8843c";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#3a2115";
    ctx.beginPath(); ctx.arc(px - 6, py - 3, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px + 6, py - 3, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.arc(px, py + 4, 6, 0, Math.PI, false);
    ctx.stroke();
  }

  let lastTime = 0;
  function loop(ts) {
    if (!running) return;
    if (!lastTime) lastTime = ts;
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    update(dt);
    if (running) { draw(); raf = requestAnimationFrame(loop); }
  }

  function startGame() {
    refreshGateState();
    if (!gameEnabled) return;
    resize();
    resetGame();
    showOverlay(null);
    running = true;
    lastTime = 0;
    raf = requestAnimationFrame(loop);
  }

  function gameOver() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    const finalScore = Math.floor(score);
    markPlayed(finalScore);
    if (gameOverScore) gameOverScore.textContent = finalScore;
    showOverlay(gameOverEl);
    submitScore(finalScore);
  }

  // 2. FUNGSI KIRIM SKOR (Sinkron dengan Code.gs: action = "saveScore")
  function submitScore(finalScore) {
    const name = getRsvpName() || "Tamu Undangan";
    if (!(window.CONFIG && CONFIG.scriptURL)) return;

    fetch(CONFIG.scriptURL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ 
        action: "saveScore", 
        nama: name, 
        skor: finalScore 
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        setTimeout(loadLeaderboard, 1000);
      })
      .catch(function (err) {
        console.error("Gagal menyimpan skor ke server:", err);
      });
  }

  function moveLeft() { if (player.lane > 0) player.lane--; }
  function moveRight() { if (player.lane < LANES - 1) player.lane++; }
  function jump() { if (!player.jumping) { player.jumping = true; player.jumpT = 0; } }

  document.addEventListener("keydown", function (e) {
    if (!running) return;
    if (e.key === "ArrowLeft") moveLeft();
    else if (e.key === "ArrowRight") moveRight();
    else if (e.key === "ArrowUp" || e.key === " ") jump();
  });

  if (btnLeft) btnLeft.addEventListener("click", moveLeft);
  if (btnRight) btnRight.addEventListener("click", moveRight);
  if (btnJump) btnJump.addEventListener("click", jump);

  let touchStartX = 0, touchStartY = 0;
  if (canvas) {
    canvas.addEventListener("touchstart", function (e) {
      const t = e.changedTouches[0];
      touchStartX = t.clientX; touchStartY = t.clientY;
    }, { passive: true });
    
    canvas.addEventListener("touchend", function (e) {
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
        if (dx > 0) moveRight(); else moveLeft();
      } else if (dy < -30) {
        jump();
      }
    }, { passive: true });
  }

  if (startBtn) startBtn.addEventListener("click", startGame);

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", function () {
      if (!document.fullscreenElement) {
        (gameStage.requestFullscreen || gameStage.webkitRequestFullscreen || function(){}).call(gameStage);
      } else {
        (document.exitFullscreen || document.webkitExitFullscreen || function(){}).call(document);
      }
    });
  }

  resize();
})();
