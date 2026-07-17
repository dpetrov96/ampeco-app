import { Image, StyleSheet, Text, View } from 'react-native';

import {
  PIN_ICON_TOTAL_HEIGHT,
  PIN_LABEL_BOX_HEIGHT,
  PIN_LABEL_GAP,
  PIN_MAP_HEIGHT,
  PIN_MAP_WIDTH,
} from '@/features/map/pinIconLayout';
import type { PinStyle } from '@/types/settings';
import { AMPECO_BLUE } from '@/theme/colors';

export type PinPowerLabel = 'AC' | 'DC' | 'AC/DC';

type Props = {
  style: PinStyle;
  powerLabel?: PinPowerLabel;
};

const GREEN_RING = '#8fbc7a';

export function PinGlyph({ style, powerLabel = 'AC' }: Props) {
  if (style === 'dot') {
    return (
      <View style={styles.dotWrap}>
        <View style={styles.dotHalo}>
          <View style={styles.dotCore}>
            <Image
              source={require('@root-assets/ampeco-mark-white.png')}
              style={styles.dotLogo}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.pinWrap}>
      <Image
        source={require('@/assets/pins/pin-body.png')}
        style={styles.pinBody}
        resizeMode="contain"
      />
      <View style={styles.captionSoft}>
        <View style={styles.captionBox}>
          <Text style={styles.captionText} numberOfLines={1}>
            {powerLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pinWrap: {
    width: PIN_MAP_WIDTH,
    height: PIN_ICON_TOTAL_HEIGHT,
    alignItems: 'center',
  },
  pinBody: {
    width: PIN_MAP_WIDTH,
    height: PIN_MAP_HEIGHT,
  },
  captionSoft: {
    marginTop: PIN_LABEL_GAP,
    paddingHorizontal: 2,
    paddingVertical: 1.5,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  captionBox: {
    minWidth: 22,
    height: PIN_LABEL_BOX_HEIGHT,
    paddingHorizontal: 5,
    borderRadius: 4,
    backgroundColor: 'rgba(17,17,17,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  dotWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotHalo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GREEN_RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AMPECO_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLogo: {
    width: 14,
    height: 14,
  },
});
