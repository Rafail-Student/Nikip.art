/* ==========================================================================
   NIKIP.ART — Vanilla JS, no dependencies.
   Everything here is progressive enhancement: if this file fails to load, all
   three pages still render, navigate and submit correctly.
   --------------------------------------------------------------------------
   01. Hero video
   02. Header shadow on scroll
   03. Mobile navigation
   04. Lightbox
   05. Commission form
   06. Footer year
   07. Button paint splat
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Interface text in both languages. The page's <html lang> picks the set;
     anything missing falls back to English. */
  var LANG = (document.documentElement.lang || "en").slice(0, 2).toLowerCase();
  var STRINGS = {
    en: {
      menuOpen:   "Open menu",
      menuClose:  "Close menu",
      painting:   "Painting",
      required:   "Please fill this in.",
      badEmail:   "That address doesn't look complete.",
      tooShort:   "A little more detail would help: at least 20 characters.",
      checkFields:"Have a look at the highlighted fields.",
      sending:    "Sending…",
      sent:       "Got it! I'll reply by email soon. If you have photos, you can simply attach them to your reply.",
      failed:     "Sorry, that didn't send. Please try again, or email me at nikipart.paintings@gmail.com.",
      offline:    "No connection. Please check your network and try again, or email me at nikipart.paintings@gmail.com.",
      send:       "Send request",
      zoomIn:     "Zoom in",
      zoomOut:    "Zoom out",
      pause:      "Pause video",
      play:       "Play video"
    },
    el: {
      menuOpen:   "Άνοιγμα μενού",
      menuClose:  "Κλείσιμο μενού",
      painting:   "Πίνακας",
      required:   "Αυτό το πεδίο είναι υποχρεωτικό.",
      badEmail:   "Το email δεν φαίνεται σωστό.",
      tooShort:   "Γράψε λίγο περισσότερα, τουλάχιστον 20 χαρακτήρες.",
      checkFields:"Έλεγξε τα πεδία που επισημαίνονται.",
      sending:    "Αποστολή…",
      sent:       "Πήρα το μήνυμά σου! Θα σου απαντήσω σύντομα με email. Αν έχεις φωτογραφίες, μπορείς απλώς να τις επισυνάψεις στην απάντησή σου.",
      failed:     "Κάτι πήγε στραβά και το μήνυμα δεν στάλθηκε. Δοκίμασε ξανά ή γράψε μου στο nikipart.paintings@gmail.com.",
      offline:    "Δεν υπάρχει σύνδεση. Έλεγξε το δίκτυο και δοκίμασε ξανά ή γράψε μου στο nikipart.paintings@gmail.com.",
      send:       "Αποστολή αιτήματος",
      zoomIn:     "Μεγέθυνση",
      zoomOut:    "Σμίκρυνση",
      pause:      "Παύση βίντεο",
      play:       "Αναπαραγωγή βίντεο"
    }
  };
  function t(key) { return (STRINGS[LANG] || STRINGS.en)[key] || STRINGS.en[key]; }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }


  /* ======================================================================
     01. HERO VIDEO
     Phones get a lighter 540p encode (data-src-mobile). With Save-Data, a
     2G connection or reduced motion, the poster image (~60 KB) stays put.
     ====================================================================== */
  (function initHeroVideo() {
    var video = $("#heroVideo");
    if (!video) return;

    var conn = navigator.connection || {};
    var saveData = conn.saveData === true;
    var slow = /(^|-)2g$/.test(conn.effectiveType || "");

    if (saveData || slow || prefersReducedMotion) return;

    var small = window.innerWidth < 700 && video.getAttribute("data-src-mobile");
    var src = small || video.getAttribute("data-src");
    if (!src) return;

    // On phones the video sits below the text, so only fetch it when it is
    // about to scroll into view.
    var started = false;
    function start() {
      if (started) return;
      started = true;
      video.setAttribute("src", src);
      video.load();
      play();
    }

    function play() {
      // Autoplay can still be refused; the poster simply stays put if so.
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") { attempt.catch(function () {}); }
    }

    // A looping video needs a way to stop it (WCAG 2.2.2)
    var pauseBtn = $("#heroPause");
    var userPaused = false;
    if (pauseBtn) {
      video.addEventListener("playing", function () { pauseBtn.hidden = false; }, { once: true });
      pauseBtn.addEventListener("click", function () {
        userPaused = !userPaused;
        if (userPaused) video.pause(); else play();
        pauseBtn.classList.toggle("is-paused", userPaused);
        pauseBtn.setAttribute("aria-label", userPaused ? t("play") : t("pause"));
      });
    }

    // Start once the video is near the screen, and don't keep decoding while
    // it is scrolled out of view
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        if (userPaused) return;
        if (!entries[0].isIntersecting) { if (started) video.pause(); return; }
        if (started) play(); else start();
      }, { rootMargin: "200px 0px" }).observe(video);
    } else {
      start();
    }
  })();


  /* ======================================================================
     02. HEADER SHADOW ON SCROLL
     ====================================================================== */
  (function initHeader() {
    var header = $("#siteHeader");
    if (!header) return;

    var ticking = false;
    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  })();


  /* ======================================================================
     03. MOBILE NAVIGATION
     ====================================================================== */
  (function initNav() {
    var toggle = $("#navToggle");
    var nav = $("#primaryNav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? t("menuClose") : t("menuOpen"));
      nav.classList.toggle("is-open", open);
      document.documentElement.classList.toggle("is-locked", open);
      if (open) {
        var first = $("a", nav);
        if (first) first.focus();
      }
    }

    function isOpen() { return toggle.getAttribute("aria-expanded") === "true"; }

    toggle.addEventListener("click", function () {
      setOpen(!isOpen());
    });

    $$("a", nav).forEach(function (link) {
      link.addEventListener("click", function () { setOpen(false); });
    });

    document.addEventListener("keydown", function (e) {
      if (!isOpen()) return;
      if (e.key === "Escape") {
        setOpen(false);
        toggle.focus();
      } else if (e.key === "Tab") {
        // Keep focus inside the open menu (the toggle plus its links)
        var focusable = [toggle].concat($$("a", nav));
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        var inside = focusable.indexOf(document.activeElement) !== -1;
        if (e.shiftKey && (document.activeElement === first || !inside)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || !inside)) { e.preventDefault(); first.focus(); }
      }
    });

    // Must match the mobile-nav breakpoint in style.css
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024 && isOpen()) setOpen(false);
    });
  })();


  /* ======================================================================
     04. LIGHTBOX
     Each piece is a real link to its image, so without JS clicking one still
     opens the painting. Here we present it in place instead.
     ====================================================================== */
  (function initLightbox() {
    var box = $("#lightbox");
    var grid = $("#galleryGrid");
    if (!box || !grid) return;

    var pieces = $$(".piece", grid);
    if (!pieces.length) return;

    var imgEl    = $("#lightboxImg");
    var stage    = $("#lightboxStage");
    var titleEl  = $("#lightboxTitle");
    var mediumEl = $("#lightboxMedium");
    var countEl  = $("#lightboxCount");
    var closeBtn = $("#lightboxClose");
    var zoomBtn  = $("#lightboxZoom");
    var prevBtn  = $("#lightboxPrev");
    var nextBtn  = $("#lightboxNext");

    var current = 0;
    var closeTimer = null;

    /* ---------- Zoom & pan ----------
       Tap/click toggles a 2.5x zoom at that spot; drag pans; the wheel and a
       two-finger pinch zoom smoothly between 1x and 4x. The stage clips the
       image, so a zoomed painting never spills over the controls. */
    var MIN = 1, MAX = 4, TAP_ZOOM = 2.5;
    var scale = 1, tx = 0, ty = 0;
    var pointers = {};
    var drag = null;          // { x, y, tx, ty, moved }
    var pinch = null;         // { dist, scale, cx, cy }

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    function apply(animate) {
      var w = imgEl.offsetWidth, h = imgEl.offsetHeight;
      var maxX = (scale - 1) * w / 2, maxY = (scale - 1) * h / 2;
      tx = clamp(tx, -maxX, maxX);
      ty = clamp(ty, -maxY, maxY);
      imgEl.style.transition = animate ? "" : "none";
      imgEl.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
      var zoomed = scale > 1.01;
      stage.classList.toggle("is-zoomed", zoomed);
      if (zoomBtn) {
        zoomBtn.setAttribute("aria-pressed", String(zoomed));
        zoomBtn.setAttribute("aria-label", zoomed ? t("zoomOut") : t("zoomIn"));
      }
    }

    // Zoom to `next`, keeping the point (px, py), measured from the stage
    // centre, fixed under the pointer.
    function zoomTo(next, px, py, animate) {
      next = clamp(next, MIN, MAX);
      var k = next / scale;
      tx = px - (px - tx) * k;
      ty = py - (py - ty) * k;
      scale = next;
      if (scale <= 1.01) { scale = 1; tx = 0; ty = 0; }
      apply(animate);
    }

    function fromCentre(clientX, clientY) {
      var r = stage.getBoundingClientRect();
      return { x: clientX - (r.left + r.width / 2), y: clientY - (r.top + r.height / 2) };
    }

    function resetZoom() {
      scale = 1; tx = 0; ty = 0;
      pointers = {}; drag = null; pinch = null;
      apply(false);
    }

    function toggleZoom(clientX, clientY) {
      if (scale > 1.01) { zoomTo(1, 0, 0, true); return; }
      var p = clientX == null ? { x: 0, y: 0 } : fromCentre(clientX, clientY);
      zoomTo(TAP_ZOOM, p.x, p.y, true);
    }

    stage.addEventListener("pointerdown", function (e) {
      if (e.button > 0) return;
      stage.setPointerCapture(e.pointerId);
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        var c = fromCentre((a.x + b.x) / 2, (a.y + b.y) / 2);
        pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: scale, cx: c.x, cy: c.y };
        drag = null;
      } else {
        drag = { x: e.clientX, y: e.clientY, tx: tx, ty: ty, moved: false };
      }
    });

    stage.addEventListener("pointermove", function (e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);

      if (pinch && ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        zoomTo(pinch.scale * Math.hypot(a.x - b.x, a.y - b.y) / pinch.dist, pinch.cx, pinch.cy, false);
        return;
      }
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
      if (drag.moved && scale > 1) {
        stage.classList.add("is-dragging");
        tx = drag.tx + dx;
        ty = drag.ty + dy;
        apply(false);
      }
    });

    function endPointer(e) {
      if (!pointers[e.pointerId]) return;
      delete pointers[e.pointerId];
      stage.classList.remove("is-dragging");
      if (pinch) {
        if (Object.keys(pointers).length < 2) pinch = null;
        drag = null;        // a finger lifting after a pinch is not a tap
        return;
      }
      if (drag && !drag.moved && e.type === "pointerup") toggleZoom(e.clientX, e.clientY);
      drag = null;
    }
    stage.addEventListener("pointerup", endPointer);
    stage.addEventListener("pointercancel", endPointer);

    stage.addEventListener("wheel", function (e) {
      e.preventDefault();
      var p = fromCentre(e.clientX, e.clientY);
      zoomTo(scale * Math.exp(-e.deltaY * 0.0025), p.x, p.y, false);
    }, { passive: false });

    if (zoomBtn) zoomBtn.addEventListener("click", function () { toggleZoom(); });
    var resizeQueued = false;
    window.addEventListener("resize", function () {
      if (box.hidden || resizeQueued) return;
      resizeQueued = true;
      window.requestAnimationFrame(function () { resizeQueued = false; apply(false); });
    });

    function render(i) {
      var piece = pieces[i];
      if (!piece) return;
      current = i;

      var img = $("img", piece);
      var title = $(".piece__title", piece);
      var medium = $(".piece__medium", piece);
      resetZoom();
      imgEl.src = piece.getAttribute("href");
      imgEl.alt = img ? img.alt : (title ? title.textContent : t("painting"));
      titleEl.textContent = title ? title.textContent : "";
      if (countEl) countEl.textContent = (i + 1) + " / " + pieces.length;
      mediumEl.textContent = medium ? medium.textContent : "";
    }

    function isOpen() { return box.classList.contains("is-open"); }

    function open(i) {
      // A close that is still fading out must not hide the box we reopen
      window.clearTimeout(closeTimer);
      box.hidden = false;
      document.documentElement.classList.add("is-locked");
      render(i);
      window.requestAnimationFrame(function () { box.classList.add("is-open"); });
      closeBtn.focus();
    }

    function close() {
      if (!isOpen()) return;
      box.classList.remove("is-open");
      document.documentElement.classList.remove("is-locked");
      closeTimer = window.setTimeout(function () {
        box.hidden = true;
        imgEl.src = "";
        resetZoom();
      }, prefersReducedMotion ? 0 : 350);
      // Back to the painting being viewed, not the one first opened
      pieces[current].focus();
    }

    function step(delta) {
      render((current + delta + pieces.length) % pieces.length);
    }

    grid.addEventListener("click", function (e) {
      var piece = e.target.closest(".piece");
      if (!piece) return;
      // Let Ctrl/Cmd/Shift-click open the image in a new tab or window
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var i = pieces.indexOf(piece);
      if (i === -1) return;
      e.preventDefault();
      open(i);
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { step(-1); });
    nextBtn.addEventListener("click", function () { step(1); });

    box.addEventListener("click", function (e) {
      if (e.target === box) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!isOpen()) return;

      if (e.key === "Escape") { if (scale > 1) zoomTo(1, 0, 0, true); else close(); }
      else if (e.key === "ArrowLeft") { step(-1); }
      else if (e.key === "ArrowRight") { step(1); }
      else if (e.key === "+" || e.key === "=") { zoomTo(scale * 1.5, 0, 0, true); }
      else if (e.key === "-") { zoomTo(scale / 1.5, 0, 0, true); }
      else if (e.key === "0") { zoomTo(1, 0, 0, true); }
      else if (e.key === "Tab") {
        // Keep focus inside the dialog
        var focusable = [closeBtn, zoomBtn, prevBtn, nextBtn].filter(Boolean);
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        var inside = focusable.indexOf(document.activeElement) !== -1;
        if (e.shiftKey && (document.activeElement === first || !inside)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || !inside)) { e.preventDefault(); first.focus(); }
      }
    });
  })();


  /* ======================================================================
     05. COMMISSION FORM
     ====================================================================== */
  (function initForm() {
    var form = $("#commissionForm");
    if (!form) return;

    var status = $("#formStatus");
    var submitBtn = $("#formSubmit");
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setError(field, message) {
      var slot = $('[data-error-for="' + field.id + '"]', form);
      if (slot) slot.textContent = message || "";
      field.classList.toggle("is-invalid", Boolean(message));
      field.setAttribute("aria-invalid", message ? "true" : "false");
    }

    function validate(field) {
      var value = field.value.trim();

      if (!value) {
        setError(field, t("required"));
        return false;
      }
      if (field.type === "email" && !EMAIL_RE.test(value)) {
        setError(field, t("badEmail"));
        return false;
      }
      if (field.id === "message" && value.length < 20) {
        setError(field, t("tooShort"));
        return false;
      }
      setError(field, "");
      return true;
    }

    var fields = $$("input[required], textarea[required]", form);

    fields.forEach(function (field) {
      field.addEventListener("blur", function () { validate(field); });
      field.addEventListener("input", function () {
        if (field.classList.contains("is-invalid")) validate(field);
      });
    });

    function setStatus(message, kind) {
      status.textContent = message;
      status.className = "form__status" + (kind ? " is-" + kind : "");
    }

    var sending = false;

    form.addEventListener("submit", function (e) {
      // Enter in a field can resubmit while a request is already out
      if (sending) { e.preventDefault(); return; }

      var firstBad = null;
      fields.forEach(function (field) {
        if (!validate(field) && !firstBad) firstBad = field;
      });

      if (firstBad) {
        e.preventDefault();
        setStatus(t("checkFields"), "error");
        firstBad.focus();
        return;
      }

      var action = form.getAttribute("action") || "";

      // Without fetch, let the browser post normally
      if (!window.fetch) return;

      e.preventDefault();
      sending = true;
      submitBtn.disabled = true;
      submitBtn.classList.add("is-busy");
      $(".btn__label", submitBtn).textContent = t("sending");
      setStatus(t("sending"), "");

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            fields.forEach(function (f) { setError(f, ""); });
            setStatus(t("sent"), "success");
          } else {
            // The error body is not always JSON (e.g. a proxy's HTML page)
            return res.json().catch(function () { return null; }).then(function (data) {
              var msg = (data && data.errors)
                ? data.errors.map(function (er) { return er.message; }).filter(Boolean).join(", ")
                : "";
              // Formspree's own messages are English only
              setStatus(LANG === "el" ? t("failed") : (msg || t("failed")), "error");
            });
          }
        })
        .catch(function () {
          setStatus(t("offline"), "error");
        })
        .then(function () {
          sending = false;
          submitBtn.disabled = false;
          submitBtn.classList.remove("is-busy");
          $(".btn__label", submitBtn).textContent = t("send");
        });
    });
  })();


  /* ======================================================================
     06. FOOTER YEAR
     ====================================================================== */
  (function initYear() {
    var el = $("#year");
    if (el) el.textContent = new Date().getFullYear();
  })();


  /* ======================================================================
     07. BUTTON PAINT SPLAT
     Places the press splat (.btn::after) under the pointer. Delegated, so it
     also covers buttons Elementor renders later with the .btn class.
     ====================================================================== */
  (function initButtonSplat() {
    if (prefersReducedMotion) return;

    document.addEventListener("pointerdown", function (e) {
      var btn = e.target.closest && e.target.closest(".btn");
      if (!btn) return;
      var r = btn.getBoundingClientRect();
      btn.style.setProperty("--x", (e.clientX - r.left) + "px");
      btn.style.setProperty("--y", (e.clientY - r.top) + "px");
      btn.classList.remove("is-splat");
      void btn.offsetWidth;            // restart the animation on rapid presses
      btn.classList.add("is-splat");
    });

    document.addEventListener("animationend", function (e) {
      if (e.animationName === "btn-splat") e.target.classList.remove("is-splat");
    });
  })();

})();
