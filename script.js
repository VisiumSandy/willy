/* ============================================================
   NBC DÉPANNAGE — script.js
   ─ Scroll reveal (IntersectionObserver)
   ─ Header scroll state
   ─ Mobile menu toggle
   ─ Animated counters
   ─ Gauge animation
   ─ Contact form mock submit
   ─ Footer year
   ─ Mobile nav link close
   ============================================================ */

(function () {
  "use strict";

  /* ─── CRITICAL: Add js-anim class so CSS animations activate
         Only after DOM is ready — prevents blank page on mobile ─ */
  document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add("js-anim");
  });

  /* ─── 1. FOOTER YEAR ──────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    const yearEl = document.getElementById("footer-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });

  /* ─── 2. HEADER SCROLL STATE ──────────────────────────── */
  const header = document.getElementById("site-header");

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("DOMContentLoaded", onScroll);

  /* ─── 3. MOBILE MENU TOGGLE ───────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menu-toggle");
    const mobileNav  = document.getElementById("mobile-nav");

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", () => {
        const isOpen = mobileNav.classList.toggle("open");
        menuToggle.classList.toggle("open", isOpen);
        menuToggle.setAttribute("aria-expanded", isOpen);
        mobileNav.setAttribute("aria-hidden", !isOpen);
      });

      mobileNav.querySelectorAll(".mobile-link, .btn").forEach((link) => {
        link.addEventListener("click", () => {
          mobileNav.classList.remove("open");
          menuToggle.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
          mobileNav.setAttribute("aria-hidden", "true");
        });
      });

      document.addEventListener("click", (e) => {
        if (header && !header.contains(e.target) && mobileNav.classList.contains("open")) {
          mobileNav.classList.remove("open");
          menuToggle.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
          mobileNav.setAttribute("aria-hidden", "true");
        }
      });
    }
  });

  /* ─── 4. SCROLL REVEAL ────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    const revealEls = document.querySelectorAll(".reveal, .reveal-right");

    if (!revealEls.length) return;

    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.05,          // lower = triggers earlier on mobile
          rootMargin: "0px 0px -20px 0px",
        }
      );

      revealEls.forEach((el) => revealObserver.observe(el));

      /* Safety fallback: reveal everything after 2s in case observer stalls */
      setTimeout(() => {
        revealEls.forEach((el) => el.classList.add("revealed"));
      }, 2000);

    } else {
      /* No IntersectionObserver support — show everything immediately */
      revealEls.forEach((el) => el.classList.add("revealed"));
    }
  });

  /* ─── 5. ANIMATED COUNTERS ────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    const counterEls = document.querySelectorAll("[data-count]");
    if (!counterEls.length) return;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function animateCounter(el) {
      const target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target)) return;
      const duration = 1400;
      let startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        el.textContent = Math.round(easeOutQuart(progress) * target);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      counterEls.forEach((el) => counterObserver.observe(el));
    } else {
      counterEls.forEach((el) => animateCounter(el));
    }
  });

  /* ─── 6. GAUGE ANIMATION ──────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    const gaugeEl = document.getElementById("gauge-avail");
    if (!gaugeEl) return;

    const circumference = 2 * Math.PI * 50;
    gaugeEl.style.strokeDasharray = circumference;
    gaugeEl.style.strokeDashoffset = circumference;

    if ("IntersectionObserver" in window) {
      const gaugeObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                gaugeEl.style.transition = "stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1)";
                gaugeEl.style.strokeDashoffset = circumference * 0.02;
              }, 300);
              gaugeObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      gaugeObserver.observe(gaugeEl);
    } else {
      gaugeEl.style.strokeDashoffset = circumference * 0.02;
    }
  });

  /* ─── 7. CONTACT FORM SUBMIT (mock) ──────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    const contactForm     = document.getElementById("contact-form");
    const formSuccess     = document.getElementById("form-success");
    const contactFormWrap = document.querySelector(".contact-form-wrap");

    if (!contactForm) return;

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name  = contactForm.querySelector("#name");
      const phone = contactForm.querySelector("#phone");
      let valid = true;

      [name, phone].forEach((field) => {
        if (!field.value.trim()) {
          field.classList.add("error");
          field.setAttribute("aria-invalid", "true");
          valid = false;
          field.addEventListener("input", () => {
            field.classList.remove("error");
            field.removeAttribute("aria-invalid");
          }, { once: true });
        }
      });

      if (!valid) return;

      const submitBtn = contactForm.querySelector("button[type='submit']");
      submitBtn.textContent = "Envoi en cours…";
      submitBtn.disabled = true;

      setTimeout(() => {
        contactForm.hidden = true;
        const hdr = contactFormWrap.querySelector(".contact-form-header");
        if (hdr) hdr.hidden = true;
        if (formSuccess) {
          formSuccess.hidden = false;
          formSuccess.focus();
        }
      }, 900);
    });
  });

  /* ─── 8. PARALLAX HERO GRID (très léger, desktop only) ── */
  document.addEventListener("DOMContentLoaded", function () {
    const heroGrid = document.querySelector(".hero-grid");
    const isMobile = window.innerWidth < 768;

    if (heroGrid && !isMobile &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.addEventListener("scroll", () => {
        heroGrid.style.transform = `translateY(${window.scrollY * 0.15}px)`;
      }, { passive: true });
    }
  });

  /* ─── 9. SMOOTH SCROLL ────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          e.preventDefault();
          const hdr = document.getElementById("site-header");
          const headerH = hdr ? hdr.offsetHeight : 68;
          const targetTop = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
          window.scrollTo({ top: targetTop, behavior: "smooth" });
        }
      });
    });
  });

  /* ─── 10. KEYBOARD ESC — close mobile nav ────────────── */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const mobileNav  = document.getElementById("mobile-nav");
      const menuToggle = document.getElementById("menu-toggle");
      if (mobileNav && mobileNav.classList.contains("open")) {
        mobileNav.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("aria-hidden", "true");
        menuToggle.focus();
      }
    }
  });

  /* ─── 11. FORM ERROR STYLES ───────────────────────────── */
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .form-input.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239,68,68,0.18);
    }
    .header-nav a.active { color: var(--text); }
  `;
  document.head.appendChild(styleSheet);

  console.log("[NBC Dépannage] Site chargé — 24h/24, 7j/7 · 06 61 94 82 50 🚗🔧");
})();
