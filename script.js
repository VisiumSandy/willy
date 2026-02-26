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

  /* ─── 1. FOOTER YEAR ──────────────────────────────────── */
  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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
  onScroll(); // initial check

  /* ─── 3. MOBILE MENU TOGGLE ───────────────────────────── */
  const menuToggle = document.getElementById("menu-toggle");
  const mobileNav  = document.getElementById("mobile-nav");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      menuToggle.classList.toggle("open", isOpen);
      menuToggle.setAttribute("aria-expanded", isOpen);
      mobileNav.setAttribute("aria-hidden", !isOpen);
    });

    // Close menu when a link is clicked
    mobileNav.querySelectorAll(".mobile-link, .btn").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("aria-hidden", "true");
      });
    });

    // Close menu on outside click
    document.addEventListener("click", (e) => {
      if (!header.contains(e.target) && mobileNav.classList.contains("open")) {
        mobileNav.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("aria-hidden", "true");
      }
    });
  }

  /* ─── 4. SMOOTH ACTIVE NAV LINKS ─────────────────────── */
  const navLinks = document.querySelectorAll(".header-nav a, .footer-links a");
  const sections = document.querySelectorAll("section[id], div[id='stats']");

  function updateActiveNav() {
    let current = "";
    sections.forEach((sec) => {
      const top = sec.getBoundingClientRect().top;
      if (top <= 100) current = sec.id;
    });
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });

  /* ─── 5. SCROLL REVEAL (IntersectionObserver) ──────────── */
  const revealEls = document.querySelectorAll(".reveal, .reveal-right");

  if ("IntersectionObserver" in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.style.getPropertyValue("--delay") || "0ms";
            // Apply delay via CSS var (already on element) and add class
            requestAnimationFrame(() => {
              el.classList.add("revealed");
            });
            revealObserver.unobserve(el);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: show all elements immediately
    revealEls.forEach((el) => el.classList.add("revealed"));
  }

  /* ─── 6. ANIMATED COUNTERS ────────────────────────────── */
  const counterEls = document.querySelectorAll("[data-count]");

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    const duration = 1400; // ms
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window && counterEls.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counterEls.forEach((el) => counterObserver.observe(el));
  }

  /* ─── 7. GAUGE ANIMATION ──────────────────────────────── */
  const gaugeEl = document.getElementById("gauge-avail");

  if (gaugeEl && "IntersectionObserver" in window) {
    const circumference = 2 * Math.PI * 50; // r=50
    gaugeEl.style.strokeDasharray = circumference;
    gaugeEl.style.strokeDashoffset = circumference; // start empty

    const gaugeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate to ~98% (always available)
            setTimeout(() => {
              gaugeEl.style.transition = "stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1)";
              gaugeEl.style.strokeDashoffset = circumference * 0.02; // 98% filled
            }, 300);
            gaugeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    gaugeObserver.observe(gaugeEl);
  }

  /* ─── 8. CONTACT FORM SUBMIT (mock) ──────────────────── */
  const contactForm    = document.getElementById("contact-form");
  const formSuccess    = document.getElementById("form-success");
  const contactFormWrap = document.querySelector(".contact-form-wrap");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Basic validation
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

      // Simulate sending
      const submitBtn = contactForm.querySelector("button[type='submit']");
      submitBtn.textContent = "Envoi en cours…";
      submitBtn.disabled = true;

      setTimeout(() => {
        contactForm.hidden = true;
        const header = contactFormWrap.querySelector(".contact-form-header");
        if (header) header.hidden = true;
        if (formSuccess) {
          formSuccess.hidden = false;
          formSuccess.focus();
        }
      }, 900);
    });
  }

  /* ─── 9. PARALLAX HERO GRID (très léger) ────────────── */
  const heroGrid = document.querySelector(".hero-grid");

  if (heroGrid && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      heroGrid.style.transform = `translateY(${y * 0.15}px)`;
    }, { passive: true });
  }

  /* ─── 10. KEYBOARD ACCESSIBILITY — focus trap mobile nav */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNav && mobileNav.classList.contains("open")) {
      mobileNav.classList.remove("open");
      menuToggle.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      mobileNav.setAttribute("aria-hidden", "true");
      menuToggle.focus();
    }
  });

  /* ─── 11. SMOOTH SCROLL POLYFILL FOR SAFARI ──────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        const headerH = header ? header.offsetHeight : 68;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
        window.scrollTo({ top: targetTop, behavior: "smooth" });
      }
    });
  });

  /* ─── 12. FORM INPUT STYLING — error state ───────────── */
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .form-input.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239,68,68,0.18);
    }
    .header-nav a.active {
      color: var(--text);
    }
  `;
  document.head.appendChild(styleSheet);

  console.log("[NBC Dépannage] Site chargé — 24h/24, 7j/7 · 06 61 94 82 50 🚗🔧");
})();
