import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CONNECTOR_ICONS } from '@/constants/connectorIcons';
import { AMPECO_BLUE } from '@/theme/colors';
import { ConnectorStatus, type Connector, type Pin } from '@/types/pin';

type Props = {
  pin: Pin | null;
  onClose: () => void;
};

const STATUS_COLOR = {
  [ConnectorStatus.Available]: '#16A34A',
  [ConnectorStatus.Unavailable]: '#DC2626',
} as const;

const SHEET_HIDDEN_Y = 460;

function ConnectorCard({ connector }: { connector: Connector }) {
  return (
    <View style={styles.connectorCard}>
      <Image
        source={CONNECTOR_ICONS[connector.type]}
        style={styles.connectorIcon}
        resizeMode="contain"
      />
      <View style={styles.connectorText}>
        <Text style={styles.connectorType}>{connector.type}</Text>
        <Text
          style={[
            styles.connectorStatus,
            { color: STATUS_COLOR[connector.status] },
          ]}
        >
          {connector.status === ConnectorStatus.Available
            ? 'Available'
            : 'Unavailable'}
        </Text>
      </View>
    </View>
  );
}

export function PinBottomSheet({ pin, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const displayedPinRef = useRef<Pin | null>(pin);
  const wasOpenRef = useRef(Boolean(pin));
  const [mounted, setMounted] = useState(Boolean(pin));
  const translateY = useRef(new Animated.Value(SHEET_HIDDEN_Y)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pin) {
      displayedPinRef.current = pin;
      if (wasOpenRef.current) {
        return;
      }
      wasOpenRef.current = true;
      setMounted(true);
      translateY.setValue(SHEET_HIDDEN_Y);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 220,
          mass: 0.9,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!wasOpenRef.current) {
      return;
    }

    wasOpenRef.current = false;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HIDDEN_Y,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  }, [pin, translateY, backdropOpacity]);

  const contentPin = pin ?? displayedPinRef.current;
  if (!mounted || !contentPin) {
    return null;
  }

  const availableCount = contentPin.connectors.filter(
    (connector) => connector.status === ConnectorStatus.Available,
  ).length;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents="auto"
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close pin details"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.grabber} />

        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {contentPin.title}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.coordsCard}>
          <View style={styles.coordBlock}>
            <Text style={styles.coordLabel}>Latitude</Text>
            <Text style={styles.coordValue}>
              {contentPin.latitude.toFixed(6)}
            </Text>
          </View>
          <View style={styles.coordDivider} />
          <View style={styles.coordBlock}>
            <Text style={styles.coordLabel}>Longitude</Text>
            <Text style={styles.coordValue}>
              {contentPin.longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Connectors</Text>
          <Text style={styles.sectionMeta}>
            {availableCount}/{contentPin.connectors.length} available
          </Text>
        </View>

        <ScrollView
          style={styles.connectorList}
          contentContainerStyle={styles.connectorListContent}
          showsVerticalScrollIndicator={false}
        >
          {contentPin.connectors.map((connector, index) => (
            <ConnectorCard
              key={`${connector.type}-${connector.status}-${index}`}
              connector={connector}
            />
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    zIndex: 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '58%',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    lineHeight: 30,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  coordsCard: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  coordBlock: {
    flex: 1,
  },
  coordDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 14,
  },
  coordLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  coordValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    fontVariant: ['tabular-nums'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sectionMeta: {
    fontSize: 13,
    fontWeight: '500',
    color: AMPECO_BLUE,
  },
  connectorList: {
    flexGrow: 0,
  },
  connectorListContent: {
    gap: 10,
    paddingBottom: 4,
  },
  connectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  connectorIcon: {
    width: 40,
    height: 40,
    marginRight: 14,
    tintColor: '#111111',
  },
  connectorText: {
    flex: 1,
  },
  connectorType: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 2,
  },
  connectorStatus: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
