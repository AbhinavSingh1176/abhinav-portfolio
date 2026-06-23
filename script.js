// Abhinav Singh — portfolio
// Deliberately small: theme, form, image fallbacks, lightbox, scroll reveal.

const SUN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
const MOON_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

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
  const icon = document.querySelector("[data-theme-icon]");
  // Show the icon for the mode you'd switch TO: moon in light, sun in dark.
  if (icon) icon.innerHTML = theme === "dark" ? SUN_ICON : MOON_ICON;
}

document.addEventListener("DOMContentLoaded", () => {
  // ---------- Footer year + printed timestamp ----------
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
  const printed = document.querySelector("[data-printed]");
  if (printed) printed.textContent = new Date().toISOString().slice(0, 10);

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

  // ---------- Age (auto-updates on birthday, July 11 2006) ----------
  const ageCell = document.querySelector("[data-age]");
  if (ageCell) {
    const now = new Date();
    let years = now.getFullYear() - 2006;
    const hadBirthday = now >= new Date(now.getFullYear(), 6, 11); // July 11
    if (!hadBirthday) years -= 1;
    ageCell.textContent = `${years} yr`;
  }

  // ---------- Build log: load older entries ----------
  const logMore = document.getElementById("logMore");
  const logList = document.getElementById("logList");
  if (logMore && logList) {
    logMore.addEventListener("click", () => {
      logList.classList.add("expanded");
      logMore.remove();
    });
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

  // ---------- Section A–A cut: draw-in on scroll ----------
  // The cut band shows static by default (no-JS / reduced motion safe).
  // With motion allowed, JS arms it (pre-draw state) then plays the cut
  // when it scrolls into view: plane sweeps, hatched face wipes in, labels set.
  const cut = document.querySelector(".section-cut");
  if (cut && !reduceMotion && "IntersectionObserver" in window) {
    cut.classList.add("cut-armed");
    const cutObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cut.classList.add("cut-drawn");
            cutObs.unobserve(cut);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    cutObs.observe(cut);
  }

  // ---------- Vernier caliper jaw on the experience timeline ----------
  // The timeline beam doubles as a caliper scale; this jaw slides along it
  // with scroll, tracking how far through the experience you've read.
  const expList = document.querySelector(".exp-list");
  if (expList) {
    const jaw = document.createElement("span");
    jaw.className = "exp-jaw";
    jaw.setAttribute("aria-hidden", "true");
    expList.appendChild(jaw);
    const placeJaw = () => {
      const r = expList.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh * 0.5 - r.top) / r.height;
      const clamped = Math.max(0, Math.min(1, p));
      jaw.style.top = clamped * r.height + "px";
      jaw.style.opacity = r.top < vh && r.bottom > 0 ? "1" : "0";
    };
    window.addEventListener("scroll", placeJaw, { passive: true });
    window.addEventListener("resize", placeJaw, { passive: true });
    placeJaw();
  }

  // ---------- Instrument readout ----------
  initInstrument();
});

