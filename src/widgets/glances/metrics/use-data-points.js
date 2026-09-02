import { useCallback, useState } from "react";

export default function useDataPoints(pointsLimit, initialPoint) {
  const [dataPoints, setDataPoints] = useState(() => new Array(pointsLimit).fill(initialPoint));

  const addDataPoint = useCallback(
    (dataPoint) => {
      setDataPoints((currentDataPoints) => {
        if (pointsLimit <= 0) return [];
        return [...currentDataPoints, dataPoint].slice(-pointsLimit);
      });
    },
    [pointsLimit],
  );

  return [dataPoints, addDataPoint];
}
