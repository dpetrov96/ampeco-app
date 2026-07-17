import Geolocation from '@react-native-community/geolocation';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MapRegion } from '@/types/map';

const LOCATION_DELTA = 0.02;

type Props = {
  onLocate: (region: MapRegion) => void;
  /** Extra bottom offset when a bottom sheet is open. */
  bottomOffset?: number;
};

async function ensureLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return new Promise((resolve) => {
      Geolocation.requestAuthorization(
        () => resolve(true),
        () => resolve(false),
      );
    });
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location permission',
      message: 'Allow access to your location to center the map on you.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

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

      Geolocation.getCurrentPosition(
        (position) => {
          onLocate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LOCATION_DELTA,
            longitudeDelta: LOCATION_DELTA,
          });
          setIsLocating(false);
        },
        (error) => {
          Alert.alert(
            'Could not get location',
            error.message || 'Please try again.',
          );
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    } catch {
      Alert.alert('Could not get location', 'Please try again.');
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
