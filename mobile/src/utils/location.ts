import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
});

const POSITION_TIMEOUT_MS = 10000;

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function ensureLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location permission',
      message: 'Allow access to your location to center the map near you.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

function readPosition(enableHighAccuracy: boolean): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy,
        timeout: POSITION_TIMEOUT_MS,
        maximumAge: 60000,
      },
    );
  });
}

export async function getCurrentPositionCoords(): Promise<{
  latitude: number;
  longitude: number;
}> {
  try {
    return await withTimeout(
      readPosition(true),
      POSITION_TIMEOUT_MS + 1500,
      'Location request timed out.',
    );
  } catch {
    return withTimeout(
      readPosition(false),
      POSITION_TIMEOUT_MS + 1500,
      'Location request timed out.',
    );
  }
}
