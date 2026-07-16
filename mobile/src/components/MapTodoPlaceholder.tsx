import { StyleSheet, Text, View } from 'react-native';

export function MapTodoPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Map</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F6F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
});
