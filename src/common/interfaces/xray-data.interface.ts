export interface XrayDataPoint {
  time: number;
  coordinates: [number, number, number]; // [x, y, speed]
}

export interface XrayRawDataPoint {
  0: number; // time
  1: [number, number, number]; // coordinates
}

export interface XrayMessage {
  [deviceId: string]: {
    data: XrayRawDataPoint[];
    time: number;
  };
}

export interface ProcessedXrayData {
  deviceId: string;
  timestamp: number;
  dataLength: number;
  dataVolume: number;
  data: XrayDataPoint[];
}
