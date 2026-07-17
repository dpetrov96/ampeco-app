import { useMemo } from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';

import { PinGlyph, type PinPowerLabel } from '@/components/PinGlyph';
import { useMarkerTracksViewChanges } from '@/hooks/useMarkerTracksViewChanges';
import { ConnectorType, type Pin } from '@/types/pin';
import type { PinStyle } from '@/types/settings';

type Props = {
  pin: Pin;
  pinStyle: PinStyle;
  onPress: (pin: Pin) => void;
};

const AC_TYPES: ConnectorType[] = [
  ConnectorType.J1772,
  ConnectorType.Type2,
  ConnectorType.Type3,
];
const DC_TYPES: ConnectorType[] = [ConnectorType.Ccs2];

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
  const label = useMemo(() => powerLabel(pin), [pin]);
  const tracksViewChanges = useMarkerTracksViewChanges(
    `${pin._id}:${label}:${pinStyle}`,
  );

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
