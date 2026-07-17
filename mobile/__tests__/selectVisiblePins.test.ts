import {
  CONNECTOR_STATUSES,
  CONNECTOR_TYPES,
  type Pin,
} from '@/types/pin';
import type { MapRegion } from '@/types/map';
import { selectVisiblePins } from '@/features/map/selectVisiblePins';

const region: MapRegion = {
  latitude: 42.7,
  longitude: 23.3,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

const makePin = (overrides: Partial<Pin> & Pick<Pin, '_id' | 'latitude' | 'longitude'>): Pin => ({
  title: 'Test',
  connectors: [{ type: 'Type 2', status: 'available' }],
  ...overrides,
});

describe('selectVisiblePins', () => {
  it('returns only pins inside the region that match filters', () => {
    const pins: Pin[] = [
      makePin({ _id: 'inside', latitude: 42.7, longitude: 23.3 }),
      makePin({ _id: 'outside', latitude: 50, longitude: 10 }),
      makePin({
        _id: 'filtered-out',
        latitude: 42.71,
        longitude: 23.31,
        connectors: [{ type: 'J1772', status: 'unavailable' }],
      }),
    ];

    const visible = selectVisiblePins(pins, region, {
      types: ['Type 2'],
      statuses: ['available'],
    });

    expect(visible.map((pin) => pin._id)).toEqual(['inside']);
  });

  it('returns empty array when region is null', () => {
    expect(
      selectVisiblePins(
        [makePin({ _id: 'a', latitude: 0, longitude: 0 })],
        null,
        { types: [...CONNECTOR_TYPES], statuses: [...CONNECTOR_STATUSES] },
      ),
    ).toEqual([]);
  });
});
