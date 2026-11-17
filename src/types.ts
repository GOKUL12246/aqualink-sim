export type CommMode = 'OPTICAL' | 'ACOUSTIC' | 'HYBRID' | 'STANDBY' | 'FAILED';

export interface SensorData {
  temperature: number; // °C
  pressure: number;    // bar
  turbidity: number;   // NTU
  depth: number;       // metres
  timestamp: number;
}

export interface CommState {
  currentMode: CommMode;
  opticalQuality: number;      // 0 - 100%
  opticalSignalDbm: number;    // e.g. -14 to -55 dBm
  acousticQuality: number;     // 0 - 100%
  acousticSignalDbm: number;   // e.g. -18 to -45 dBm
  autoSwitching: boolean;
  opticalWavelengthNm: number; // 450 nm
  acousticFrequencyKhz: number;// 24 kHz
  packetSuccessRate: number;   // %
  packetsTransmitted: number;
  packetsDropped: number;
  lastSwitchTime: string;
}

export interface CommSwitchEvent {
  id: string;
  timestamp: string;
  fromMode: CommMode;
  toMode: CommMode;
  reason: string;
  opticalQuality: number;
  turbidity: number;
  biofouling: number;
}

export interface BiofoulingState {
  percentage: number;          // 0 - 100%
  windowCleanliness: number;   // 100 - biofouling
  riskScore: number;           // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  predictedMaintenanceDays: number;
  autoCleanEnabled: boolean;
  autoCleanThreshold: number;  // default 65%
  growthRate: number;          // 1x, 2x, etc.
  growthPaused: boolean;
  isCleaning: boolean;
  cleaningProgress: number;    // 0 - 100%
  cleaningCount: number;
}

export interface CleaningLog {
  id: string;
  timestamp: string;
  type: 'AUTOMATIC' | 'MANUAL';
  initialFouling: number;
  finalFouling: number;
  durationSec: number;
  status: 'SUCCESS' | 'IN_PROGRESS' | 'FAILED';
}

export interface EnergyState {
  waterCurrentSpeed: number;   // m/s (0.0 to 3.5)
  turbineRPM: number;          // RPM (0 to 650)
  powerGenerated: number;      // Watts (0 to 45W)
  powerConsumed: number;       // Watts (3 to 18W)
  netPower: number;            // Watts
  harvestedWh: number;         // Watt-hours cumulative
  batteryPercent: number;      // 0 - 100%
  batteryVoltage: number;      // Volts (10.2 - 12.6V)
  batteryStatus: 'CHARGING' | 'DISCHARGING' | 'FLOAT' | 'CRITICAL';
  estimatedRuntimeHours: number;
  turbineActive: boolean;
}

export interface SurfaceBuoyState {
  status: 'ONLINE' | 'DISCONNECTED' | 'DEGRADED';
  satelliteUplink: boolean;
  cellularUplink: boolean;
  satelliteSignalDb: number;
  cellularSignalDb: number;
  tetherStatus: 'INTACT' | 'DISCONNECTED';
  latitude: number;
  longitude: number;
  lastSyncTime: string;
  waveHeightMeters: number;
}

export interface FaultStates {
  highTurbidity: boolean;
  opticalFail: boolean;
  acousticFail: boolean;
  highBiofouling: boolean;
  lowBattery: boolean;
  turbineStopped: boolean;
  sensorFailure: boolean;
  buoyDisconnected: boolean;
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  title: string;
  message: string;
  acknowledged: boolean;
}

export type CameraPreset = 
  | 'overview' 
  | 'node' 
  | 'window' 
  | 'turbine' 
  | 'internal' 
  | 'buoy' 
  | 'seabed';

export type NavigationSection = 
  | 'overview'
  | 'simulation'
  | 'sensors'
  | 'communication'
  | 'biofouling'
  | 'cleaning'
  | 'energy'
  | 'battery'
  | 'buoy'
  | 'faults'
  | 'alerts'
  | 'map';
