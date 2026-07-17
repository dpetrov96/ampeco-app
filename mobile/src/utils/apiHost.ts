import { Platform } from 'react-native';

const DEV_API_HOST_OVERRIDE: string | null = 'http://172.20.10.13:3000';

export function getApiBaseUrl(): string {
  if (DEV_API_HOST_OVERRIDE) {
    return DEV_API_HOST_OVERRIDE.replace(/\/$/, '');
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
}
