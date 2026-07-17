import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';

import type { ConnectorType, Pin } from '@/types/pin';
import type { PinStyle } from '@/types/settings';
import { PinGlyph, type PinPowerLabel } from '@/components/PinGlyph';

type Props = {
  pin: Pin;
  pinStyle: PinStyle;
  onPress: (pin: Pin) => void;
};

const AC_TYPES: ConnectorType[] = ['J1772', 'Type 2', 'Type 3'];
const DC_TYPES: ConnectorType[] = ['CCS 2'];

function powerLabel(pin: Pin): PinPowerLabel {
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

export function PinMarker({ pin, pinStyle, onPress }: Props) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const label = useMemo(() => powerLabel(pin), [pin]);

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), 400);
    return () => clearTimeout(timer);
  }, [pin._id, label, pinStyle]);

  const anchor =
    pinStyle === 'dot' ? { x: 0.5, y: 0.5 } : { x: 0.5, y: 1 };

  return (
    <Marker
      identifier={pin._id}
      coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
      onPress={(event) => {
        event.stopPropagation();
        onPress(pin);
      }}
      tracksViewChanges={tracksViewChanges}
      anchor={anchor}
    >
      <View>
        <PinGlyph style={pinStyle} powerLabel={label} />
      </View>
    </Marker>
  );
}
