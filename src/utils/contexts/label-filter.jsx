import { createContext, useMemo, useState } from "react";

export const LabelFilterContext = createContext();

export function LabelFilterProvider({ children }) {
  const [activeLabelSlug, setActiveLabelSlug] = useState(null);

  const toggleLabelFilter = (slug) => {
    setActiveLabelSlug((current) => (current === slug ? null : slug));
  };

  const value = useMemo(
    () => ({
      activeLabelSlug,
      toggleLabelFilter,
    }),
    [activeLabelSlug],
  );

  return <LabelFilterContext.Provider value={value}>{children}</LabelFilterContext.Provider>;
}
