import type { MapBounds, MapRegion } from '@/types/map';

export function regionToBounds(region: MapRegion): MapBounds {
  const halfLat = region.latitudeDelta / 2;
  const halfLng = region.longitudeDelta / 2;

  return {
    north: region.latitude + halfLat,
    south: region.latitude - halfLat,
    east: region.longitude + halfLng,
    west: region.longitude - halfLng,
  };
}

export function isCoordinateInBounds(
  latitude: number,
  longitude: number,
  bounds: MapBounds,
): boolean {
  const inLat = latitude <= bounds.north && latitude >= bounds.south;
  const inLng = longitude <= bounds.east && longitude >= bounds.west;

  return inLat && inLng;
}
