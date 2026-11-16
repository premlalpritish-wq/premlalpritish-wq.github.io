(function () {
  const storageKey = "portfolio-theme";
  const root = document.documentElement;
  const toggleBtn = document.getElementById("theme-toggle-btn");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (toggleBtn) {
      toggleBtn.textContent = theme === "dark" ? "Theme: Dark" : "Theme: Light";
      toggleBtn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }

  let initial = "light";
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "dark" || saved === "light") {
      initial = saved;
    }
  } catch (_) {
    // Ignore storage access errors in restricted contexts.
  }

  applyTheme(initial);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(storageKey, next);
      } catch (_) {
        // Ignore storage access errors.
      }
    });
  }
})();
