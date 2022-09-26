import { createContext, useState, useMemo } from "react";

export const SettingsContext = createContext();

export function SettingsProvider({ initialSettings, children }) {
  const [settings, setSettings] = useState({});

  if (initialSettings) {
    setSettings(initialSettings);
  }

  const value = useMemo(() => ({ settings, setSettings }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
