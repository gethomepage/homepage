import { useEffect, useState } from "react";

const MINUTE = 60_000;

export default function useCurrentTime(refreshInterval = MINUTE) {
  const [currentTime, setCurrentTime] = useState(Date.now);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return currentTime;
}
