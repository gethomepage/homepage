import { createContext, useEffect, useMemo, useState } from "react";

const getInitialHideState = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    const storedPrefs = window.localStorage.getItem("hide-sensitive");
    if (typeof storedPrefs === "string") {
      return storedPrefs === "true";
    }
  }

  return false; // show sensitive data by default
};

export const HideContext = createContext();

export function HideSensitiveProvider({ initialHide, children }) {
  const [hideSensitive, setHideSensitive] = useState(getInitialHideState);

  const rawSetHideSensitive = (hideState) => {
    localStorage.setItem("hide-sensitive", hideState.toString());
  };

  if (initialHide !== undefined) {
    rawSetHideSensitive(initialHide);
  }

  useEffect(() => {
    rawSetHideSensitive(hideSensitive);
  }, [hideSensitive]);

  const value = useMemo(() => ({ hideSensitive, setHideSensitive }), [hideSensitive]);

  return <HideContext.Provider value={value}>{children}</HideContext.Provider>;
}
