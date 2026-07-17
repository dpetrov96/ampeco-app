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

const CLUSTER_FALLBACK = require('@/assets/pins/pin-dot-marker.png') as number;

type MarkerIcon = number | { uri: string };

function clusterIcon(count: number): MarkerIcon {
  const uri = getClusterBadgeUri(count);
  if (uri) {
    return { uri };
  }
  return CLUSTER_FALLBACK;
}

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
      image={clusterIcon(count)}
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
