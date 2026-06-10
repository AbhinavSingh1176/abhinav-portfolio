// Abhinav Singh — portfolio v2
// Deliberately small: theme, form, date stamps. No SPA machinery.

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

// ---------- Footer year ----------
document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
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
