import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { useMarkerTracksViewChanges } from '@/hooks/useMarkerTracksViewChanges';
import { AMPECO_BLUE } from '@/theme/colors';

type Props = {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  onPress: () => void;
};

function clusterSize(count: number): number {
  if (count >= 1000) {
    return 40;
  }
  if (count >= 100) {
    return 36;
  }
  if (count >= 10) {
    return 34;
  }
  return 32;
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return `${Math.round(count / 100) / 10}k`;
  }
  return String(count);
}

export function ClusterMarker({
  id,
  latitude,
  longitude,
  count,
  onPress,
}: Props) {
  const size = clusterSize(count);
  const halo = size + 8;
  const label = formatCount(count);
  const tracksViewChanges = useMarkerTracksViewChanges(
    `${id}:${count}:${latitude}:${longitude}`,
  );

  return (
    <Marker
      identifier={id}
      coordinate={{ latitude, longitude }}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View
        style={[styles.halo, { width: halo, height: halo, borderRadius: halo / 2 }]}
      >
        <View
          style={[
            styles.core,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <Text
            style={styles.count}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
          >
            {label}
          </Text>
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  halo: {
    backgroundColor: 'rgba(14, 96, 195, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    backgroundColor: AMPECO_BLUE,
    borderWidth: 2.5,
    borderColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  count: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
});
