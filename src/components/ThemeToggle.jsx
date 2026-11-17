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
      <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
      {theme === "dark" ? "Светъл режим" : "Тъмен режим"}
    </button>
  );
}
