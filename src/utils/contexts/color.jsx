import { createContext, useState, useEffect, useMemo } from "react";

let lastColor = false;

const getInitialColor = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    const storedPrefs = window.localStorage.getItem("theme-color");
    if (typeof storedPrefs === "string") {
      lastColor = storedPrefs;
      return storedPrefs;
    }
  }

  return "slate"; // slate as the default color;
};

export const ColorContext = createContext();

export function ColorProvider({ initialTheme, children }) {
  const [color, setColor] = useState(getInitialColor);

  const rawSetColor = (rawColor) => {
    const root = window.document.getElementById("page_wrapper");

    root.classList.remove(`theme-${lastColor}`);
    root.classList.add(`theme-${rawColor}`);

    localStorage.setItem("theme-color", rawColor);

    lastColor = rawColor;
  };

  if (initialTheme) {
    rawSetColor(initialTheme);
  }

  useEffect(() => {
    rawSetColor(color);
  }, [color]);

  const value = useMemo(() => ({ color, setColor }), [color]);

  return <ColorContext.Provider value={value}>{children}</ColorContext.Provider>;
}
