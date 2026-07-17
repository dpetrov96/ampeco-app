import {
  formatClusterCount,
  getClusterBadgeUri,
} from '@/features/map/clusterBadge';

describe('clusterBadge', () => {
  it('formats counts', () => {
    expect(formatClusterCount(7)).toBe('7');
    expect(formatClusterCount(42)).toBe('42');
    expect(formatClusterCount(1500)).toBe('1.5k');
  });

  it('returns a cached uri from the native module', () => {
    const a = getClusterBadgeUri(17);
    const b = getClusterBadgeUri(17);
    expect(a).toBe(b);
    expect(a).toBe('data:image/png;base64,badge-17');
    expect(a).not.toBe(getClusterBadgeUri(18));
  });
});
