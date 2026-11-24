import React, { useEffect, useState } from "react";

// Настройката за темата е отделна от запазените резервации.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("myasto-theme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("myasto-theme", theme);
    } catch {
      // Превключването работи и когато браузърът забранява записа.
    }
  }, [theme]);

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      >
        {theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </>
        ) : (
          <path d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z" />
        )}
      </svg>
      {theme === "dark" ? "Светъл режим" : "Тъмен режим"}
    </button>
  );
}
