import { Image, StyleSheet, Text, View } from 'react-native';

import type { PinStyle } from '@/types/settings';
import { AMPECO_BLUE } from '@/components/AmpecoLoader';

export type PinPowerLabel = 'AC' | 'DC' | 'AC/DC';

type Props = {
  style: PinStyle;
  powerLabel?: PinPowerLabel;
};

const PIN_W = 56;
const PIN_H = (370 / 300) * PIN_W;
const LABEL_TOP = (248 / 370) * PIN_H;
const LABEL_FONT = (25 / 300) * PIN_W;

const GREEN_RING = '#8fbc7a';

/**
 * - pin: full teardrop + power label
 * - dot: compact branded circle
 */
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
      <Text
        style={styles.power}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {powerLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pinWrap: {
    width: PIN_W,
    height: PIN_H,
  },
  pinBody: {
    width: PIN_W,
    height: PIN_H,
  },
  power: {
    position: 'absolute',
    top: LABEL_TOP,
    left: 6,
    right: 6,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: LABEL_FONT,
    fontWeight: '700',
    letterSpacing: 0.5,
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
