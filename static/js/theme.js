const STORAGE_KEY = "arcconnect-theme";

export function getTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable (private mode, etc.) — fall through to system preference.
  }
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore — theme still applies for this page load, just won't persist.
  }
}

export function toggleTheme() {
  const next = getTheme() === "light" ? "dark" : "light";
  setTheme(next);
  return next;
}
