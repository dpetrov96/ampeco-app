import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AMPECO_BLUE } from '@/theme/colors';
import { PinGlyph } from '@/components/PinGlyph';
import type { LeftDrawerParamList } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPinStyle } from '@/store/slices/settingsSlice';
import { PIN_STYLES, type PinStyle } from '@/types/settings';

const STYLE_COPY: Record<PinStyle, { title: string; subtitle: string }> = {
  pin: {
    title: 'Pin',
    subtitle: 'Full marker with AC/DC label',
  },
  dot: {
    title: 'Dot',
    subtitle: 'Compact branded circle',
  },
};

export function SettingsScreen() {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<DrawerNavigationProp<LeftDrawerParamList, 'Settings'>>();
  const pinStyle = useAppSelector((state) => state.settings.pinStyle);

  const onSelectStyle = (style: PinStyle) => {
    dispatch(setPinStyle(style));
    navigation.navigate('Map');
    navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Pin style</Text>
      <Text style={styles.caption}>Saved on this device.</Text>

      <View style={styles.card}>
        {PIN_STYLES.map((style: PinStyle, index) => {
          const selected = pinStyle === style;
          const copy = STYLE_COPY[style];
          const isLast = index === PIN_STYLES.length - 1;

          return (
            <Pressable
              key={style}
              onPress={() => onSelectStyle(style)}
              style={({ pressed }) => [
                styles.row,
                !isLast && styles.rowBorder,
                pressed && styles.pressed,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View style={styles.preview}>
                <PinGlyph style={style} powerLabel="AC" />
              </View>
              <View style={styles.textBlock}>
                <Text style={styles.label}>{copy.title}</Text>
                <Text style={styles.sublabel}>{copy.subtitle}</Text>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#F2F2F7',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 6,
  },
  caption: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 88,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  pressed: {
    backgroundColor: '#F7F7F8',
  },
  preview: {
    width: 64,
    height: 72,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  sublabel: {
    marginTop: 2,
    fontSize: 13,
    color: '#8E8E93',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: AMPECO_BLUE,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: AMPECO_BLUE,
  },
});
