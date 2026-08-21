import { useSyncExternalStore } from "react";

const hasFocus = () => typeof document !== "undefined" && document.hasFocus();

const subscribe = (onFocusChange) => {
  window.addEventListener("focus", onFocusChange);
  window.addEventListener("blur", onFocusChange);

  return () => {
    window.removeEventListener("focus", onFocusChange);
    window.removeEventListener("blur", onFocusChange);
  };
};

const useWindowFocus = () => useSyncExternalStore(subscribe, hasFocus, () => false);

export default useWindowFocus;
