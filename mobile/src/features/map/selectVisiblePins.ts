import type { Pin } from '../../types/pin';
import type { MapRegion } from '../../types/map';
import type { FilterSelection } from '../../store/slices/filtersSlice';
import { isCoordinateInBounds, regionToBounds } from '../../utils/mapBounds';
import { filterPins } from './filterPins';

export function selectVisiblePins(
  pins: Pin[],
  region: MapRegion | null,
  filters: FilterSelection,
): Pin[] {
  if (!region) {
    return [];
  }

  const bounds = regionToBounds(region);

  return filterPins(pins, filters).filter((pin) =>
    isCoordinateInBounds(pin.latitude, pin.longitude, bounds),
  );
}
