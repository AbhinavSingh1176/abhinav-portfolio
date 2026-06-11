// Abhinav Singh — portfolio v3
// Deliberately small: theme, form, image fallbacks, lightbox, scroll reveal.

// ---------- Theme ----------
(function initTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeLabel(theme);
})();

function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateThemeLabel(next);
}

function updateThemeLabel(theme) {
  const label = document.querySelector("[data-theme-label]");
  if (label) label.textContent = theme === "dark" ? "LIGHT" : "DARK";
}

document.addEventListener("DOMContentLoaded", () => {
  // ---------- Footer year ----------
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Image fallbacks ----------
  // Any <img> with data-fallback that fails to load is swapped for a
  // labeled placeholder, so a missing photo never looks broken.
  document.querySelectorAll("img[data-fallback]").forEach((img) => {
    const swap = () => {
      const ph = document.createElement("div");
      ph.className = "media-placeholder mono";
      ph.textContent = img.dataset.fallback;
      img.replaceWith(ph);
    };
    if (img.complete && img.naturalWidth === 0) swap();
    else img.addEventListener("error", swap, { once: true });
  });

  // ---------- Thermal scroll indicator + gear ----------
  // The bar heats up as you read; the gear in the masthead turns with
  // scroll position (clockwise down, counterclockwise up). Clicking it
  // scrolls home, which spins it backward on the way.
  const thermo = document.querySelector(".thermo");
  const gear = document.querySelector(".gear");
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (thermo) thermo.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    if (gear && !reduceMotionQuery.matches) {
      gear.style.transform = `rotate(${window.scrollY * 0.35}deg)`;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  const navTop = document.getElementById("navTop");
  if (navTop) {
    navTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotionQuery.matches ? "auto" : "smooth" });
    });
  }

  // ---------- Age, to the day ----------
  // GD&T limit tolerance: age only accumulates, no minus material.
  const ageCell = document.querySelector("[data-age]");
  if (ageCell) {
    const now = new Date();
    let years = now.getFullYear() - 2006;
    let lastBday = new Date(now.getFullYear(), 6, 11); // July 11
    if (now < lastBday) {
      years -= 1;
      lastBday = new Date(now.getFullYear() - 1, 6, 11);
    }
    const days = Math.floor((now - lastBday) / 86400000);
    ageCell.textContent = `${years} yr (+${days} d / −0 d)`;
  }

  // ---------- Lightbox ----------
  // Any project image opens in the shared <dialog>. Native behavior
  // handles Esc; clicking the backdrop closes too.
  const lightbox = document.getElementById("lightbox");
  if (lightbox && typeof lightbox.showModal === "function") {
    const lbImg = lightbox.querySelector("img");
    const lbCap = lightbox.querySelector("figcaption");
    document.querySelectorAll(".case-media img, .views-grid img").forEach((img) => {
      img.addEventListener("click", () => {
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbCap.textContent = img.alt.toUpperCase();
        lightbox.showModal();
      });
    });
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.close();
    });
    lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  }

  // ---------- Scroll reveal ----------
  // Progressive enhancement: content is visible by default; the reveal
  // class is only added when the observer is available and motion is OK.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(".case, .section-label, .about-grid, .log-list li");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((el) => {
      // skip anything already on screen at load — no pop-in above the fold
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("reveal");
        observer.observe(el);
      }
    });
  }
});

// ---------- Contact form (Formspree) ----------
async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const button = document.getElementById("submitButton");
  const status = document.getElementById("formStatus");

  button.disabled = true;
  button.textContent = "Sending…";
  status.textContent = "";
  status.classList.remove("ok");

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      form.reset();
      status.textContent = "Sent. I'll reply soon.";
      status.classList.add("ok");
    } else {
      status.textContent = "Something went wrong — email me directly instead.";
    }
  } catch {
    status.textContent = "Network error — email me directly instead.";
  } finally {
    button.disabled = false;
    button.textContent = "Send message";
  }
}
