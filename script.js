/* ============================================================
   NBC DÉPANNAGE — script.js  (rebuild v3 — mobile-safe)
   Principe : le contenu est TOUJOURS visible sans JS.
   JS ajoute uniquement des bonus (animations, compteurs, menu).
   ============================================================ */
(function () {
  "use strict";

  /* ── utilitaire DOM ready ── */
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ══════════════════════════════════════════════════════
     1. SCROLL REVEAL — bonus optionnel
        N'affecte que les éléments HORS du viewport initial.
        Si l'observer plante → éléments restent visibles.
  ══════════════════════════════════════════════════════ */
  ready(function () {
    if (!("IntersectionObserver" in window)) return; // vieux navigateurs → skip

    // On attend 200ms que le layout soit stable (Safari iOS)
    setTimeout(function () {
      var els = document.querySelectorAll(
        ".section .reveal, .section .reveal-right, " +
        ".section--dark .reveal, .section--stats .reveal"
      );

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.remove("will-animate");
            entry.target.classList.add("did-animate");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });

      els.forEach(function (el) {
        // Vérifie que l'élément n'est PAS déjà dans le viewport
        var rect = el.getBoundingClientRect();
        var inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) {
          el.classList.add("will-animate");
          observer.observe(el);
        }
      });

      // Filet absolu : révèle tout après 2.5s
      setTimeout(function () {
        els.forEach(function (el) {
          el.classList.remove("will-animate");
          el.classList.add("did-animate");
        });
      }, 2500);

    }, 200);
  });

  /* ══════════════════════════════════════════════════════
     2. FOOTER YEAR
  ══════════════════════════════════════════════════════ */
  ready(function () {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  });

  /* ══════════════════════════════════════════════════════
     3. HEADER SCROLL
  ══════════════════════════════════════════════════════ */
  var header = document.getElementById("site-header");
  function updateHeader() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 20);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  ready(updateHeader);

  /* ══════════════════════════════════════════════════════
     4. MENU MOBILE
  ══════════════════════════════════════════════════════ */
  ready(function () {
    var toggle = document.getElementById("menu-toggle");
    var nav    = document.getElementById("mobile-nav");
    if (!toggle || !nav) return;

    function closeMenu() {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      nav.setAttribute("aria-hidden", "true");
    }

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      nav.setAttribute("aria-hidden", String(!open));
    });

    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (e) {
      if (header && !header.contains(e.target) && nav.classList.contains("open")) closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { closeMenu(); toggle.focus(); }
    });
  });

  /* ══════════════════════════════════════════════════════
     5. COMPTEURS ANIMÉS
        Utilise setTimeout comme fallback si l'observer
        ne se déclenche pas (problème courant sur iOS Safari)
  ══════════════════════════════════════════════════════ */
  ready(function () {
    var counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    function runCounter(el) {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      var target   = parseInt(el.getAttribute("data-count"), 10);
      var duration = 1200;
      var start    = null;
      function step(ts) {
        if (!start) start = ts;
        var p    = Math.min((ts - start) / duration, 1);
        var ease = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(ease * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window) {
      var cObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCounter(entry.target); cObs.unobserve(entry.target); }
        });
      }, { threshold: 0.1 }); // seuil bas = déclenche plus facilement

      counters.forEach(function (el) { cObs.observe(el); });
    }

    // Fallback : si l'observer ne se déclenche pas après 2s → force le compte
    setTimeout(function () {
      counters.forEach(function (el) { runCounter(el); });
    }, 2000);
  });

  /* ══════════════════════════════════════════════════════
     6. JAUGE SVG
  ══════════════════════════════════════════════════════ */
  ready(function () {
    var gauge = document.getElementById("gauge-avail");
    if (!gauge) return;
    var circ = 2 * Math.PI * 50;
    gauge.style.strokeDasharray  = circ;
    gauge.style.strokeDashoffset = circ;
    setTimeout(function () {
      gauge.style.transition = "stroke-dashoffset 1.8s ease";
      gauge.style.strokeDashoffset = circ * 0.02;
    }, 500);
  });

  /* ══════════════════════════════════════════════════════
     7. FORMULAIRE CONTACT
  ══════════════════════════════════════════════════════ */
  ready(function () {
    var form    = document.getElementById("contact-form");
    var success = document.getElementById("form-success");
    var wrap    = document.querySelector(".contact-form-wrap");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      ["#name", "#phone"].forEach(function (sel) {
        var f = form.querySelector(sel);
        if (!f.value.trim()) {
          f.classList.add("error");
          f.setAttribute("aria-invalid", "true");
          valid = false;
          f.addEventListener("input", function () {
            f.classList.remove("error"); f.removeAttribute("aria-invalid");
          }, { once: true });
        }
      });
      if (!valid) return;

      var btn = form.querySelector("button[type='submit']");
      btn.textContent = "Envoi en cours…";
      btn.disabled = true;

      setTimeout(function () {
        form.hidden = true;
        var hdr = wrap && wrap.querySelector(".contact-form-header");
        if (hdr) hdr.hidden = true;
        if (success) { success.hidden = false; success.focus(); }
      }, 900);
    });
  });

  /* ══════════════════════════════════════════════════════
     8. SMOOTH SCROLL (compatible Safari)
  ══════════════════════════════════════════════════════ */
  ready(function () {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = this.getAttribute("href");
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var hdr    = document.getElementById("site-header");
        var offset = hdr ? hdr.offsetHeight + 8 : 76;
        var top    = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });
  });

  /* ══════════════════════════════════════════════════════
     9. STYLE ERREUR FORM
  ══════════════════════════════════════════════════════ */
  var s = document.createElement("style");
  s.textContent = ".form-input.error{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.15);}";
  document.head.appendChild(s);

})();
