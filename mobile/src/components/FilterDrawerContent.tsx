import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import {
  DrawerContentScrollView,
  useDrawerStatus,
} from '@react-navigation/drawer';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AMPECO_BLUE } from './AmpecoLoader';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  beginApplyFilters,
  setDraftFilters,
} from '../store/slices/filtersSlice';
import {
  CONNECTOR_STATUSES,
  CONNECTOR_TYPES,
  type ConnectorStatus,
  type ConnectorType,
} from '../types/pin';

const CONNECTOR_ICONS: Record<ConnectorType, ImageSourcePropType> = {
  J1772: require('../assets/connectors/j1772.png'),
  'Type 2': require('../assets/connectors/type-2.png'),
  'CCS 2': require('../assets/connectors/ccs-2.png'),
  'Type 3': require('../assets/connectors/type-3.png'),
};

function StatusCheckboxRow({
  label,
  checked,
  onToggle,
  isLast,
  disabled,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  isLast: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      style={({ pressed }) => [
        styles.listRow,
        !isLast && styles.listRowBorder,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <Text style={styles.listLabel}>{label}</Text>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

function ConnectorTypeTile({
  type,
  selected,
  onToggle,
  disabled,
}: {
  type: ConnectorType;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      style={({ pressed }) => [
        styles.typeTile,
        selected && styles.typeTileSelected,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={type}
    >
      <Image
        source={CONNECTOR_ICONS[type]}
        style={[styles.typeIcon, selected && styles.typeIconSelected]}
        resizeMode="contain"
      />
      <Text style={[styles.typeLabel, selected && styles.typeLabelSelected]}>
        {type}
      </Text>
    </Pressable>
  );
}

export function FilterDrawerContent(props: DrawerContentComponentProps) {
  const dispatch = useAppDispatch();
  const applied = useAppSelector((state) => state.filters.applied);
  const isApplying = useAppSelector((state) => state.filters.isApplying);
  const drawerStatus = useDrawerStatus();

  const [types, setTypes] = useState<ConnectorType[]>(() => [...applied.types]);
  const [statuses, setStatuses] = useState<ConnectorStatus[]>(() => [
    ...applied.statuses,
  ]);

  useEffect(() => {
    if (drawerStatus === 'open') {
      setTypes([...applied.types]);
      setStatuses([...applied.statuses]);
    }
  }, [drawerStatus, applied]);

  const toggleType = (type: ConnectorType) => {
    setTypes((current) => {
      if (current.includes(type)) {
        if (current.length === 1) {
          return current;
        }
        return current.filter((item) => item !== type);
      }
      return [...current, type];
    });
  };

  const toggleStatus = (status: ConnectorStatus) => {
    setStatuses((current) => {
      if (current.includes(status)) {
        if (current.length === 1) {
          return current;
        }
        return current.filter((item) => item !== status);
      }
      return [...current, status];
    });
  };

  const onApply = () => {
    if (isApplying) {
      return;
    }
    dispatch(setDraftFilters({ types, statuses }));
    dispatch(beginApplyFilters());
  };

  return (
    <View style={styles.root}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.container}
        style={styles.scroll}
      >
        <Text style={styles.heading}>Filters</Text>

        <Text style={styles.sectionTitle}>Connector type</Text>
        <View style={styles.typeCard}>
          <View style={styles.typeGrid}>
            {CONNECTOR_TYPES.map((type: ConnectorType) => (
              <ConnectorTypeTile
                key={type}
                type={type}
                selected={types.includes(type)}
                onToggle={() => toggleType(type)}
                disabled={isApplying}
              />
            ))}
          </View>
        </View>

        <Text style={[styles.sectionTitle, styles.sectionGap]}>
          Connector status
        </Text>
        <View style={styles.card}>
          {CONNECTOR_STATUSES.map((status: ConnectorStatus, index) => (
            <StatusCheckboxRow
              key={status}
              label={status === 'available' ? 'Available' : 'Unavailable'}
              checked={statuses.includes(status)}
              onToggle={() => toggleStatus(status)}
              isLast={index === CONNECTOR_STATUSES.length - 1}
              disabled={isApplying}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.applyButton,
            (pressed || isApplying) && styles.applyPressed,
          ]}
          onPress={onApply}
          disabled={isApplying}
        >
          {isApplying ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.applyText}>Apply</Text>
          )}
        </Pressable>
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scroll: {
    backgroundColor: '#F2F2F7',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionGap: {
    marginTop: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  typeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 10,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  typeTile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  typeTileSelected: {
    backgroundColor: '#F0F6FC',
    borderColor: AMPECO_BLUE,
  },
  typeIcon: {
    width: 40,
    height: 40,
    marginBottom: 6,
    tintColor: '#111111',
  },
  typeIconSelected: {
    tintColor: AMPECO_BLUE,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: AMPECO_BLUE,
    fontWeight: '600',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  listRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  listLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: AMPECO_BLUE,
    borderColor: AMPECO_BLUE,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  applyButton: {
    marginTop: 28,
    backgroundColor: '#111111',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  applyPressed: {
    opacity: 0.85,
  },
  applyText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    backgroundColor: '#F7F7F8',
  },
});
