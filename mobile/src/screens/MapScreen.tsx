import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { HAS_GOOGLE_MAPS_KEY } from '@/config/maps.generated';
import {
  createPinClusterIndex,
  getClusterExpansionRegion,
  getClustersForRegion,
} from '@/features/map/clusterPins';
import { filterPins } from '@/features/map/filterPins';
import {
  FALLBACK_INITIAL_REGION,
  findInitialMapRegion,
} from '@/features/map/initialRegion';
import type { RightDrawerParamList } from '@/navigation/types';
import { useAppSelector } from '@/store/hooks';
import { AMPECO_BLUE } from '@/theme/colors';
import type { MapRegion } from '@/types/map';
import type { Pin } from '@/types/pin';
import {
  ensureLocationPermission,
  getCurrentPositionCoords,
} from '@/utils/location';

const REGION_DEBOUNCE_MS = 180;

/**
 * With Google key → Google Maps on both platforms.
 * Without key → Apple Maps on iOS (Android still requests Google; tiles need a key).
 *
 * Markers use the cross-platform `image` prop (same custom pin/cluster bitmaps
 * on Apple and Google). Nested View children stay unreliable on Google Fabric.
 */
const MAP_PROVIDER = HAS_GOOGLE_MAPS_KEY
  ? PROVIDER_GOOGLE
  : Platform.OS === 'ios'
    ? undefined
    : PROVIDER_GOOGLE;

export function MapScreen() {
  const navigation =
    useNavigation<DrawerNavigationProp<RightDrawerParamList, 'MapMain'>>();
  const { data: pins = [], isError, isFetching, error } = useGetPinsQuery();
  const appliedFilters = useAppSelector((state) => state.filters.applied);
  const isApplyingFilters = useAppSelector((state) => state.filters.isApplying);
  const pinStyle = useAppSelector((state) => state.settings.pinStyle);

  const mapRef = useRef<MapView>(null);
  const didApplyInitialFocus = useRef(false);
  const [region, setRegion] = useState<MapRegion>(FALLBACK_INITIAL_REGION);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredPins = useMemo(
    () => filterPins(pins, appliedFilters),
    [pins, appliedFilters],
  );

  // Once pins are loaded, center on nearest area with pins (prefer same country).
  useEffect(() => {
    if (didApplyInitialFocus.current || filteredPins.length === 0) {
      return;
    }

    let cancelled = false;

    const focusNearUser = async () => {
      try {
        const granted = await ensureLocationPermission();
        if (cancelled) {
          return;
        }

        if (!granted) {
          didApplyInitialFocus.current = true;
          return;
        }

        const coords = await getCurrentPositionCoords();
        if (cancelled) {
          return;
        }

        const next = findInitialMapRegion(
          coords.latitude,
          coords.longitude,
          filteredPins,
        );
        didApplyInitialFocus.current = true;
        mapRef.current?.animateToRegion(next, 450);
        setRegion(next);
      } catch {
        if (!cancelled) {
          didApplyInitialFocus.current = true;
        }
      }
    };

    void focusNearUser();

    return () => {
      cancelled = true;
    };
  }, [filteredPins]);

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
    const mapped: MapRegion = {
      latitude: next.latitude,
      longitude: next.longitude,
      latitudeDelta: next.latitudeDelta,
      longitudeDelta: next.longitudeDelta,
    };

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setRegion(mapped);
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
    // Pan only — keep current zoom so neighbouring pins stay in the viewport.
    // Nudge center south so the pin sits above the bottom sheet.
    const next: MapRegion = {
      latitude: pin.latitude - region.latitudeDelta * 0.2,
      longitude: pin.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    };
    mapRef.current?.animateToRegion(next, 300);
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
        initialRegion={FALLBACK_INITIAL_REGION}
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
              key={`${item.id}:${pinStyle}`}
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
