import { StyleSheet, Text, View } from 'react-native';

import type { Pin } from '@/types/pin';

type Props = {
  pin: Pin | null;
};

export function PinBottomSheet({ pin }: Props) {
  if (!pin) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{pin.title}</Text>
      <Text style={styles.meta}>
        Lat {pin.latitude.toFixed(6)} · Lng {pin.longitude.toFixed(6)}
      </Text>
      <Text style={styles.meta}>Connectors: {pin.connectors.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  meta: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
});
