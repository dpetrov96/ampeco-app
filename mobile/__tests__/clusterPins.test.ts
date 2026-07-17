import {
  createPinClusterIndex,
  declutterClusterItems,
  getClusterExpansionRegion,
  getClustersForRegion,
  getPinFocusRegion,
  MAX_VISIBLE_MARKERS,
  type MapClusterItem,
} from '@/features/map/clusterPins';
import { regionToZoom } from '@/features/map/regionZoom';
import type { Pin } from '@/types/pin';
import { ConnectorStatus, ConnectorType } from '@/types/pin';
import type { MapRegion } from '@/types/map';

const makePin = (
  overrides: Partial<Pin> & Pick<Pin, '_id' | 'latitude' | 'longitude'>,
): Pin => ({
  title: 'Test',
  connectors: [
    { type: ConnectorType.Type2, status: ConnectorStatus.Available },
  ],
  ...overrides,
});

describe('clusterPins', () => {
  const pins: Pin[] = [
    makePin({ _id: 'a', latitude: 42.7, longitude: 23.3 }),
    makePin({ _id: 'b', latitude: 42.701, longitude: 23.301 }),
    makePin({ _id: 'c', latitude: 42.702, longitude: 23.302 }),
    makePin({ _id: 'far', latitude: 48, longitude: 10 }),
  ];

  const pinsById = new Map(pins.map((pin) => [pin._id, pin]));
  const index = createPinClusterIndex(pins);

  it('keeps multiple regional clusters when zoomed far out', () => {
    const spreadPins: Pin[] = [
      makePin({ _id: 'bg', latitude: 42.7, longitude: 23.3 }),
      makePin({ _id: 'bg2', latitude: 42.72, longitude: 23.35 }),
      makePin({ _id: 'de', latitude: 52.5, longitude: 13.4 }),
      makePin({ _id: 'de2', latitude: 52.52, longitude: 13.45 }),
      makePin({ _id: 'us', latitude: 40.7, longitude: -74 }),
      makePin({ _id: 'us2', latitude: 40.72, longitude: -74.02 }),
      makePin({ _id: 'au', latitude: -33.8, longitude: 151.2 }),
      makePin({ _id: 'au2', latitude: -33.82, longitude: 151.25 }),
    ];
    const spreadIndex = createPinClusterIndex(spreadPins);
    const spreadById = new Map(spreadPins.map((pin) => [pin._id, pin]));
    const world: MapRegion = {
      latitude: 20,
      longitude: 0,
      latitudeDelta: 100,
      longitudeDelta: 160,
    };

    const items = getClustersForRegion(spreadIndex, spreadById, world);
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items.length).toBeLessThanOrEqual(MAX_VISIBLE_MARKERS);
  });

  it('caps visible markers for map performance', () => {
    const many: Pin[] = Array.from({ length: 300 }, (_, i) =>
      makePin({
        _id: `p-${i}`,
        latitude: (i % 20) * 8 - 80,
        longitude: Math.floor(i / 20) * 12 - 170,
      }),
    );
    const manyIndex = createPinClusterIndex(many);
    const manyById = new Map(many.map((pin) => [pin._id, pin]));
    const world: MapRegion = {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 120,
      longitudeDelta: 200,
    };

    const items = getClustersForRegion(manyIndex, manyById, world);
    expect(items.length).toBeLessThanOrEqual(MAX_VISIBLE_MARKERS);
    expect(items.some((item) => item.kind === 'cluster')).toBe(true);
  });

  it('clusters nearby pins at a low zoom', () => {
    const region: MapRegion = {
      latitude: 42.7,
      longitude: 23.3,
      latitudeDelta: 40,
      longitudeDelta: 40,
    };

    const items = getClustersForRegion(index, pinsById, region);
    const clusters = items.filter((item) => item.kind === 'cluster');
    const singles = items.filter((item) => item.kind === 'pin');

    expect(clusters.length).toBeGreaterThan(0);
    expect(
      clusters.some((item) => item.kind === 'cluster' && item.count >= 3),
    ).toBe(true);
    expect(singles.some((item) => item.id === 'far')).toBe(true);
  });

  it('expands a cluster into a tighter region', () => {
    const region: MapRegion = {
      latitude: 42.7,
      longitude: 23.3,
      latitudeDelta: 40,
      longitudeDelta: 40,
    };
    const items = getClustersForRegion(index, pinsById, region);
    const cluster = items.find((item) => item.kind === 'cluster');

    expect(cluster?.kind).toBe('cluster');
    if (cluster?.kind !== 'cluster') {
      return;
    }

    const next = getClusterExpansionRegion(
      index,
      cluster.clusterId,
      cluster.latitude,
      cluster.longitude,
      region,
    );

    expect(next.latitudeDelta).toBeLessThan(region.latitudeDelta);
    expect(next.longitudeDelta).toBeLessThan(region.longitudeDelta);
    // Should not jump more than ~2 zoom levels from the current view.
    expect(regionToZoom(next)).toBeLessThanOrEqual(regionToZoom(region) + 2);
  });

  it('focuses a pin without overshooting when already close', () => {
    const pin = makePin({ _id: 'p', latitude: 42.7, longitude: 23.3 });
    const close: MapRegion = {
      latitude: 42.7,
      longitude: 23.3,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    const focused = getPinFocusRegion(pin, close);
    expect(focused.latitude).toBe(pin.latitude);
    expect(focused.longitudeDelta).toBeLessThanOrEqual(0.012);
  });
});

describe('declutterClusterItems', () => {
  const region: MapRegion = {
    latitude: 42.7,
    longitude: 23.3,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  it('absorbs a nearby pin into a cluster and keeps the total count', () => {
    const pin = makePin({ _id: 'near', latitude: 42.7005, longitude: 23.3005 });
    const items: MapClusterItem[] = [
      {
        kind: 'cluster',
        id: 'cluster-1',
        latitude: 42.7,
        longitude: 23.3,
        count: 4,
        clusterId: 1,
      },
      {
        kind: 'pin',
        id: pin._id,
        latitude: pin.latitude,
        longitude: pin.longitude,
        pin,
      },
    ];

    const result = declutterClusterItems(items, region);
    const clusters = result.filter((item) => item.kind === 'cluster');
    const singles = result.filter((item) => item.kind === 'pin');

    expect(singles).toHaveLength(0);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toMatchObject({ kind: 'cluster', count: 5 });
  });

  it('merges overlapping clusters into one count', () => {
    const items: MapClusterItem[] = [
      {
        kind: 'cluster',
        id: 'cluster-1',
        latitude: 42.7,
        longitude: 23.3,
        count: 5,
        clusterId: 1,
      },
      {
        kind: 'cluster',
        id: 'cluster-2',
        latitude: 42.7004,
        longitude: 23.3004,
        count: 3,
        clusterId: 2,
      },
    ];

    const result = declutterClusterItems(items, region);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ kind: 'cluster', count: 8 });
  });
});

describe('regionToZoom', () => {
  it('maps wider deltas to lower zoom', () => {
    expect(
      regionToZoom({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 90,
        longitudeDelta: 90,
      }),
    ).toBeLessThan(
      regionToZoom({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      }),
    );
  });
});
