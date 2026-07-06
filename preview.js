// Abhinav Singh — portfolio
// Deliberately small: theme, form, image fallbacks, lightbox, scroll reveal.

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
    root.setAttribute("data-theme", localStorage.getItem("theme") || (prefersDark ? "dark" : "light"));
  }
  updateThemeLabel(root.getAttribute("data-theme"));
})();

function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  const apply = () => {
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateThemeLabel(next);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = next === "dark" ? "#0e1012" : "#f8f7f3";
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
  // Where CSS scroll-driven animations exist, the thermo bar runs entirely
  // off-thread in CSS and JS leaves it alone — except under reduced motion,
  // where the global animation kill-switch stops the CSS path, so JS (which
  // is just positional feedback, not motion) takes back over.
  const cssThermo = CSS.supports("animation-timeline: scroll()") && !reduceMotionQuery.matches;
  // scrollHeight is layout-expensive to read, so cache it and refresh only on
  // resize / content change. Style writes are coalesced into one rAF per frame
  // no matter how many scroll events fire in between.
  let scrollMax = 0;
  const refreshScrollMax = () => { scrollMax = document.documentElement.scrollHeight - window.innerHeight; };
  let scrollScheduled = false;
  const renderScroll = () => {
    scrollScheduled = false;
    if (thermo && !cssThermo) thermo.style.width = (scrollMax > 0 ? (window.scrollY / scrollMax) * 100 : 0) + "%";
    if (gear && !reduceMotionQuery.matches) gear.style.transform = `rotate(${window.scrollY * 0.35}deg)`;
  };
  const onScroll = () => {
    if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(renderScroll); }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { refreshScrollMax(); onScroll(); }, { passive: true });
  refreshScrollMax();
  renderScroll();

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
      refreshScrollMax();
    });
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
        (group.length > 1 ? `FIG. ${index + 1} / ${group.length} — ` : "") + img.alt.toUpperCase();
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
        btn.textContent = "COPIED ✓";
        btn.classList.add("ok");
        setTimeout(() => { btn.textContent = "COPY"; btn.classList.remove("ok"); }, 1500);
      } catch { /* clipboard unavailable — the link beside the button still works */ }
    });
  });

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
      // Skip anything already on screen at load — no pop-in above the fold.
      // Measured against the containing section, not the element: sections
      // use content-visibility, so a skipped section's descendants don't
      // have trustworthy boxes yet, but the section itself always does.
      const anchor = el.closest(".section") || el;
      if (anchor.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("reveal");
        observer.observe(el);
      }
    });
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
  // Scroll-spy rides the same datum tracker: the active section lights its
  // GD&T tag AND its nav link (with aria-current for assistive tech).
  const navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  const setActiveSection = (d) => {
    let activeId = null;
    sections.forEach((s) => {
      const on = s.getAttribute("data-datum") === d;
      s.classList.toggle("is-active", on);
      if (on) activeId = s.id;
    });
    navLinks.forEach((a) => {
      const on = activeId && a.getAttribute("href") === "#" + activeId;
      a.classList.toggle("active", !!on);
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  };

  // Spring/lerp state.
  let cx = -200, cy = -200, tx = -200, ty = -200, dx = 0, dy = 0, dScroll = 0;
  let active = false, idleTimer = null;
  const kPos = reduceMotion ? 1 : 0.13;
  const kVal = reduceMotion ? 1 : 0.09;
  const kScr = reduceMotion ? 1 : 0.07;

  // The render loop only runs while something is still moving: wake() starts
  // it, tick() stops itself once every spring has settled. This replaces a
  // permanent requestAnimationFrame that ran every frame for the life of the
  // page even when the cursor and scroll were completely idle.
  let running = false;
  function wake() { if (!running) { running = true; requestAnimationFrame(tick); } }

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
      wake();
    }, { passive: true });
  }
  // Scroll drives the HUD readout + active datum for every pointer type.
  window.addEventListener("scroll", () => { hud.classList.add("visible"); wake(); }, { passive: true });

  function tick() {
    // All layout READS happen up front, all style WRITES after — otherwise
    // the datum check would re-measure a layout this frame already dirtied,
    // forcing a reflow on every animated frame.
    const maxScroll = document.documentElement.scrollHeight - H;
    const targetScroll = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    const d = sections.length ? activeDatum() : "—";

    cx = lerp(cx, tx, kPos); cy = lerp(cy, ty, kPos);
    dx = lerp(dx, W > 0 ? tx / W : 0, kVal);
    dy = lerp(dy, H > 0 ? ty / H : 0, kVal);
    dScroll = lerp(dScroll, targetScroll, kScr);

    // Position with transform only — compositor-friendly, no per-frame layout.
    if (retH && active) {
      retH.style.transform = `translate(${cx - 36}px, ${cy}px)`;
      retV.style.transform = `translate(${cx}px, ${cy - 36}px)`;
      retN.style.transform = `translate(${cx - 3.5}px, ${cy - 3.5}px)`;
    }
    if (active) { hX.textContent = dx.toFixed(3); hY.textContent = dy.toFixed(3); }
    hS.textContent = (dScroll * 100).toFixed(1) + "%";
    hBar.style.width = (dScroll * 100) + "%";

    if (d !== lastDatum) {
      lastDatum = d;
      hD.textContent = d;
      hD.classList.remove("flash"); void hD.offsetWidth; hD.classList.add("flash");
      setActiveSection(d);
    }

    // Keep animating only until the cursor and scroll springs have settled,
    // then release the loop. mousemove / scroll call wake() to resume.
    const moving =
      Math.abs(cx - tx) > 0.5 || Math.abs(cy - ty) > 0.5 ||
      Math.abs(dScroll - targetScroll) > 0.0004;
    if (moving) requestAnimationFrame(tick);
    else running = false;
  }
  wake(); // prime the HUD scroll readout + active datum once at load
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
