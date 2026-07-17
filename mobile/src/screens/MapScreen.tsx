import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps';

import { useGetPinsQuery } from '@/api';
import { ClusterMarker } from '@/components/ClusterMarker';
import { MapHeaderButtons } from '@/components/MapHeaderButtons';
import { MyLocationButton } from '@/components/MyLocationButton';
import { OfflineBanner } from '@/components/OfflineBanner';
import { PinBottomSheet } from '@/components/PinBottomSheet';
import { PinMarker } from '@/components/PinMarker';
import {
  createPinClusterIndex,
  getClusterExpansionRegion,
  getClustersForRegion,
  getPinFocusRegion,
} from '@/features/map/clusterPins';
import { filterPins } from '@/features/map/filterPins';
import type { RightDrawerParamList } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  commitApplyFilters,
  finishApplyFilters,
} from '@/store/slices/filtersSlice';
import { AMPECO_BLUE } from '@/theme/colors';
import type { MapRegion } from '@/types/map';
import type { Pin } from '@/types/pin';

// Pins in the interview dataset are scattered worldwide (not centered on Sofia).
const INITIAL_REGION: MapRegion = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 90,
  longitudeDelta: 90,
};

const REGION_DEBOUNCE_MS = 120;
const FILTER_COMMIT_DELAY_MS = 40;

// Google Maps Fabric markers are unreliable on iOS New Architecture
// (clusters stay invisible). Apple Maps renders custom markers correctly.
const MAP_PROVIDER = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

/**
 * Runs `commit` after drawer animations settle, then `finish` on the next
 * paint so the apply overlay covers the heavy cluster recompute.
 */
function scheduleAfterDrawerSettle(
  commit: () => void,
  finish: () => void,
): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let raf1 = 0;
  let raf2 = 0;

  const handle = InteractionManager.runAfterInteractions(() => {
    timeoutId = setTimeout(() => {
      commit();
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(finish);
      });
    }, FILTER_COMMIT_DELAY_MS);
  });

  return () => {
    handle.cancel();
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (raf1) {
      cancelAnimationFrame(raf1);
    }
    if (raf2) {
      cancelAnimationFrame(raf2);
    }
  };
}

export function MapScreen() {
  const navigation =
    useNavigation<DrawerNavigationProp<RightDrawerParamList, 'MapMain'>>();
  const dispatch = useAppDispatch();
  const { data: pins = [], isError, isFetching, error } = useGetPinsQuery();
  const appliedFilters = useAppSelector((state) => state.filters.applied);
  const isApplyingFilters = useAppSelector((state) => state.filters.isApplying);
  const pinStyle = useAppSelector((state) => state.settings.pinStyle);

  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<MapRegion>(INITIAL_REGION);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isApplyingFilters) {
      return;
    }

    navigation.dispatch(DrawerActions.closeDrawer());

    return scheduleAfterDrawerSettle(
      () => dispatch(commitApplyFilters()),
      () => dispatch(finishApplyFilters()),
    );
  }, [isApplyingFilters, dispatch, navigation]);

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

  const onMyLocation = (next: MapRegion) => {
    mapRef.current?.animateToRegion(next, 400);
    setRegion(next);
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
        showsUserLocation
        showsMyLocationButton={false}
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
      <MyLocationButton
        onLocate={onMyLocation}
        bottomOffset={selectedPin ? 280 : 0}
      />

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

      <PinBottomSheet
        pin={selectedPin}
        onClose={() => setSelectedPin(null)}
      />

      {isApplyingFilters ? (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={AMPECO_BLUE} />
            <Text style={styles.loadingText}>Updating map…</Text>
          </View>
        </View>
      ) : null}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(242, 242, 247, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 22,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
});
