import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps';

import { useGetPinsQuery } from '../api';
import { ClusterMarker } from '../components/ClusterMarker';
import { MapHeaderButtons } from '../components/MapHeaderButtons';
import { OfflineBanner } from '../components/OfflineBanner';
import { PinBottomSheet } from '../components/PinBottomSheet';
import { PinMarker } from '../components/PinMarker';
import {
  createPinClusterIndex,
  getClusterExpansionRegion,
  getClustersForRegion,
  getPinFocusRegion,
} from '../features/map/clusterPins';
import { filterPins } from '../features/map/filterPins';
import type { RightDrawerParamList } from '../navigation/types';
import { useAppSelector } from '../store/hooks';
import type { MapRegion } from '../types/map';
import type { Pin } from '../types/pin';

// Pins in the interview dataset are scattered worldwide (not centered on Sofia).
const INITIAL_REGION: MapRegion = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 90,
  longitudeDelta: 90,
};

const REGION_DEBOUNCE_MS = 120;

// Google Maps Fabric markers are unreliable on iOS New Architecture
// (clusters stay invisible). Apple Maps renders custom markers correctly.
const MAP_PROVIDER = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

export function MapScreen() {
  const navigation =
    useNavigation<DrawerNavigationProp<RightDrawerParamList, 'MapMain'>>();
  const { data: pins = [], isError, isFetching, error } = useGetPinsQuery();
  const appliedFilters = useAppSelector((state) => state.filters.applied);
  const pinStyle = useAppSelector((state) => state.settings.pinStyle);

  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<MapRegion>(INITIAL_REGION);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredPins = useMemo(
    () => filterPins(pins, appliedFilters),
    [pins, appliedFilters],
  );

  const pinsById = useMemo(() => {
    const map = new Map<string, Pin>();
    for (const pin of filteredPins) {
      map.set(pin._id, pin);
    }
    return map;
  }, [filteredPins]);

  const clusterIndex = useMemo(
    () => createPinClusterIndex(filteredPins),
    [filteredPins],
  );

  const clusterItems = useMemo(
    () => getClustersForRegion(clusterIndex, pinsById, region),
    [clusterIndex, pinsById, region],
  );

  const emptyViewport =
    filteredPins.length > 0 && clusterItems.length === 0 && !isFetching;

  const onRegionChangeComplete = (next: Region) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setRegion({
        latitude: next.latitude,
        longitude: next.longitude,
        latitudeDelta: next.latitudeDelta,
        longitudeDelta: next.longitudeDelta,
      });
    }, REGION_DEBOUNCE_MS);
  };

  const onClusterPress = (
    clusterId: number,
    latitude: number,
    longitude: number,
  ) => {
    const next = getClusterExpansionRegion(
      clusterIndex,
      clusterId,
      latitude,
      longitude,
      region,
    );
    mapRef.current?.animateToRegion(next, 320);
    setRegion(next);
  };

  const onPinPress = (pin: Pin) => {
    const next = getPinFocusRegion(pin, region);
    mapRef.current?.animateToRegion(next, 280);
    setRegion(next);
    setSelectedPin(pin);
  };

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={MAP_PROVIDER}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={onRegionChangeComplete}
        zoomEnabled
        scrollEnabled
        pitchEnabled={false}
        rotateEnabled={false}
        minZoomLevel={1}
        maxZoomLevel={20}
      >
        {clusterItems.map((item) =>
          item.kind === 'cluster' ? (
            <ClusterMarker
              key={item.id}
              id={item.id}
              latitude={item.latitude}
              longitude={item.longitude}
              count={item.count}
              onPress={() =>
                onClusterPress(item.clusterId, item.latitude, item.longitude)
              }
            />
          ) : (
            <PinMarker
              key={item.id}
              pin={item.pin}
              pinStyle={pinStyle}
              onPress={onPinPress}
            />
          ),
        )}
      </MapView>

      <MapHeaderButtons navigation={navigation} />

      {emptyViewport ? (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            No pins in this area - zoom out or pan (data is worldwide)
          </Text>
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

      <PinBottomSheet pin={selectedPin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 88,
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
