"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState("id"); // "id" | "en"
  const [theme, setTheme] = useState("dark"); // only "light" | "dark" (no device mode)

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <AppContext.Provider value={{ lang, setLang, theme, setTheme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppContext);
  if (!context) {
    // Return fallback defaults if used outside provider
    return {
      lang: "id",
      setLang: () => { },
      theme: "dark",
      setTheme: () => { },
      toggleTheme: () => { },
    };
  }
  return context;
}