// ---------- Instrument readout ----------
// The page behaves like a measurement instrument: a reticle crosshair
// trails the cursor with spring lag, and a corner HUD reads out live
// cursor position, scroll depth, and the active datum (which also lights
// up that section's GD&T tag). The whole layer is injected here, so every
// page that loads this script gets it with no markup duplication. It is
// purely decorative and aria-hidden; nothing here is required to use the site.
function initInstrument() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;

  // Build the layer once.
  const frag = document.createDocumentFragment();
  ["reg-tl", "reg-tr", "reg-bl", "reg-br"].forEach((pos) => {
    const m = document.createElement("div");
    m.className = "reg-mark " + pos;
    m.setAttribute("aria-hidden", "true");
    frag.appendChild(m);
  });

  const hud = document.createElement("aside");
  hud.className = "hud";
  hud.setAttribute("aria-hidden", "true");
  hud.innerHTML =
    '<div class="hud-header"><span class="hud-live"></span> INSTRUMENT · LIVE</div>' +
    '<div class="hud-row"><span class="hud-k">X</span><span class="hud-v" data-hx>–</span></div>' +
    '<div class="hud-row"><span class="hud-k">Y</span><span class="hud-v" data-hy>–</span></div>' +
    '<div class="hud-row"><span class="hud-k">SCR</span><span class="hud-v" data-hs>0.0%</span></div>' +
    '<div class="hud-row"><span class="hud-k">DAT</span><span class="hud-datum-v" data-hd>A</span></div>' +
    '<div class="hud-bar-wrap"><div class="hud-bar-fill" data-hbar></div></div>';
  frag.appendChild(hud);

  let retH, retV, retN;
  if (finePointer && !reduceMotion) {
    retH = document.createElement("div"); retH.className = "ret-h"; retH.setAttribute("aria-hidden", "true");
    retV = document.createElement("div"); retV.className = "ret-v"; retV.setAttribute("aria-hidden", "true");
    retN = document.createElement("div"); retN.className = "ret-node"; retN.setAttribute("aria-hidden", "true");
    frag.appendChild(retH); frag.appendChild(retV); frag.appendChild(retN);
  }
  document.body.appendChild(frag);

  const hX = hud.querySelector("[data-hx]");
  const hY = hud.querySelector("[data-hy]");
  const hS = hud.querySelector("[data-hs]");
  const hD = hud.querySelector("[data-hd]");
  const hBar = hud.querySelector("[data-hbar]");

  let W = window.innerWidth, H = window.innerHeight;
  window.addEventListener("resize", () => { W = window.innerWidth; H = window.innerHeight; }, { passive: true });

  // Datum sections: whichever section's top has passed 45% of the viewport
  // is the active datum. Drives the HUD letter and the section's GD&T tag.
  const sections = Array.prototype.slice.call(document.querySelectorAll(".section[data-datum]"));
  let lastDatum = "A";
  const activeDatum = () => {
    let cur = "A";
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= H * 0.45) cur = sections[i].getAttribute("data-datum");
    }
    return cur;
  };
  const setActiveSection = (d) =>
    sections.forEach((s) => s.classList.toggle("is-active", s.getAttribute("data-datum") === d));

  // Spring/lerp state.
  let cx = -200, cy = -200, tx = -200, ty = -200, dx = 0, dy = 0, dScroll = 0;
  let active = false, idleTimer = null;
  const kPos = reduceMotion ? 1 : 0.13;
  const kVal = reduceMotion ? 1 : 0.09;
  const kScr = reduceMotion ? 1 : 0.07;

  if (finePointer) {
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!active) {
        active = true;
        if (retH) { retH.style.opacity = "0.16"; retV.style.opacity = "0.16"; retN.style.opacity = "0.4"; }
        hud.classList.add("visible");
      }
      if (retH) {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          retH.style.opacity = "0"; retV.style.opacity = "0"; retN.style.opacity = "0";
        }, 3000);
      }
    }, { passive: true });
  } else {
    window.addEventListener("scroll", () => hud.classList.add("visible"), { passive: true, once: true });
  }

  function tick() {
    cx = lerp(cx, tx, kPos); cy = lerp(cy, ty, kPos);
    dx = lerp(dx, W > 0 ? tx / W : 0, kVal);
    dy = lerp(dy, H > 0 ? ty / H : 0, kVal);
    const maxScroll = document.documentElement.scrollHeight - H;
    dScroll = lerp(dScroll, maxScroll > 0 ? window.scrollY / maxScroll : 0, kScr);

    if (retH && active) {
      retH.style.left = (cx - 36) + "px"; retH.style.top = cy + "px";
      retV.style.top = (cy - 36) + "px"; retV.style.left = cx + "px";
      retN.style.left = cx + "px"; retN.style.top = cy + "px";
    }
    if (active) { hX.textContent = dx.toFixed(3); hY.textContent = dy.toFixed(3); }
    hS.textContent = (dScroll * 100).toFixed(1) + "%";
    hBar.style.width = (dScroll * 100) + "%";

    const d = sections.length ? activeDatum() : "—";
    if (d !== lastDatum) {
      lastDatum = d;
      hD.textContent = d;
      hD.classList.remove("flash"); void hD.offsetWidth; hD.classList.add("flash");
      setActiveSection(d);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

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
