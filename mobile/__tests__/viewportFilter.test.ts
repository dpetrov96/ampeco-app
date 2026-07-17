import { filterPins } from '@/features/map/filterPins';
import type { FilterSelection } from '@/store/slices/filtersSlice';
import type { MapRegion } from '@/types/map';
import {
  CONNECTOR_STATUSES,
  CONNECTOR_TYPES,
  ConnectorStatus,
  ConnectorType,
  type Pin,
} from '@/types/pin';
import { isCoordinateInBounds, regionToBounds } from '@/utils/mapBounds';

const region: MapRegion = {
  latitude: 42.7,
  longitude: 23.3,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

const makePin = (
  overrides: Partial<Pin> & Pick<Pin, '_id' | 'latitude' | 'longitude'>,
): Pin => ({
  title: 'Test',
  connectors: [
    { type: ConnectorType.Type2, status: ConnectorStatus.Available },
  ],
  ...overrides,
});

/** Viewport filtering used by the map (clustering queries the same bbox). */
function visibleFilteredPins(
  pins: Pin[],
  mapRegion: MapRegion | null,
  filters: FilterSelection,
): Pin[] {
  if (!mapRegion) {
    return [];
  }

  const bounds = regionToBounds(mapRegion);
  return filterPins(pins, filters).filter((pin) =>
    isCoordinateInBounds(pin.latitude, pin.longitude, bounds),
  );
}

describe('viewport + filter composition', () => {
  it('returns only pins inside the region that match filters', () => {
    const pins: Pin[] = [
      makePin({ _id: 'inside', latitude: 42.7, longitude: 23.3 }),
      makePin({ _id: 'outside', latitude: 50, longitude: 10 }),
      makePin({
        _id: 'filtered-out',
        latitude: 42.71,
        longitude: 23.31,
        connectors: [
          { type: ConnectorType.J1772, status: ConnectorStatus.Unavailable },
        ],
      }),
    ];

    const visible = visibleFilteredPins(pins, region, {
      types: [ConnectorType.Type2],
      statuses: [ConnectorStatus.Available],
    });

    expect(visible.map((pin) => pin._id)).toEqual(['inside']);
  });

  it('returns empty array when region is null', () => {
    expect(
      visibleFilteredPins(
        [makePin({ _id: 'a', latitude: 0, longitude: 0 })],
        null,
        { types: [...CONNECTOR_TYPES], statuses: [...CONNECTOR_STATUSES] },
      ),
    ).toEqual([]);
  });
});
