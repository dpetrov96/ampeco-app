import {
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

  if (!pin) {
    return null;
  }

  const availableCount = pin.connectors.filter(
    (connector) => connector.status === ConnectorStatus.Available,
  ).length;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close pin details"
      />

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.grabber} />

        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {pin.title}
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
            <Text style={styles.coordValue}>{pin.latitude.toFixed(6)}</Text>
          </View>
          <View style={styles.coordDivider} />
          <View style={styles.coordBlock}>
            <Text style={styles.coordLabel}>Longitude</Text>
            <Text style={styles.coordValue}>{pin.longitude.toFixed(6)}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Connectors</Text>
          <Text style={styles.sectionMeta}>
            {availableCount}/{pin.connectors.length} available
          </Text>
        </View>

        <ScrollView
          style={styles.connectorList}
          contentContainerStyle={styles.connectorListContent}
          showsVerticalScrollIndicator={false}
        >
          {pin.connectors.map((connector, index) => (
            <ConnectorCard
              key={`${connector.type}-${connector.status}-${index}`}
              connector={connector}
            />
          ))}
        </ScrollView>
      </View>
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
    backgroundColor: 'rgba(0,0,0,0.25)',
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
