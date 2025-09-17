import { useContext } from "react";
import { useTranslation } from "next-i18next";
import { FiSearch } from "react-icons/fi";
import { SettingsContext } from "utils/contexts/settings";

export default function QuickLaunchButton({ onClick }) {
  const { t } = useTranslation();
  const { settings } = useContext(SettingsContext);

  // Get quicklaunch button settings with defaults
  const buttonSettings = settings?.quicklaunch?.mobileButton ?? {};
  const isEnabled = buttonSettings.enabled !== false; // default true
  const position = buttonSettings.position || "left"; // default left

  // Don't render if disabled
  if (!isEnabled) {
    return null;
  }

  // Position classes
  const positionClasses = {
    left: "bottom-6 left-6",
    right: "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "bottom-right": "bottom-6 right-6",
    "top-left": "top-6 left-6",
    "top-right": "top-6 right-6"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`md:hidden fixed ${positionClasses[position] || positionClasses.left} z-30 p-3 rounded-full bg-theme-600/90 dark:bg-theme-700/90 backdrop-blur-sm shadow-lg shadow-theme-900/20 dark:shadow-theme-900/40 text-white hover:bg-theme-700 dark:hover:bg-theme-600 transition-colors duration-200`}
      aria-label={t("quicklaunch.search")}
      title={t("quicklaunch.search")}
    >
      <FiSearch className="w-6 h-6" />
    </button>
  );
}