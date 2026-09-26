// Abhinav Singh — portfolio
// Deliberately small: theme, scroll-spy, image fallbacks, lightbox,
// copy-email, scroll reveal, contact form.

const SUN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
const MOON_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

// ---------- Theme ----------
// data-theme itself is applied by a tiny inline script in <head> before
// first paint (no flash for dark-mode visitors); here we only sync the
// toggle icon, with a backstop in case that script didn't run.
(function initTheme() {
  const root = document.documentElement;
  if (!root.getAttribute("data-theme")) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let saved = null;
    try { saved = localStorage.getItem("theme"); } catch (e) { /* storage blocked */ }
    root.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));
  }
  updateThemeLabel(root.getAttribute("data-theme"));
})();

function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  const apply = () => {
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* storage blocked */ }
    updateThemeLabel(next);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = next === "dark" ? "#0f1113" : "#f7f6f2";
  };
  // Cross-fade the whole page between themes where supported.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && document.startViewTransition) document.startViewTransition(apply);
  else apply();
}

function updateThemeLabel(theme) {
  const icon = document.querySelector("[data-theme-icon]");
  // Show the icon for the mode you'd switch TO: moon in light, sun in dark.
  if (icon) icon.innerHTML = theme === "dark" ? SUN_ICON : MOON_ICON;
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

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const navTop = document.getElementById("navTop");
  if (navTop) {
    navTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  // ---------- Scroll-spy ----------
  // The nav link for the section currently in view stays lit.
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const spied = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  if (spied.length && "IntersectionObserver" in window) {
    const setActive = (id) => {
      navLinks.forEach((a) => {
        const on = a.getAttribute("href") === "#" + id;
        a.classList.toggle("active", on);
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    spied.forEach((s) => spy.observe(s));
  }

  // ---------- Lightbox ----------
  // Any project image opens in the shared <dialog>; every image in the same
  // project becomes one figure set you can arrow through (buttons or
  // ArrowLeft/ArrowRight). Native dialog behavior handles Esc; clicking the
  // backdrop closes too.
  const lightbox = document.getElementById("lightbox");
  if (lightbox && typeof lightbox.showModal === "function") {
    const lbImg = lightbox.querySelector("img");
    const lbCap = lightbox.querySelector("figcaption");
    const lbPrev = lightbox.querySelector(".lightbox-prev");
    const lbNext = lightbox.querySelector(".lightbox-next");
    let group = [], index = 0;
    const preNext = new Image(), prePrev = new Image(); // reused neighbor decoders

    const swapImage = (img) => {
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      const show = () => { lbImg.style.opacity = "1"; };
      if (lbImg.complete) requestAnimationFrame(show);
      else lbImg.addEventListener("load", show, { once: true });
    };
    const render = (fade) => {
      const img = group[index];
      if (fade) {
        // Cross-fade between figures: dip out, swap, ease back in.
        lbImg.style.opacity = "0";
        setTimeout(() => swapImage(img), 150);
      } else {
        lbImg.style.opacity = "1";
        swapImage(img);
      }
      lbCap.textContent =
        (group.length > 1 ? `Fig. ${index + 1} of ${group.length} · ` : "") + img.alt;
      if (lbPrev) lbPrev.hidden = lbNext.hidden = group.length < 2;
      if (group.length > 1) {
        // decode the neighbors before the next arrow press
        preNext.src = group[(index + 1) % group.length].src;
        prePrev.src = group[(index - 1 + group.length) % group.length].src;
      }
    };
    const step = (d) => {
      if (group.length < 2) return;
      index = (index + d + group.length) % group.length;
      render(true);
    };

    // One figure set per media container; a views-grid that isn't inside a
    // case-media (the VIM gallery) is its own set.
    const sets = Array.from(document.querySelectorAll(".case-media"));
    document.querySelectorAll(".views-grid").forEach((g) => {
      if (!g.closest(".case-media")) sets.push(g);
    });
    sets.forEach((box) => {
      box.querySelectorAll("img").forEach((img) => {
        img.addEventListener("click", () => {
          // Re-query at open: images that failed to load have been swapped
          // for placeholders and should drop out of the set.
          group = Array.from(box.querySelectorAll("img"));
          index = Math.max(0, group.indexOf(img));
          render(false);
          lightbox.showModal();
        });
      });
    });

    if (lbPrev) lbPrev.addEventListener("click", () => step(-1));
    if (lbNext) lbNext.addEventListener("click", () => step(1));
    lightbox.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.close();
    });
    lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  }

  // ---------- Copy email ----------
  // The mailto link stays a normal link; this button just puts the address
  // on the clipboard. If the Clipboard API is unavailable, nothing breaks.
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "Copied";
        btn.classList.add("ok");
        setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("ok"); }, 1500);
      } catch { /* clipboard unavailable — the link beside the button still works */ }
    });
  });

  // ---------- Scroll reveal ----------
  // Progressive enhancement: content is visible by default; the reveal
  // class is only added when the observer is available and motion is OK.
  if (!reduceMotion && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(".feature, .case, .also, .exp-list, .about-grid, .log-list li");
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
      // Skip anything already on screen at load — no pop-in above the fold.
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
