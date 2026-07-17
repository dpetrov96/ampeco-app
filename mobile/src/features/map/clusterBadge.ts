import { NativeModules } from 'react-native';

import type { PinPowerLabel } from '@/components/PinGlyph';

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

/** Runtime badge data URI via native ClusterBadgeModule (Core Graphics / Paint). */
export function getClusterBadgeUri(count: number): string {
  const key = Math.max(2, Math.floor(count));
  const cached = badgeCache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const uri =
    typeof native?.getBadgeUri === 'function' ? native.getBadgeUri(key) : '';
  badgeCache.set(key, uri);
  return uri;
}

/** Pin teardrop + AC/DC label under the logo circle. */
export function getPinIconUri(label: PinPowerLabel): string {
  const cached = pinCache.get(label);
  if (cached !== undefined) {
    return cached;
  }

  const uri =
    typeof native?.getPinUri === 'function' ? native.getPinUri(label) : '';
  pinCache.set(label, uri);
  return uri;
}
