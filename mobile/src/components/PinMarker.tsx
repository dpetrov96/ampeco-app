import { Marker } from 'react-native-maps';

import type { Pin } from '../types/pin';
import type { PinStyle } from '../types/settings';

type Props = {
  pin: Pin;
  pinStyle: PinStyle;
  onPress: (pin: Pin) => void;
};

export function PinMarker({ pin, pinStyle, onPress }: Props) {
  const pinColor =
    pinStyle === 'dot' ? '#10b981' : pinStyle === 'pin' ? '#ef4444' : '#2563eb';

  return (
    <Marker
      coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
      title={pin.title}
      pinColor={pinColor}
      onPress={() => onPress(pin)}
    />
  );
}
