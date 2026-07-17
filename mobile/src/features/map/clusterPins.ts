import Supercluster from 'supercluster';

import type { MapRegion } from '@/types/map';
import type { Pin } from '@/types/pin';
import { regionToBounds } from '@/utils/mapBounds';
import { regionToZoom, zoomToLongitudeDelta } from '@/features/map/regionZoom';

export type PinPointProperties = {
  pinId: string;
  cluster?: false;
};

export type ClusterProperties = {
  cluster: true;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: string | number;
};

export type PinFeature = GeoJSON.Feature<
  GeoJSON.Point,
  PinPointProperties | ClusterProperties
>;

export type MapClusterItem =
  | {
      kind: 'pin';
      id: string;
      latitude: number;
      longitude: number;
      pin: Pin;
    }
  | {
      kind: 'cluster';
      id: string;
      latitude: number;
      longitude: number;
      count: number;
      clusterId: number;
    };

/**
 * Supercluster radius (tile px, extent 512). ~70 balances regional clusters
 * when zoomed out vs not flooding the map with singles.
 */
const CLUSTER_OPTIONS: Supercluster.Options<
  PinPointProperties,
  ClusterProperties
> = {
  radius: 72,
  maxZoom: 16,
  minPoints: 2,
};

/** Hard cap — more native markers than this freezes react-native-maps. */
export const MAX_VISIBLE_MARKERS = 72;

/** Assumed map width for post-cluster declutter (screen px). */
const VIEWPORT_WIDTH_PX = 390;

/**
 * Minimum gap between marker centres. Below this, absorb/merge so pins and
 * clusters do not stack (same idea as Mapbox/Google map declutter).
 */
const MIN_MARKER_GAP_PX = 56;

export function createPinClusterIndex(
  pins: Pin[],
): Supercluster<PinPointProperties, ClusterProperties> {
  const index = new Supercluster<PinPointProperties, ClusterProperties>(
    CLUSTER_OPTIONS,
  );

  const features: Array<
    GeoJSON.Feature<GeoJSON.Point, PinPointProperties>
  > = pins.map((pin) => ({
    type: 'Feature',
    properties: { pinId: pin._id },
    geometry: {
      type: 'Point',
      coordinates: [pin.longitude, pin.latitude],
    },
  }));

  index.load(features);
  return index;
}

function approxPixelDistance(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
  region: MapRegion,
): number {
  const dx =
    ((b.longitude - a.longitude) / Math.max(region.longitudeDelta, 1e-9)) *
    VIEWPORT_WIDTH_PX;
  const viewportHeight =
    VIEWPORT_WIDTH_PX *
    (region.latitudeDelta / Math.max(region.longitudeDelta, 1e-9));
  const dy =
    ((b.latitude - a.latitude) / Math.max(region.latitudeDelta, 1e-9)) *
    viewportHeight;
  return Math.hypot(dx, dy);
}

/**
 * Absorb lone pins into nearby clusters and merge overlapping clusters so
 * markers do not visually stack. Cluster counts stay accurate for the UI.
 */
