import { StyleSheet, Text, View } from 'react-native';

import { useAppSelector } from '@/store/hooks';

export function OfflineBanner() {
  const isConnected = useAppSelector((state) => state.network.isConnected);

  if (isConnected) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Connection lost. Information may be outdated.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: '#b45309',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: {
    color: '#fffbeb',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
});
