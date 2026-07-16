import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

import type { ConnectorType, Pin } from '../types/pin';
import type { PinStyle } from '../types/settings';

type Props = {
  pin: Pin;
  pinStyle: PinStyle;
  onPress: (pin: Pin) => void;
};

const AC_TYPES: ConnectorType[] = ['J1772', 'Type 2', 'Type 3'];
const DC_TYPES: ConnectorType[] = ['CCS 2'];

type PowerLabel = 'AC' | 'DC' | 'AC/DC';

const PIN_W = 64;
const PIN_H = (370 / 300) * PIN_W;
/** SVG text y=264 → top of label block (font ~25 in 300-wide SVG). */
const LABEL_TOP = (248 / 370) * PIN_H;
const LABEL_FONT = (25 / 300) * PIN_W;

function powerLabel(pin: Pin): PowerLabel {
  let hasAc = false;
  let hasDc = false;

  for (const connector of pin.connectors) {
    if (AC_TYPES.includes(connector.type)) {
      hasAc = true;
    }
    if (DC_TYPES.includes(connector.type)) {
      hasDc = true;
    }
  }

  if (hasAc && hasDc) {
    return 'AC/DC';
  }
  if (hasDc) {
    return 'DC';
  }
  return 'AC';
}

export function PinMarker({ pin, pinStyle: _pinStyle, onPress }: Props) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const label = useMemo(() => powerLabel(pin), [pin]);

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), 400);
    return () => clearTimeout(timer);
  }, [pin._id, label]);

  return (
    <Marker
      identifier={pin._id}
      coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
      onPress={(event) => {
        event.stopPropagation();
        onPress(pin);
      }}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.wrap}>
        <Image
          source={require('../assets/pins/pin-body.png')}
          style={styles.body}
          resizeMode="contain"
        />
        <Text
          style={styles.power}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {label}
        </Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: PIN_W,
    height: PIN_H,
  },
  body: {
    width: PIN_W,
    height: PIN_H,
  },
  power: {
    position: 'absolute',
    top: LABEL_TOP,
    left: 8,
    right: 8,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: LABEL_FONT,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
