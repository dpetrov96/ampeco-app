import { useMemo } from 'react';
import { Marker } from 'react-native-maps';

import type { PinPowerLabel } from '@/components/PinGlyph';
import { getPinIconUri } from '@/features/map/clusterBadge';
import { PIN_TIP_ANCHOR_Y } from '@/features/map/pinIconLayout';
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

const DOT_IMAGE = require('@/assets/pins/pin-dot-marker.png') as number;
/** Fallback if native getPinUri is unavailable (e.g. Jest). */
const PIN_FALLBACK = require('@/assets/pins/pin-marker.png') as number;

type MarkerIcon = number | { uri: string };

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

function pinIconSource(style: PinStyle, label: PinPowerLabel): MarkerIcon {
  if (style === 'dot') {
    return DOT_IMAGE;
  }
  const uri = getPinIconUri(label);
  if (uri) {
    return { uri };
  }
  return PIN_FALLBACK;
}

/**
 * Marker `image` — same custom pins on Apple Maps and Google Maps.
 * Pin style composites AC/DC via native Core Text.
 */
export function PinMarker({ pin, pinStyle, onPress }: Props) {
  const label = useMemo(() => powerLabel(pin), [pin]);
  const icon = useMemo(
    () => pinIconSource(pinStyle, label),
    [pinStyle, label],
  );
  const anchor =
    pinStyle === 'dot'
      ? { x: 0.5, y: 0.5 }
      : { x: 0.5, y: PIN_TIP_ANCHOR_Y };

  return (
    <Marker
      identifier={`${pin._id}:${pinStyle}:${label}`}
      coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
      image={icon}
      onPress={(event) => {
        event.stopPropagation();
        onPress(pin);
      }}
      anchor={anchor}
      tracksViewChanges={false}
      zIndex={1}
    />
  );
}
