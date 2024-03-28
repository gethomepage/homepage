import { createContext, useState, useMemo } from "react";

export const TabContext = createContext();

export function TabProvider({ initialTab, children }) {
  const [activeTab, setActiveTab] = useState(false);

  if (initialTab) {
    setActiveTab(initialTab);
  }

  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}
