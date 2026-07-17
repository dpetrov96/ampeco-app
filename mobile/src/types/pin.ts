export enum ConnectorType {
  J1772 = 'J1772',
  Type2 = 'Type 2',
  Ccs2 = 'CCS 2',
  Type3 = 'Type 3',
}

export enum ConnectorStatus {
  Available = 'available',
  Unavailable = 'unavailable',
}

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

export const CONNECTOR_TYPES: ConnectorType[] = Object.values(ConnectorType);

export const CONNECTOR_STATUSES: ConnectorStatus[] =
  Object.values(ConnectorStatus);
