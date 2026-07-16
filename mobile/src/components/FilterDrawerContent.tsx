import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  applyFilters,
  toggleDraftStatus,
  toggleDraftType,
} from '../store/slices/filtersSlice';
import {
  CONNECTOR_STATUSES,
  CONNECTOR_TYPES,
  type ConnectorStatus,
  type ConnectorType,
} from '../types/pin';

function CheckboxRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.row}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

export function FilterDrawerContent(props: DrawerContentComponentProps) {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((state) => state.filters.draft);

  const onApply = () => {
    dispatch(applyFilters());
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Connector type</Text>
      {CONNECTOR_TYPES.map((type: ConnectorType) => (
        <CheckboxRow
          key={type}
          label={type}
          checked={draft.types.includes(type)}
          onToggle={() => dispatch(toggleDraftType(type))}
        />
      ))}

      <Text style={[styles.heading, styles.sectionGap]}>Connector status</Text>
      {CONNECTOR_STATUSES.map((status: ConnectorStatus) => (
        <CheckboxRow
          key={status}
          label={status}
          checked={draft.statuses.includes(status)}
          onToggle={() => dispatch(toggleDraftStatus(status))}
        />
      ))}

      <Pressable style={styles.applyButton} onPress={onApply}>
        <Text style={styles.applyText}>Apply</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  sectionGap: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#9ca3af',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    fontSize: 15,
    color: '#1f2937',
  },
  applyButton: {
    marginTop: 28,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
