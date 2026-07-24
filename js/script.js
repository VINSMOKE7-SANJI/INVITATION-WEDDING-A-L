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

  openBtn.addEventListener("click", function () {
    cover.classList.add("closing");
    main.classList.remove("hidden");
    document.body.style.overflow = "auto";
    setTimeout(function () { cover.remove(); }, 850);

    // try to autoplay music after user gesture
    bgMusic.volume = 0.6;
    bgMusic.play().then(function () {
      musicBtn.classList.add("playing");
    }).catch(function () {
      /* autoplay blocked, user can tap the music button */
    });

    initCountdown();
    initReveal();
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

  /* ---------- Gallery ---------- */
  const galleryGrid = document.getElementById("galleryGrid");
  for (let i = 1; i <= CONFIG.galleryCount; i++) {
    const num = String(i).padStart(2, "0");
    const img = document.createElement("img");
    img.src = "assets/images/gallery-" + num + ".jpg";
    img.loading = "lazy";
    img.alt = "Momen " + num;
    img.addEventListener("click", function () { openLightbox(img.src); });
    galleryGrid.appendChild(img);
  }

  function openLightbox(src) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = '<button class="lightbox-close" aria-label="Tutup">&times;</button><img src="' + src + '" alt="Foto">';
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target.classList.contains("lightbox-close")) box.remove();
    });
    document.body.appendChild(box);
  }

  /* ---------- Gift card copy ---------- */
  document.querySelectorAll(".btn-copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const val = btn.getAttribute("data-copy");
      const msgEl = document.getElementById(btn.getAttribute("data-target"));
      navigator.clipboard.writeText(val).then(function () {
        msgEl.classList.add("show");
        setTimeout(function () { msgEl.classList.remove("show"); }, 1600);
      }).catch(function () {
        alert("Nomor rekening: " + val);
      });
    });
  });

  /* ---------- RSVP form ---------- */
  const rsvpForm = document.getElementById("rsvpForm");
  const rsvpSubmitBtn = document.getElementById("rsvpSubmitBtn");
  const rsvpThanks = document.getElementById("rsvpThanks");
  let lastRsvp = null;

  rsvpForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("rsvpName").value.trim();
    const attend = document.getElementById("rsvpAttend").value;
    const guests = document.getElementById("rsvpGuests").value;
    const message = document.getElementById("rsvpMessage").value.trim();
    if (!name || !attend || !message) return;

    lastRsvp = { name: name, attend: attend, guests: guests, message: message };

    rsvpSubmitBtn.disabled = true;
    rsvpSubmitBtn.textContent = "Mengirim...";

    sendToSheet({
      action: "rsvp",
      name: name,
      attend: attend,
      guests: guests,
      message: message
    }).then(function () {
      rsvpForm.classList.add("hidden");
      rsvpThanks.classList.remove("hidden");
      loadWishes();
    }).catch(function () {
      alert("Konfirmasi tersimpan secara lokal. Pastikan koneksi internet stabil.");
      rsvpForm.classList.add("hidden");
      rsvpThanks.classList.remove("hidden");
    }).finally(function () {
      rsvpSubmitBtn.disabled = false;
      rsvpSubmitBtn.textContent = "Kirim Konfirmasi";
    });
  });

  /* WhatsApp choice buttons: opens WA + silently logs which contact was chosen.
     This choice is intentionally NOT shown on the public wishes wall. */
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
      // log silently which WA contact was used (not displayed on the live RSVP wall)
      sendToSheet({
        action: "wa_choice",
        name: name,
        wa_target: who
      }).catch(function () {});

      window.open("https://wa.me/" + phone + "?text=" + text, "_blank");
    });
  });

  /* ---------- Talk to Google Apps Script backend ---------- */
  function sendToSheet(payload) {
    if (!CONFIG.scriptURL) {
      return Promise.reject(new Error("scriptURL belum diisi di js/config.js"));
    }
    return fetch(CONFIG.scriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });
  }

  /* ---------- Load live wishes wall (name, attendance, message only) ---------- */
  function loadWishes() {
    const list = document.getElementById("wishesList");
    if (!CONFIG.scriptURL) {
      list.innerHTML = '<p class="wishes-empty">Ucapan akan tampil di sini setelah backend RSVP disambungkan (lihat README).</p>';
      return;
    }
    fetch(CONFIG.scriptURL + "?action=list")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !data.length) {
          list.innerHTML = '<p class="wishes-empty">Jadilah yang pertama memberi ucapan &amp; doa.</p>';
          return;
        }
        list.innerHTML = data.slice().reverse().map(function (row) {
          return (
            '<div class="wish-item">' +
              '<p class="wish-name">' + escapeHtml(row.name) + '</p>' +
              '<span class="wish-status">' + escapeHtml(row.attend) + '</span>' +
              '<p class="wish-msg">' + escapeHtml(row.message) + '</p>' +
            '</div>'
          );
        }).join("");
      })
      .catch(function () {
        list.innerHTML = '<p class="wishes-empty">Gagal memuat ucapan. Coba muat ulang halaman.</p>';
      });
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // attempt to load wishes on first paint too (in case user scrolls before opening... not applicable since hidden)
  document.addEventListener("DOMContentLoaded", function () {
    // no-op placeholder; wishes are loaded after RSVP submit and can also be
    // triggered once main content is shown
  });

  // Load wishes wall once invitation is opened
  openBtn.addEventListener("click", function () {
    setTimeout(loadWishes, 300);
  });

})();
