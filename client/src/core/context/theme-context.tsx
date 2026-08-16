import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "dark" | "light" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme_mode") as ThemeMode | null;
    return saved || "dark";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    let actualTheme: "dark" | "light" = "dark";

    if (mode === "system") {
      actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      actualTheme = mode;
    }

    setResolvedTheme(actualTheme);

    // Apply classes and data-theme to both html and body
    root.classList.remove("dark", "light");
    root.classList.add(actualTheme);
    root.setAttribute("data-theme", actualTheme);
    document.body.classList.remove("dark", "light");
    document.body.classList.add(actualTheme);
    document.body.setAttribute("data-theme", actualTheme);

    localStorage.setItem("theme_mode", mode);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // System theme change listener
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const nextTheme = (prev === "dark" || (prev === "system" && resolvedTheme === "dark")) ? "light" : "dark";
      return nextTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeProvider");
  }
  return context;
}
