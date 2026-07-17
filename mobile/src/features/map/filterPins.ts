import type { FilterSelection } from '@/store/slices/filtersSlice';
import type { Pin } from '@/types/pin';

export function filterPins(pins: Pin[], filters: FilterSelection): Pin[] {
  const typeSet = new Set(filters.types);
  const statusSet = new Set(filters.statuses);

  return pins.filter((pin) =>
    pin.connectors.some(
      (connector) =>
        typeSet.has(connector.type) && statusSet.has(connector.status),
    ),
  );
}
