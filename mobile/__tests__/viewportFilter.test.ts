import {
  createPinClusterIndex,
  getClustersForRegion,
} from '@/features/map/clusterPins';
import { filterPins } from '@/features/map/filterPins';
import type { MapRegion } from '@/types/map';
import {
  ConnectorStatus,
  ConnectorType,
  type Pin,
} from '@/types/pin';

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

describe('filter + cluster composition', () => {
  it('clusters only filtered pins that fall in the current region', () => {
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

    const filtered = filterPins(pins, {
      types: [ConnectorType.Type2],
      statuses: [ConnectorStatus.Available],
    });
    const pinsById = new Map(filtered.map((pin) => [pin._id, pin]));
    const items = getClustersForRegion(
      createPinClusterIndex(filtered),
      pinsById,
      region,
    );

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ kind: 'pin', id: 'inside' });
  });
});
