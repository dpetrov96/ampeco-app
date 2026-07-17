import type { ImageSourcePropType } from 'react-native';

import { ConnectorType } from '@/types/pin';

export const CONNECTOR_ICONS: Record<ConnectorType, ImageSourcePropType> = {
  [ConnectorType.J1772]: require('@/assets/connectors/j1772.png'),
  [ConnectorType.Type2]: require('@/assets/connectors/type-2.png'),
  [ConnectorType.Ccs2]: require('@/assets/connectors/ccs-2.png'),
  [ConnectorType.Type3]: require('@/assets/connectors/type-3.png'),
};
