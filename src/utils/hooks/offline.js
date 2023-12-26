import { useEffect, useState } from "react";

export default function useOffline() {
  const [isOffline, setOffline] = useState();

  useEffect(() => {
    setOffline(!window.navigator.onLine);

    function handleOfflineChange() {
      setOffline(!window.navigator.onLine);
    }

    window.addEventListener("online", handleOfflineChange);
    window.addEventListener("offline", handleOfflineChange);

    return () => {
      window.removeEventListener("online", handleOfflineChange);
      window.removeEventListener("offline", handleOfflineChange);
    };
  }, []);

  return {
    isOffline,
  };
}
