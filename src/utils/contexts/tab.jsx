import { createContext, useEffect, useMemo, useState } from "react";

export const TabContext = createContext();

export function TabProvider({ initialTab, children }) {
  const [activeTab, setActiveTab] = useState(() => initialTab ?? false);

  useEffect(() => {
    if (initialTab !== undefined) setActiveTab(initialTab ?? false);
  }, [initialTab]);

  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}
