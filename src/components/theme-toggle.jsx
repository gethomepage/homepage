import { useContext } from "react";
import { MdDarkMode, MdLightMode, MdToggleOff, MdToggleOn } from "react-icons/md";

import { ThemeContext } from "utils/theme-context";

export default function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);

  if (!theme) {
    return null;
  }

  return (
    <div className="rounded-full flex self-end">
      <MdLightMode className="text-theme-800 dark:text-theme-200 w-5 h-5 m-1.5" />
      {theme === "dark" ? (
        <MdToggleOn
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-theme-800 dark:text-theme-200 w-8 h-8 cursor-pointer"
        />
      ) : (
        <MdToggleOff
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-theme-800 dark:text-theme-200 w-8 h-8 cursor-pointer"
        />
      )}
      <MdDarkMode className="text-theme-800 dark:text-theme-200 w-5 h-5 m-1.5" />
    </div>
  );
}
