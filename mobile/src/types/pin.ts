export type ConnectorType = 'J1772' | 'Type 2' | 'CCS 2' | 'Type 3';

export type ConnectorStatus = 'available' | 'unavailable';

export type Connector = {
  type: ConnectorType;
  status: ConnectorStatus;
};

export type Pin = {
  _id: string;
  title: string;
  latitude: number;
  longitude: number;
  connectors: Connector[];
};

export const CONNECTOR_TYPES: ConnectorType[] = [
  'J1772',
  'Type 2',
  'CCS 2',
  'Type 3',
];

export const CONNECTOR_STATUSES: ConnectorStatus[] = [
  'available',
  'unavailable',
];
