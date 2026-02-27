/* ============================================================
   NBC DÉPANNAGE — script.js  v4 (bulletproof)
   Principe fondamental :
   - Le HTML affiche les vraies valeurs par défaut
   - JS ajoute uniquement des effets visuels bonus
   - Rien ne dépend du JS pour être lisible/fonctionnel
   ============================================================ */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ══════════════════════════════════════════════════
     1. COMPTEURS ANIMÉS
     Lance l'animation immédiatement au chargement.
     Les valeurs par défaut dans le HTML (16, 2...)
     garantissent l'affichage même sans JS.
  ══════════════════════════════════════════════════ */
  ready(function () {
    var counters = document.querySelectorAll("[data-count]");
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target) || target === 0) return;

      // Remet à 0 uniquement si la valeur est déjà correcte
      // (donc JS tourne = on peut faire l'animation)
      el.textContent = "0";

      var start    = null;
      var duration = 1000;

      function step(ts) {
        if (!start) start = ts;
        var p    = Math.min((ts - start) / duration, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }

      // Petit délai pour que l'animation soit visible
      setTimeout(function () {
        requestAnimationFrame(step);
      }, 400);
    });
  });

  /* ══════════════════════════════════════════════════
     2. JAUGE SVG
  ══════════════════════════════════════════════════ */
  ready(function () {
    var gauge = document.getElementById("gauge-avail");
    if (!gauge) return;
    var circ = 2 * Math.PI * 50;
    gauge.style.strokeDasharray  = circ;
    gauge.style.strokeDashoffset = circ;
    setTimeout(function () {
      gauge.style.transition      = "stroke-dashoffset 1.8s ease";
      gauge.style.strokeDashoffset = circ * 0.02;
    }, 500);
  });

  /* ══════════════════════════════════════════════════
     3. HEADER SCROLL
  ══════════════════════════════════════════════════ */
  var header = document.getElementById("site-header");
  function updateHeader() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 20);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  ready(updateHeader);

  /* ══════════════════════════════════════════════════
     4. MENU MOBILE
  ══════════════════════════════════════════════════ */
  ready(function () {
    var toggle = document.getElementById("menu-toggle");
    var nav    = document.getElementById("mobile-nav");
    if (!toggle || !nav) return;

    function closeMenu() {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      nav.setAttribute("aria-hidden",      "true");
    }

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      nav.setAttribute("aria-hidden",      String(!open));
    });

    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (e) {
      if (header && !header.contains(e.target) && nav.classList.contains("open"))
        closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        closeMenu(); toggle.focus();
      }
    });
  });

  /* ══════════════════════════════════════════════════
     5. SCROLL REVEAL (bonus — ne cache jamais rien)
  ══════════════════════════════════════════════════ */
  ready(function () {
    if (!("IntersectionObserver" in window)) return;

    setTimeout(function () {
      var els = document.querySelectorAll(".section .reveal, .section .reveal-right");

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("did-animate");
            entry.target.classList.remove("will-animate");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05 });

      els.forEach(function (el) {
        var rect   = el.getBoundingClientRect();
        var inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) {
          el.classList.add("will-animate");
          observer.observe(el);
        }
      });

      // Sécurité : révèle tout dans 3s
      setTimeout(function () {
        els.forEach(function (el) {
          el.classList.remove("will-animate");
          el.classList.add("did-animate");
        });
      }, 3000);
    }, 300);
  });

  /* ══════════════════════════════════════════════════
     6. FORMULAIRE
  ══════════════════════════════════════════════════ */
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
        if (!f || !f.value.trim()) {
          if (f) { f.style.borderColor = "#ef4444"; }
          valid = false;
          if (f) f.addEventListener("input", function () {
            f.style.borderColor = "";
          }, { once: true });
        }
      });
      if (!valid) return;

      var btn = form.querySelector("button[type='submit']");
      btn.textContent = "Envoi en cours…";
      btn.disabled    = true;

      setTimeout(function () {
        form.hidden = true;
        var hdr = wrap && wrap.querySelector(".contact-form-header");
        if (hdr) hdr.hidden = true;
        if (success) { success.hidden = false; success.focus(); }
      }, 900);
    });
  });

  /* ══════════════════════════════════════════════════
     7. FOOTER YEAR
  ══════════════════════════════════════════════════ */
  ready(function () {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  });

  /* ══════════════════════════════════════════════════
     8. SMOOTH SCROLL
  ══════════════════════════════════════════════════ */
  ready(function () {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var target = document.querySelector(this.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        var hdr    = document.getElementById("site-header");
        var offset = hdr ? hdr.offsetHeight + 8 : 76;
        window.scrollTo({
          top:      target.getBoundingClientRect().top + window.pageYOffset - offset,
          behavior: "smooth"
        });
      });
    });
  });

})();
