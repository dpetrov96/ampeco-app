import { NativeModules } from 'react-native';

import type { PinPowerLabel } from '@/components/PinGlyph';
import { renderClusterBadgeDataUriFallback } from '@/features/map/clusterBadgeFallback';

type ClusterBadgeNative = {
  getBadgeUri: (count: number) => string;
  getPinUri?: (label: string) => string;
};

const native = NativeModules.ClusterBadgeModule as ClusterBadgeNative | undefined;

const badgeCache = new Map<number, string>();
const pinCache = new Map<string, string>();

export function formatClusterCount(count: number): string {
  if (count >= 1000) {
    return `${Math.round(count / 100) / 10}k`;
  }
  return String(count);
}

/**
 * Runtime badge → data URI for GMSMarker.icon.
 * iOS/Android: Core Text / Paint via ClusterBadgeModule.
 * Fallback: JS bitmap (tests).
 */
export function getClusterBadgeUri(count: number): string {
  const key = Math.max(2, Math.floor(count));
  const cached = badgeCache.get(key);
  if (cached) {
    return cached;
  }

  let uri = '';
  if (typeof native?.getBadgeUri === 'function') {
    try {
      uri = native.getBadgeUri(key);
    } catch {
      uri = '';
    }
  }
  if (!uri) {
    uri = renderClusterBadgeDataUriFallback(key);
  }

  badgeCache.set(key, uri);
  return uri;
}

/** Pin teardrop + AC/DC label under the logo circle. */
export function getPinIconUri(label: PinPowerLabel): string {
  const cached = pinCache.get(label);
  if (cached) {
    return cached;
  }

  let uri = '';
  if (typeof native?.getPinUri === 'function') {
    try {
      uri = native.getPinUri(label);
    } catch {
      uri = '';
    }
  }

  pinCache.set(label, uri);
  return uri;
}
