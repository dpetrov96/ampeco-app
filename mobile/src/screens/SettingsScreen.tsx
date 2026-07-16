import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setPinStyle } from '../store/slices/settingsSlice';
import { PIN_STYLES, type PinStyle } from '../types/settings';

export function SettingsScreen() {
  const dispatch = useAppDispatch();
  const pinStyle = useAppSelector((state) => state.settings.pinStyle);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pin style</Text>
      <Text style={styles.subtitle}>Saved on this device.</Text>

      {PIN_STYLES.map((style: PinStyle) => {
        const selected = pinStyle === style;
        return (
          <Pressable
            key={style}
            style={[styles.option, selected && styles.optionSelected]}
            onPress={() => dispatch(setPinStyle(style))}
          >
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
              {style}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 12,
  },
  optionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  optionTextSelected: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
});
