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

  it('returns a cached png data uri with the exact count key', () => {
    const a = getClusterBadgeUri(17);
    const b = getClusterBadgeUri(17);
    expect(a).toBe(b);
    expect(a.startsWith('data:image/png;base64,')).toBe(true);
    expect(a).not.toBe(getClusterBadgeUri(18));
  });
});
