import { useEffect, useState } from 'react';

const TRACK_WINDOW_MS = 400;

/**
 * react-native-maps custom markers need a short tracksViewChanges window
 * after content changes, then freeze for scroll performance.
 */
export function useMarkerTracksViewChanges(resetKey: string): boolean {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), TRACK_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [resetKey]);

  return tracksViewChanges;
}
