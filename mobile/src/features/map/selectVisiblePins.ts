import type { Pin } from '../../types/pin';
import type { MapRegion } from '../../types/map';
import type { FilterSelection } from '../../store/slices/filtersSlice';
import { isCoordinateInBounds, regionToBounds } from '../../utils/mapBounds';

export function selectVisiblePins(
  pins: Pin[],
  region: MapRegion | null,
  filters: FilterSelection,
): Pin[] {
  if (!region) {
    return [];
  }

  const bounds = regionToBounds(region);
  const typeSet = new Set(filters.types);
  const statusSet = new Set(filters.statuses);

  return pins.filter((pin) => {
    if (!isCoordinateInBounds(pin.latitude, pin.longitude, bounds)) {
      return false;
    }

    return pin.connectors.some(
      (connector) =>
        typeSet.has(connector.type) && statusSet.has(connector.status),
    );
  });
}
