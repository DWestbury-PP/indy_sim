import { useRef, useEffect } from 'react';

/**
 * Custom hook to track historical data for sparklines
 * Maintains a sliding window of recent values
 */
export function useTrendData(currentValue, maxPoints = 30) {
  const historyRef = useRef([]);

  useEffect(() => {
    if (currentValue !== undefined && currentValue !== null) {
      historyRef.current.push(currentValue);

      // Keep only the last N points
      if (historyRef.current.length > maxPoints) {
        historyRef.current.shift();
      }
    }
  }, [currentValue, maxPoints]);

  return historyRef.current;
}
