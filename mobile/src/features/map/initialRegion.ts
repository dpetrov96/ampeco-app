import type { MapRegion } from '@/types/map';
import type { Pin } from '@/types/pin';

const COUNTRY_BOXES: Array<{
  id: string;
  south: number;
  north: number;
  west: number;
  east: number;
}> = [
  { id: 'BG', south: 41.2, north: 44.25, west: 22.3, east: 28.7 },
  { id: 'RO', south: 43.6, north: 48.3, west: 20.2, east: 29.8 },
  { id: 'GR', south: 34.8, north: 41.8, west: 19.3, east: 29.7 },
  { id: 'TR', south: 35.8, north: 42.2, west: 25.6, east: 45.0 },
  { id: 'RS', south: 42.2, north: 46.2, west: 18.8, east: 23.0 },
  { id: 'MK', south: 40.8, north: 42.4, west: 20.4, east: 23.1 },
  { id: 'DE', south: 47.2, north: 55.1, west: 5.8, east: 15.1 },
  { id: 'FR', south: 41.3, north: 51.2, west: -5.2, east: 9.7 },
  { id: 'IT', south: 36.6, north: 47.1, west: 6.6, east: 18.6 },
  { id: 'ES', south: 35.9, north: 43.9, west: -9.4, east: 3.4 },
  { id: 'GB', south: 49.8, north: 58.7, west: -8.2, east: 1.8 },
  { id: 'US', south: 24.5, north: 49.4, west: -125.0, east: -66.9 },
];

export const FALLBACK_INITIAL_REGION: MapRegion = {
  latitude: 42.5,
  longitude: 24.5,
  latitudeDelta: 9,
  longitudeDelta: 12,
};

const LOCAL_RADIUS_KM = 120;
const NEIGHBORHOOD_KM = 250;
const WIDE_NEIGHBORHOOD_KM = 450;
const REGIONAL_PIN_RADIUS_KM = 550;
const MIN_DELTA = 7;
const MAX_DELTA = 14;
const PADDING = 1.45;

export function resolveCountryId(
  latitude: number,
  longitude: number,
): string | null {
  for (const box of COUNTRY_BOXES) {
    if (
      latitude >= box.south &&
      latitude <= box.north &&
      longitude >= box.west &&
      longitude <= box.east
    ) {
      return box.id;
    }
  }
  return null;
}

export function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function pinsInCountry(pins: Pin[], countryId: string): Pin[] {
  const box = COUNTRY_BOXES.find((item) => item.id === countryId);
  if (!box) {
    return [];
  }
  return pins.filter(
    (pin) =>
      pin.latitude >= box.south &&
      pin.latitude <= box.north &&
      pin.longitude >= box.west &&
      pin.longitude <= box.east,
  );
}

export function regionFittingPins(pins: Pin[]): MapRegion {
  if (pins.length === 0) {
    return FALLBACK_INITIAL_REGION;
  }

  let minLat = pins[0].latitude;
  let maxLat = pins[0].latitude;
  let minLng = pins[0].longitude;
  let maxLng = pins[0].longitude;

  for (const pin of pins) {
    minLat = Math.min(minLat, pin.latitude);
    maxLat = Math.max(maxLat, pin.latitude);
    minLng = Math.min(minLng, pin.longitude);
    maxLng = Math.max(maxLng, pin.longitude);
  }

  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;
  const latitudeDelta = Math.min(
    MAX_DELTA,
    Math.max(MIN_DELTA, (maxLat - minLat) * PADDING || MIN_DELTA),
  );
  const longitudeDelta = Math.min(
    MAX_DELTA,
    Math.max(MIN_DELTA, (maxLng - minLng) * PADDING || MIN_DELTA),
  );

  return { latitude, longitude, latitudeDelta, longitudeDelta };
}

function nearestPin(
  pins: Pin[],
  latitude: number,
  longitude: number,
): Pin | null {
  let best: Pin | null = null;
  let bestDistance = Infinity;

  for (const pin of pins) {
    const distance = haversineKm(
      latitude,
      longitude,
      pin.latitude,
      pin.longitude,
    );
    if (distance < bestDistance) {
      bestDistance = distance;
      best = pin;
    }
  }

  return best;
}

function pinsWithinKm(
  pins: Pin[],
  latitude: number,
  longitude: number,
  radiusKm: number,
): Pin[] {
  return pins.filter(
    (pin) =>
      haversineKm(latitude, longitude, pin.latitude, pin.longitude) <=
      radiusKm,
  );
}

export function findInitialMapRegion(
  userLatitude: number,
  userLongitude: number,
  pins: Pin[],
): MapRegion {
  if (pins.length === 0) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: MIN_DELTA,
      longitudeDelta: MIN_DELTA * 1.3,
    };
  }

  const userCountry = resolveCountryId(userLatitude, userLongitude);
  const countryPins = userCountry ? pinsInCountry(pins, userCountry) : [];
  const candidates = countryPins.length > 0 ? countryPins : pins;

  let anchorLat = userLatitude;
  let anchorLng = userLongitude;

  const local = pinsWithinKm(
    candidates,
    userLatitude,
    userLongitude,
    LOCAL_RADIUS_KM,
  );
  if (local.length > 0) {
    const fitted = regionFittingPins(local);
    anchorLat = fitted.latitude;
    anchorLng = fitted.longitude;
  } else {
    const nearest = nearestPin(candidates, userLatitude, userLongitude);
    if (!nearest) {
      return FALLBACK_INITIAL_REGION;
    }

    const neighborhood = pinsWithinKm(
      candidates,
      nearest.latitude,
      nearest.longitude,
      NEIGHBORHOOD_KM,
    );
    const wider = pinsWithinKm(
      candidates,
      nearest.latitude,
      nearest.longitude,
      WIDE_NEIGHBORHOOD_KM,
    );
    const group =
      neighborhood.length >= 2
        ? neighborhood
        : wider.length > 0
          ? wider
          : [nearest];
    const fitted = regionFittingPins(group);
    anchorLat = fitted.latitude;
    anchorLng = fitted.longitude;
  }

  const regionalPins = pinsWithinKm(
    pins,
    anchorLat,
    anchorLng,
    REGIONAL_PIN_RADIUS_KM,
  );
  const overview =
    regionalPins.length > 0
      ? regionFittingPins(regionalPins)
      : {
          latitude: anchorLat,
          longitude: anchorLng,
          latitudeDelta: MIN_DELTA,
          longitudeDelta: MIN_DELTA * 1.3,
        };

  return {
    latitude: overview.latitude,
    longitude: overview.longitude,
    latitudeDelta: Math.max(MIN_DELTA, overview.latitudeDelta),
    longitudeDelta: Math.max(MIN_DELTA * 1.25, overview.longitudeDelta),
  };
}