export function declutterClusterItems(
  items: MapClusterItem[],
  region: MapRegion,
): MapClusterItem[] {
  // At very wide zooms, Supercluster already returns coarse clusters; screen-px
  // merge would collapse them into a few mega-blobs again.
  if (region.longitudeDelta >= 25 || region.latitudeDelta >= 25) {
    return items;
  }

  type ClusterItem = Extract<MapClusterItem, { kind: 'cluster' }>;
  type PinItem = Extract<MapClusterItem, { kind: 'pin' }>;

  const clusters: ClusterItem[] = items
    .filter((item): item is ClusterItem => item.kind === 'cluster')
    .map((item) => ({ ...item }));
  const pins: PinItem[] = items
    .filter((item): item is PinItem => item.kind === 'pin')
    .map((item) => ({ ...item }));

  const remainingPins: PinItem[] = [];
  for (const pin of pins) {
    let bestIndex = -1;
    let bestDistance = Infinity;

    for (let i = 0; i < clusters.length; i += 1) {
      const distance = approxPixelDistance(pin, clusters[i], region);
      if (distance < MIN_MARKER_GAP_PX && distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }

    if (bestIndex < 0) {
      remainingPins.push(pin);
      continue;
    }

    const host = clusters[bestIndex];
    const nextCount = host.count + 1;
    clusters[bestIndex] = {
      ...host,
      count: nextCount,
      latitude: (host.latitude * host.count + pin.latitude) / nextCount,
      longitude: (host.longitude * host.count + pin.longitude) / nextCount,
    };
  }

  clusters.sort((a, b) => b.count - a.count);
  const mergedClusters: ClusterItem[] = [];
  for (const cluster of clusters) {
    let absorbed = false;
    for (let i = 0; i < mergedClusters.length; i += 1) {
      const host = mergedClusters[i];
      if (approxPixelDistance(cluster, host, region) >= MIN_MARKER_GAP_PX) {
        continue;
      }
      const nextCount = host.count + cluster.count;
      mergedClusters[i] = {
        ...host,
        count: nextCount,
        latitude:
          (host.latitude * host.count + cluster.latitude * cluster.count) /
          nextCount,
        longitude:
          (host.longitude * host.count + cluster.longitude * cluster.count) /
          nextCount,
      };
      absorbed = true;
      break;
    }
    if (!absorbed) {
      mergedClusters.push(cluster);
    }
  }

  return [...mergedClusters, ...remainingPins];
}

/**
 * Camera zoom for Supercluster. Stay close to the real zoom so we do not
 * spawn hundreds of markers; only a tiny bump when fully zoomed out so the
 * world is not a single mega-cluster.
 */
export function clusterQueryZoom(region: MapRegion): number {
  const zoom = regionToZoom(region);
  if (zoom <= 1) {
    return 2;
  }
  return zoom;
}

function mapClusterFeatures(
  features: PinFeature[],
  pinsById: Map<string, Pin>,
): MapClusterItem[] {
  return features.flatMap((feature): MapClusterItem[] => {
    const [longitude, latitude] = feature.geometry.coordinates;
    const props = feature.properties;

    if (props && 'cluster' in props && props.cluster) {
      return [
        {
          kind: 'cluster',
          id: `cluster-${props.cluster_id}`,
          latitude,
          longitude,
          count: props.point_count,
          clusterId: props.cluster_id,
        },
      ];
    }

    const pinId = (props as PinPointProperties).pinId;
    const pin = pinsById.get(pinId);
    if (!pin) {
      return [];
    }

    return [
      {
        kind: 'pin',
        id: pin._id,
        latitude,
        longitude,
        pin,
      },
    ];
  });
}

export function getClustersForRegion(
  index: Supercluster<PinPointProperties, ClusterProperties>,
  pinsById: Map<string, Pin>,
  region: MapRegion,
): MapClusterItem[] {
  const bounds = regionToBounds(region);
  const bbox: [number, number, number, number] = [
    bounds.west,
    bounds.south,
    bounds.east,
    bounds.north,
  ];

  let zoom = clusterQueryZoom(region);
  let items = mapClusterFeatures(index.getClusters(bbox, zoom), pinsById);

  while (items.length > MAX_VISIBLE_MARKERS && zoom > 0) {
    zoom -= 1;
    items = mapClusterFeatures(index.getClusters(bbox, zoom), pinsById);
  }

  return declutterClusterItems(items, region);
}

export function getClusterExpansionRegion(
  index: Supercluster<PinPointProperties, ClusterProperties>,
  clusterId: number,
  latitude: number,
  longitude: number,
  currentRegion?: MapRegion,
): MapRegion {
  const children = index.getChildren(clusterId);

  let minLng = longitude;
  let maxLng = longitude;
  let minLat = latitude;
  let maxLat = latitude;

  for (const child of children) {
    const [lng, lat] = child.geometry.coordinates;
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  const pad = 1.55;
  let longitudeDelta = Math.max((maxLng - minLng) * pad, 0.004);
  let latitudeDelta = Math.max((maxLat - minLat) * pad, 0.004);

  // Never zoom past the zoom where this cluster first splits (no +1 overshoot).
  const expansionZoom = index.getClusterExpansionZoom(clusterId);
  const expansionDelta = zoomToLongitudeDelta(expansionZoom);
  longitudeDelta = Math.max(longitudeDelta, expansionDelta);
  latitudeDelta = Math.max(latitudeDelta, expansionDelta);

  // One tap ≈ at most +2 zoom levels (same feel as Mapbox / Google Maps).
  if (currentRegion) {
    const currentZoom = regionToZoom(currentRegion);
    const targetZoom = regionToZoom({
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
    });
    const cappedZoom = Math.min(targetZoom, currentZoom + 2);
    if (cappedZoom < targetZoom) {
      const cappedDelta = zoomToLongitudeDelta(cappedZoom);
      longitudeDelta = cappedDelta;
      latitudeDelta = cappedDelta;
    }
  }

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta,
    longitudeDelta,
  };
}
