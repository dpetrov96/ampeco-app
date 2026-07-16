import type { MapRegion } from '../../types/map';

/** Approximate Google Maps zoom level from a react-native-maps region. */
export function regionToZoom(region: MapRegion): number {
  const zoom = Math.log2(360 / Math.max(region.longitudeDelta, 0.0001));
  return Math.max(0, Math.min(20, Math.round(zoom)));
}

export function zoomToLongitudeDelta(zoom: number): number {
  return 360 / Math.pow(2, Math.max(0, zoom));
}
