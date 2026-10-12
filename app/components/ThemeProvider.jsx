"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "addis-eats-theme";
const THEMES = ["light", "dark", "system"];

const ThemeContext = createContext(null);

function readStoredTheme() {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.includes(stored)) return stored;
  } catch {
    /* localStorage may be unavailable (private mode); fall back to system */
  }
  return "system";
}

function readSystemTheme() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Small external store so useSyncExternalStore can subscribe to both real
// cross-tab `storage` events and in-app setTheme() calls.
const listeners = new Set();

function subscribe(callback) {
  listeners.add(callback);
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY || event.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function notify() {
  listeners.forEach((callback) => callback());
}

export function ThemeProvider({ children }) {
  // Both snapshots are read via useSyncExternalStore so the server render and
  // the first hydration render always agree (getServerSnapshot), while the
  // client still resolves the real preference immediately after hydration —
  // no setState-in-effect and no hydration mismatch warnings. The inline
  // <head> script has already applied the correct data-theme before paint,
  // so the visible theme never flickers.
  const theme = useSyncExternalStore(subscribe, readStoredTheme, () => "system");
  const systemTheme = useSyncExternalStore(subscribe, readSystemTheme, () => "light");

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  // Keep <html> attributes in sync with the resolved theme (the no-flash
  // script sets them before paint; this sustains them through toggles and
  // OS preference changes).
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = useCallback((next) => {
    if (!THEMES.includes(next)) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore persistence errors */
    }
    notify();
  }, []);

  const value = { theme, resolvedTheme, setTheme };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return context;
}
