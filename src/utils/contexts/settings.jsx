import { createContext, useEffect, useMemo, useState } from "react";

export const SettingsContext = createContext();

export function SettingsProvider({ initialSettings, children }) {
  const [settings, setSettings] = useState(() => initialSettings ?? {});

  useEffect(() => {
    if (initialSettings !== undefined) setSettings(initialSettings ?? {});
  }, [initialSettings]);

  const value = useMemo(() => ({ settings, setSettings }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
