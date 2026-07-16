import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { StyleSheet, Text, View } from 'react-native';

import { useGetPinsQuery } from '../api';
import { MapHeaderButtons } from '../components/MapHeaderButtons';
import { MapTodoPlaceholder } from '../components/MapTodoPlaceholder';
import { OfflineBanner } from '../components/OfflineBanner';
import type { RightDrawerParamList } from '../navigation/types';

export function MapScreen() {
  const navigation =
    useNavigation<DrawerNavigationProp<RightDrawerParamList, 'MapMain'>>();
  const { data: pins = [], isSuccess, isError, error } = useGetPinsQuery();

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <MapTodoPlaceholder />
      <MapHeaderButtons navigation={navigation} />

      {isSuccess ? (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{pins.length} pins loaded</Text>
        </View>
      ) : null}

      {isError ? (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {error && 'status' in error
              ? `Failed to load pins (${String(error.status)})`
              : 'Failed to load pins'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(17,24,39,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 13,
  },
});
