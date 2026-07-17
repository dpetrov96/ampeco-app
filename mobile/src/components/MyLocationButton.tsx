import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MapRegion } from '@/types/map';
import {
  ensureLocationPermission,
  getCurrentPositionCoords,
} from '@/utils/location';

const LOCATION_DELTA = 0.02;

type Props = {
  onLocate: (region: MapRegion) => void;
  bottomOffset?: number;
};

export function MyLocationButton({ onLocate, bottomOffset = 0 }: Props) {
  const insets = useSafeAreaInsets();
  const [isLocating, setIsLocating] = useState(false);

  const onPress = async () => {
    if (isLocating) {
      return;
    }

    setIsLocating(true);

    try {
      const granted = await ensureLocationPermission();
      if (!granted) {
        Alert.alert(
          'Location unavailable',
          'Enable location permission in Settings to center the map on you.',
        );
        setIsLocating(false);
        return;
      }

      const coords = await getCurrentPositionCoords();
      onLocate({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: LOCATION_DELTA,
        longitudeDelta: LOCATION_DELTA,
      });
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Please try again.';
      Alert.alert('Could not get location', message);
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Center map on my location"
      onPress={onPress}
      disabled={isLocating}
      style={({ pressed }) => [
        styles.button,
        {
          bottom: Math.max(insets.bottom, 16) + 16 + bottomOffset,
        },
        pressed && styles.pressed,
      ]}
    >
      {isLocating ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Image
          source={require('@/assets/icons/my-location.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C2430',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 22,
    height: 22,
  },
});
