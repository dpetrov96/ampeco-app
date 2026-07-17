import { Marker } from 'react-native-maps';

import {
  formatClusterCount,
  getClusterBadgeUri,
} from '@/features/map/clusterBadge';

type Props = {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  onPress: () => void;
};

/**
 * Exact count via runtime-rasterized badge → Marker `image`.
 * Works on Apple Maps and Google Maps (avoid View/Text children on Fabric Google).
 */
export function ClusterMarker({
  id,
  latitude,
  longitude,
  count,
  onPress,
}: Props) {
  return (
    <Marker
      identifier={id}
      coordinate={{ latitude, longitude }}
      image={{ uri: getClusterBadgeUri(count) }}
      accessibilityLabel={`${formatClusterCount(count)} chargers`}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
      zIndex={1000 + Math.min(count, 999)}
    />
  );
}
