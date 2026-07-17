import {
  FALLBACK_INITIAL_REGION,
  findInitialMapRegion,
  haversineKm,
  regionFittingPins,
  resolveCountryId,
} from '@/features/map/initialRegion';
import {
  ConnectorStatus,
  ConnectorType,
  type Pin,
} from '@/types/pin';

const makePin = (
  overrides: Partial<Pin> & Pick<Pin, '_id' | 'latitude' | 'longitude'>,
): Pin => ({
  title: 'Test',
  connectors: [
    { type: ConnectorType.Type2, status: ConnectorStatus.Available },
  ],
  ...overrides,
});

describe('initialRegion', () => {
  it('resolves Bulgaria for Sofia and Varna', () => {
    expect(resolveCountryId(42.7, 23.32)).toBe('BG');
    expect(resolveCountryId(43.21, 27.91)).toBe('BG');
  });

  it('prefers same-country pins when the user has none nearby', () => {
    const pins: Pin[] = [
      makePin({ _id: 'sofia', latitude: 42.7, longitude: 23.32 }),
      makePin({ _id: 'plovdiv', latitude: 42.15, longitude: 24.75 }),
      makePin({ _id: 'nyc', latitude: 40.71, longitude: -74.0 }),
    ];

    const region = findInitialMapRegion(43.21, 27.91, pins);

    expect(haversineKm(region.latitude, region.longitude, 42.7, 23.32)).toBeLessThan(
      200,
    );
    expect(haversineKm(region.latitude, region.longitude, 40.71, -74)).toBeGreaterThan(
      1000,
    );
  });

  it('fits a regional zoom when local pins exist near the user', () => {
    const pins: Pin[] = [
      makePin({ _id: 'a', latitude: 43.205, longitude: 27.915 }),
      makePin({ _id: 'b', latitude: 43.22, longitude: 27.9 }),
      makePin({ _id: 'far', latitude: 42.7, longitude: 23.32 }),
    ];

    const region = findInitialMapRegion(43.21, 27.91, pins);
    expect(region.latitudeDelta).toBeGreaterThanOrEqual(7);
    expect(region.longitudeDelta).toBeGreaterThanOrEqual(7);
  });

  it('falls back when there are no pins', () => {
    const region = findInitialMapRegion(43.21, 27.91, []);
    expect(region.latitude).toBeCloseTo(43.21, 2);
    expect(region.latitudeDelta).toBeGreaterThanOrEqual(7);
  });

  it('regionFittingPins clamps empty to fallback', () => {
    expect(regionFittingPins([])).toEqual(FALLBACK_INITIAL_REGION);
  });
});
