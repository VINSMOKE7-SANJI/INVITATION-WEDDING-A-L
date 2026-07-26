(function () {
  "use strict";

  /* ---------- Guest name from URL (?to=Nama) ---------- */
  const params = new URLSearchParams(window.location.search);
  const guest = params.get("to");
  if (guest) {
    document.getElementById("guestName").textContent = decodeURIComponent(guest.replace(/\+/g, " "));
  }

  /* ---------- Open invitation ---------- */
  const cover = document.getElementById("cover");
  const main = document.getElementById("main");
  const openBtn = document.getElementById("openBtn");
  const bgMusic = document.getElementById("bgMusic");
  const musicBtn = document.getElementById("musicBtn");
  const bgVideo = document.getElementById("bgVideo");

  openBtn.addEventListener("click", function () {
    cover.classList.add("closing");
    main.classList.remove("hidden");
    document.body.style.overflow = "auto";
    setTimeout(function () { cover.remove(); }, 850);

    bgMusic.volume = 0.6;
    bgMusic.play().then(function () {
      musicBtn.classList.add("playing");
    }).catch(function () { /* autoplay blocked, tap the music button */ });

    if (bgVideo) {
      bgVideo.play().catch(function () { /* autoplay blocked, video will still show poster/first frame */ });
    }

    initCountdown();
    initReveal();
    setTimeout(loadWishes, 300);
    if (CONFIG.rsvpPollSeconds) {
      setInterval(loadWishes, CONFIG.rsvpPollSeconds * 1000);
    }
  });

  document.body.style.overflow = "hidden";

  musicBtn.addEventListener("click", function () {
    if (bgMusic.paused) {
      bgMusic.play().then(function () { musicBtn.classList.add("playing"); }).catch(function(){});
    } else {
      bgMusic.pause();
      musicBtn.classList.remove("playing");
    }
  });

  // if the background video fails to load (file missing), fall back gracefully
  if (bgVideo) {
    bgVideo.addEventListener("error", function () {
      const zone = document.querySelector(".video-zone");
      if (zone) zone.classList.add("video-failed");
    });
  }

  /* ---------- Dot navigation active state ---------- */
  const dotLinks = document.querySelectorAll("#dotnav a");
  const sections = Array.from(dotLinks).map(function (a) {
    return document.querySelector(a.getAttribute("href"));
  });
  function updateActiveDot() {
    let idx = 0;
    const mid = window.scrollY + window.innerHeight / 2;
    sections.forEach(function (sec, i) {
      if (sec && sec.offsetTop <= mid) idx = i;
    });
    dotLinks.forEach(function (a, i) { a.classList.toggle("active", i === idx); });
  }
  window.addEventListener("scroll", updateActiveDot);

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Countdown ---------- */
  function initCountdown() {
    const target = new Date(CONFIG.weddingDateTime).getTime();
    const dEl = document.getElementById("cd-days");
    const hEl = document.getElementById("cd-hours");
    const mEl = document.getElementById("cd-mins");
    const sEl = document.getElementById("cd-secs");
    function tick() {
      const now = Date.now();
      let diff = Math.max(target - now, 0);
      const days = Math.floor(diff / 86400000); diff -= days * 86400000;
      const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
      const mins = Math.floor(diff / 60000); diff -= mins * 60000;
      const secs = Math.floor(diff / 1000);
      dEl.textContent = String(days).padStart(2, "0");
      hEl.textContent = String(hours).padStart(2, "0");
      mEl.textContent = String(mins).padStart(2, "0");
      sEl.textContent = String(secs).padStart(2, "0");
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Live streaming (optional) ---------- */
  const liveSection = document.getElementById("liveSection");
  const liveBtn = document.getElementById("liveBtn");
  if (CONFIG.liveStreamingURL) {
    liveBtn.href = CONFIG.liveStreamingURL;
    liveSection.classList.remove("hidden");
  }

  /* ---------- Gallery: 3 auto-scrolling marquee rows ---------- */
  (CONFIG.galleryGroups || []).forEach(function (group, i) {
    const track = document.getElementById("marqueeTrack" + (i + 1));
    if (!track) return;
    const imgs = [];
    for (let n = group.from; n <= group.to; n++) {
      imgs.push(String(n).padStart(2, "0"));
    }
    // duplicate the set once so the marquee can loop seamlessly at -50%
    const html = imgs.concat(imgs).map(function (num) {
      return '<img src="assets/images/gallery-' + num + '.jpg" alt="Momen ' + num + '" loading="lazy">';
    }).join("");
    track.innerHTML = html;
  });

  document.querySelectorAll(".marquee-row img").forEach(function (img) {
    img.addEventListener("click", function () { openLightbox(img.src); });
  });

  function openLightbox(src) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = '<button class="lightbox-close" aria-label="Tutup">&times;</button><img src="' + src + '" alt="Foto">';
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target.classList.contains("lightbox-close")) box.remove();
    });
    document.body.appendChild(box);
  }

  /* ---------- Gift card copy (nomor rekening) ---------- */
  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  document.querySelectorAll(".btn-copy").forEach(function (btn) {
    const originalHtml = btn.innerHTML;
    btn.addEventListener("click", function () {
      const val = btn.getAttribute("data-copy");
      const msgEl = document.getElementById(btn.getAttribute("data-target"));

      function showCopied() {
        // 1) badge di pojok kartu
        if (msgEl) {
          msgEl.classList.add("show");
          setTimeout(function () { msgEl.classList.remove("show"); }, 1800);
        }
        // 2) tombolnya sendiri berubah jadi centang + teks "Tersalin"
        btn.classList.add("copied");
        btn.innerHTML = '<span>Tersalin</span><i class="check-icon">&#10003;</i>';
        btn.disabled = true;
        setTimeout(function () {
          btn.classList.remove("copied");
          btn.innerHTML = originalHtml;
          btn.disabled = false;
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(showCopied).catch(function () {
          if (fallbackCopy(val)) showCopied();
          else alert("Nomor rekening: " + val);
        });
      } else {
        if (fallbackCopy(val)) showCopied();
        else alert("Nomor rekening: " + val);
      }
    });
  });

  /* ---------- RSVP form: satu perangkat = satu ucapan (localStorage) ---------- */
  const RSVP_DONE_KEY = "al_rsvp_done";
  const rsvpForm = document.getElementById("rsvpForm");
  const rsvpSubmitBtn = document.getElementById("rsvpSubmitBtn");
  const rsvpThanks = document.getElementById("rsvpThanks");
  const rsvpAlready = document.getElementById("rsvpAlready");
  const rsvpDoneNote = document.getElementById("rsvpDoneNote");
  const rsvpWaChoices = document.querySelector(".wa-choices");
  let lastRsvp = null;

  function alreadySubmitted() {
    try { return localStorage.getItem(RSVP_DONE_KEY) === "true"; } catch (e) { return false; }
  }
  function markSubmitted() {
    try { localStorage.setItem(RSVP_DONE_KEY, "true"); } catch (e) { /* ignore (private mode, etc) */ }
  }

  // Kalau perangkat ini sudah pernah kirim RSVP, langsung tampilkan pesan
  // "sudah mengonfirmasi" dan sembunyikan form -- tanpa perlu login apa pun.
  if (alreadySubmitted()) {
    rsvpForm.classList.add("hidden");
    rsvpThanks.classList.add("hidden");
    rsvpAlready.classList.remove("hidden");
  }

  rsvpForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("rsvpName").value.trim();
    const attend = document.getElementById("rsvpAttend").value;
    const guests = document.getElementById("rsvpGuests").value;
    const message = document.getElementById("rsvpMessage").value.trim();
    if (!name || !attend || !message) return;

    lastRsvp = { name: name, attend: attend, guests: guests, message: message };

    rsvpSubmitBtn.disabled = true;
    rsvpSubmitBtn.querySelector("span").textContent = "Mengirim...";

    sendToSheet({ action: "rsvp", name: name, attend: attend, guests: guests, message: message })
      .then(function () {
        markSubmitted();
        try { localStorage.setItem("al_rsvp_last_name", name); } catch (e) {}
        rsvpForm.classList.add("hidden");
        rsvpThanks.classList.remove("hidden");
        loadWishes();
      })
      .catch(function () {
        markSubmitted();
        rsvpForm.classList.add("hidden");
        rsvpThanks.classList.remove("hidden");
      })
      .finally(function () {
        rsvpSubmitBtn.disabled = false;
        rsvpSubmitBtn.querySelector("span").textContent = "Kirim Konfirmasi";
      });
  });

  document.querySelectorAll(".btn-wa").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const phone = btn.getAttribute("data-phone");
      const who = btn.getAttribute("data-wa");
      const name = lastRsvp ? lastRsvp.name : "";
      const attend = lastRsvp ? lastRsvp.attend : "";
      const text = encodeURIComponent(
        "Assalamualaikum/Salam sejahtera, saya " + name +
        " ingin mengonfirmasi kehadiran (" + attend + ") pada pernikahan Alfa & Lenny."
      );
      sendToSheet({ action: "wa_choice", name: name, wa_target: who }).catch(function () {});
      window.open("https://wa.me/" + phone + "?text=" + text, "_blank");

      // langkah WA selesai -- sembunyikan pilihan tombol, tampilkan catatan selesai
      if (rsvpWaChoices) rsvpWaChoices.classList.add("hidden");
      if (rsvpDoneNote) rsvpDoneNote.classList.remove("hidden");
    });
  });

  /* ---------- Backend (Google Apps Script) ---------- */
  function sendToSheet(payload) {
    if (!CONFIG.scriptURL) return Promise.reject(new Error("scriptURL belum diisi di js/config.js"));
    return fetch(CONFIG.scriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });
  }

  /* ---------- Live wishes wall: stats + pagination, auto-refresh ---------- */
  let wishesData = [];
  let wishesPage = 1;

  function loadWishes() {
    if (!CONFIG.scriptURL) {
      document.getElementById("wishesList").innerHTML =
        '<p class="wishes-empty">Ucapan akan tampil di sini setelah backend RSVP disambungkan (lihat README).</p>';
      return;
    }
    fetch(CONFIG.scriptURL + "?action=list")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        wishesData = Array.isArray(data) ? data : [];
        updateStats(wishesData);
        renderWishesPage();
      })
      .catch(function () {
        document.getElementById("wishesList").innerHTML =
          '<p class="wishes-empty">Gagal memuat ucapan. Coba muat ulang halaman.</p>';
      });
  }

  function updateStats(data) {
    let hadir = 0, tidak = 0, ragu = 0;
    data.forEach(function (row) {
      const a = (row.attend || "").toLowerCase();
      if (a.indexOf("tidak") === 0 || a.indexOf("tidak") > -1) tidak++;
      else if (a.indexOf("ragu") > -1) ragu++;
      else if (a.indexOf("hadir") > -1) hadir++;
    });
    document.getElementById("statHadir").textContent = hadir;
    document.getElementById("statTidak").textContent = tidak;
    document.getElementById("statRagu").textContent = ragu;
  }

  function renderWishesPage() {
    const list = document.getElementById("wishesList");
    const pagination = document.getElementById("wishesPagination");
    const perPage = CONFIG.wishesPerPage || 10;
    const reversed = wishesData.slice().reverse();
    const totalPages = Math.max(Math.ceil(reversed.length / perPage), 1);
    if (wishesPage > totalPages) wishesPage = totalPages;

    if (!reversed.length) {
      list.innerHTML = '<p class="wishes-empty">Jadilah yang pertama memberi ucapan &amp; doa.</p>';
      pagination.classList.add("hidden");
      return;
    }

    const start = (wishesPage - 1) * perPage;
    const pageItems = reversed.slice(start, start + perPage);

    list.innerHTML = pageItems.map(function (row) {
      return (
        '<div class="wish-item">' +
          '<p class="wish-name">' + escapeHtml(row.name) + '</p>' +
          '<span class="wish-status">' + escapeHtml(row.attend) + '</span>' +
          '<p class="wish-msg">' + escapeHtml(row.message) + '</p>' +
        '</div>'
      );
    }).join("");

    if (reversed.length > perPage) {
      pagination.classList.remove("hidden");
      document.getElementById("wishesPageInfo").textContent = wishesPage + " / " + totalPages;
      document.getElementById("wishesPrev").disabled = wishesPage <= 1;
      document.getElementById("wishesNext").disabled = wishesPage >= totalPages;
    } else {
      pagination.classList.add("hidden");
    }
  }

  document.getElementById("wishesPrev").addEventListener("click", function () {
    if (wishesPage > 1) { wishesPage--; renderWishesPage(); }
  });
  document.getElementById("wishesNext").addEventListener("click", function () {
    wishesPage++; renderWishesPage();
  });

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Footer ad ---------- */
  const footerAdBtn = document.getElementById("footerAdBtn");
  footerAdBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const text = encodeURIComponent("Halo, saya tertarik order undangan digital seperti punya Alfa & Lenny.");
    window.open("https://wa.me/" + CONFIG.footerAdWhatsApp + "?text=" + text, "_blank");
  });

})();
