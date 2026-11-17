import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  CommMode,
  SensorData,
  CommState,
  CommSwitchEvent,
  BiofoulingState,
  CleaningLog,
  EnergyState,
  SurfaceBuoyState,
  FaultStates,
  AlertNotification,
  CameraPreset,
  NavigationSection
} from '../types';

interface SimulationContextType {
  // Navigation & View
  activeSection: NavigationSection;
  setActiveSection: (section: NavigationSection) => void;
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;
  showInternals: boolean;
  setShowInternals: (show: boolean) => void;
  isRotating: boolean;
  setIsRotating: (rotating: boolean) => void;
  isSimulationRunning: boolean;
  setIsSimulationRunning: (running: boolean) => void;

  // Node Deployment
  nodeDeploymentState: 'DEPLOYED' | 'RETRIEVING' | 'SURFACE' | 'DEPLOYING';
  nodeDeploymentDepth: number; // current animated depth (m)
  targetDepth: number; // deployment target depth (m)
  toggleDeployment: () => void;

  // State slices
  sensors: SensorData;
  historicalSensors: SensorData[];
  comm: CommState;
  commSwitchHistory: CommSwitchEvent[];
  biofouling: BiofoulingState;
  cleaningHistory: CleaningLog[];
  energy: EnergyState;
  historicalEnergy: { timestamp: number; generated: number; consumed: number; battery: number }[];
  buoy: SurfaceBuoyState;
  faults: FaultStates;
  alerts: AlertNotification[];

  // Actions
  setWaterCurrentSpeed: (speed: number) => void;
  setManualBiofouling: (percent: number) => void;
  setManualTurbidity: (ntu: number) => void;
  triggerManualCleaning: () => void;
  toggleAutoCleaning: () => void;
  toggleAutoSwitching: () => void;
  setCommModeOverride: (mode: CommMode) => void;
  toggleFault: (faultKey: keyof FaultStates) => void;
  resetAllFaults: () => void;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
  wiperAngle: number; // 0 to 180 deg for 3D animation
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation & View
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [showInternals, setShowInternals] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(true);

  // Deployment
  const [nodeDeploymentState, setNodeDeploymentState] = useState<'DEPLOYED' | 'RETRIEVING' | 'SURFACE' | 'DEPLOYING'>('DEPLOYED');
  const [targetDepth, setTargetDepth] = useState<number>(24.5);
  const [nodeDeploymentDepth, setNodeDeploymentDepth] = useState<number>(24.5);

  // Fault states
  const [faults, setFaults] = useState<FaultStates>({
    highTurbidity: false,
    opticalFail: false,
    acousticFail: false,
    highBiofouling: false,
    lowBattery: false,
    turbineStopped: false,
    sensorFailure: false,
    buoyDisconnected: false,
  });

  // Base environmental factors
  const [ambientTurbidity, setAmbientTurbidity] = useState<number>(8.5);
  const [waterCurrentSpeed, setWaterCurrentSpeedState] = useState<number>(1.2); // m/s

  // Sensor state
  const [sensors, setSensors] = useState<SensorData>({
    temperature: 16.8,
    pressure: 3.46,
    turbidity: 8.5,
    depth: 24.5,
    timestamp: Date.now(),
  });
  const [historicalSensors, setHistoricalSensors] = useState<SensorData[]>([]);

  // Communication state
  const [comm, setComm] = useState<CommState>({
    currentMode: 'OPTICAL',
    opticalQuality: 92,
    opticalSignalDbm: -14.2,
    acousticQuality: 88,
    acousticSignalDbm: -21.5,
    autoSwitching: true,
    opticalWavelengthNm: 450,
    acousticFrequencyKhz: 24,
    packetSuccessRate: 99.4,
    packetsTransmitted: 1420,
    packetsDropped: 8,
    lastSwitchTime: 'Initial Boot (Optical Active)',
  });
  const [commSwitchHistory, setCommSwitchHistory] = useState<CommSwitchEvent[]>([
    {
      id: 'sw-0',
      timestamp: new Date().toLocaleTimeString(),
      fromMode: 'STANDBY',
      toMode: 'OPTICAL',
      reason: 'System initialization: Clear water link verified',
      opticalQuality: 95,
      turbidity: 8.5,
      biofouling: 5,
    }
  ]);

  // Biofouling & Cleaning state
  const [biofouling, setBiofouling] = useState<BiofoulingState>({
    percentage: 8.0,
    windowCleanliness: 92.0,
    riskScore: 12,
    riskLevel: 'LOW',
    predictedMaintenanceDays: 14.2,
    autoCleanEnabled: true,
    autoCleanThreshold: 65,
    growthRate: 1.0,
    growthPaused: false,
    isCleaning: false,
    cleaningProgress: 0,
    cleaningCount: 2,
  });
  const [cleaningHistory, setCleaningHistory] = useState<CleaningLog[]>([
    {
      id: 'cl-1',
      timestamp: new Date(Date.now() - 3600000 * 6).toLocaleTimeString(),
      type: 'AUTOMATIC',
      initialFouling: 68.4,
      finalFouling: 5.2,
      durationSec: 4.0,
      status: 'SUCCESS',
    }
  ]);
  const [wiperAngle, setWiperAngle] = useState<number>(0);

  // Energy & Battery state
  const [energy, setEnergy] = useState<EnergyState>({
    waterCurrentSpeed: 1.2,
    turbineRPM: 198,
    powerGenerated: 14.2,
    powerConsumed: 7.8,
    netPower: 6.4,
    harvestedWh: 42.6,
    batteryPercent: 86.5,
    batteryVoltage: 12.24,
    batteryStatus: 'CHARGING',
    estimatedRuntimeHours: 24.8,
    turbineActive: true,
  });
  const [historicalEnergy, setHistoricalEnergy] = useState<{ timestamp: number; generated: number; consumed: number; battery: number }[]>([]);

  // Surface Buoy state
  const [buoy, setBuoy] = useState<SurfaceBuoyState>({
    status: 'ONLINE',
    satelliteUplink: true,
    cellularUplink: true,
    satelliteSignalDb: -82,
    cellularSignalDb: -68,
    tetherStatus: 'INTACT',
    latitude: 9.9674,
    longitude: 76.2412,
    lastSyncTime: 'Just now',
    waveHeightMeters: 0.65,
  });

  // Alerts
  const [alerts, setAlerts] = useState<AlertNotification[]>([
    {
      id: 'alt-init',
      timestamp: new Date().toLocaleTimeString(),
      type: 'INFO',
      title: 'AquaLink Online',
      message: 'Node deployed at 24.5m. Optical telemetry link established with surface buoy.',
      acknowledged: false,
    }
  ]);

  const addAlert = (type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS', title: string, message: string) => {
    const newAlert: AlertNotification = {
      id: `alt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      title,
      message,
      acknowledged: false,
    };
    setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  // Helper action for manual controls
  const setWaterCurrentSpeed = (speed: number) => {
    setWaterCurrentSpeedState(Math.max(0, Math.min(3.5, speed)));
  };

  const setManualBiofouling = (percent: number) => {
    setBiofouling(prev => ({
      ...prev,
      percentage: Math.max(0, Math.min(100, percent)),
      windowCleanliness: Math.max(0, Math.min(100, 100 - percent)),
    }));
  };

  const setManualTurbidity = (ntu: number) => {
    setAmbientTurbidity(Math.max(1, Math.min(120, ntu)));
  };

  const toggleAutoCleaning = () => {
    setBiofouling(prev => {
      const next = !prev.autoCleanEnabled;
      addAlert('INFO', 'Auto-Cleaning Toggled', `Automatic optical cleaning mode ${next ? 'ENABLED' : 'DISABLED'}`);
      return { ...prev, autoCleanEnabled: next };
    });
  };

  const toggleAutoSwitching = () => {
    setComm(prev => {
      const next = !prev.autoSwitching;
      addAlert('INFO', 'Auto-Comm Toggled', `Automatic communication failover ${next ? 'ENABLED' : 'DISABLED'}`);
      return { ...prev, autoSwitching: next };
    });
  };

  const setCommModeOverride = (mode: CommMode) => {
    setComm(prev => {
      if (prev.currentMode !== mode) {
        setCommSwitchHistory(h => [
          {
            id: `sw-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            fromMode: prev.currentMode,
            toMode: mode,
            reason: `Manual operator override to ${mode}`,
            opticalQuality: prev.opticalQuality,
            turbidity: sensors.turbidity,
            biofouling: biofouling.percentage,
          },
          ...h
        ]);
        addAlert('INFO', 'Mode Switched', `Communication channel set manually to ${mode}`);
      }
      return { ...prev, currentMode: mode, lastSwitchTime: new Date().toLocaleTimeString() };
    });
  };

  // Deployment toggle
  const toggleDeployment = () => {
    if (nodeDeploymentState === 'DEPLOYED') {
      setNodeDeploymentState('RETRIEVING');
      setTargetDepth(0.5);
      addAlert('INFO', 'Node Retrieval Initiated', 'AquaLink node winching toward surface...');
    } else if (nodeDeploymentState === 'SURFACE') {
      setNodeDeploymentState('DEPLOYING');
      setTargetDepth(24.5);
      addAlert('INFO', 'Node Deployment Initiated', 'AquaLink node descending to 24.5m target depth...');
    }
  };

  // Fault management
  const toggleFault = (faultKey: keyof FaultStates) => {
    setFaults(prev => {
      const nextState = !prev[faultKey];
      const updated = { ...prev, [faultKey]: nextState };

      switch (faultKey) {
        case 'highTurbidity':
          if (nextState) {
            addAlert('WARNING', 'Fault Triggered: High Turbidity', 'Severe particulate / sediment plume detected (>75 NTU).');
          } else {
            addAlert('INFO', 'Fault Cleared: Turbidity Normal', 'Sediment cleared. Turbidity returning to baseline.');
          }
          break;
        case 'opticalFail':
          if (nextState) {
            addAlert('CRITICAL', 'Fault: Optical Transceiver Failure', 'Optical emitter shutdown / obstruction. Link quality 0%.');
          } else {
            addAlert('SUCCESS', 'Fault Cleared: Optical Transceiver', 'Optical module diagnostic pass. Emitter resumed.');
          }
          break;
        case 'acousticFail':
          if (nextState) {
            addAlert('CRITICAL', 'Fault: Acoustic Transducer Failure', 'Acoustic transducer disabled / acoustic interference.');
          } else {
            addAlert('SUCCESS', 'Fault Cleared: Acoustic Transducer', 'Acoustic transducer re-synchronized.');
          }
          break;
        case 'highBiofouling':
          if (nextState) {
            setBiofouling(bf => ({ ...bf, percentage: 88, windowCleanliness: 12 }));
            addAlert('WARNING', 'Fault Triggered: Severe Biofouling', 'Simulated rapid algae & biofilm deposition (>85%).');
          } else {
            setBiofouling(bf => ({ ...bf, percentage: 15, windowCleanliness: 85 }));
            addAlert('INFO', 'Fault Cleared: Biofouling Reset', 'Biofouling returned to standard level.');
          }
          break;
        case 'lowBattery':
          if (nextState) {
            setEnergy(e => ({ ...e, batteryPercent: 12.0, batteryVoltage: 10.65, batteryStatus: 'CRITICAL' }));
            addAlert('CRITICAL', 'Fault: Critical Battery State', 'SoC dropped to 12%. Emergency power-conservation engaged.');
          } else {
            setEnergy(e => ({ ...e, batteryPercent: 82.0, batteryVoltage: 12.18, batteryStatus: 'CHARGING' }));
            addAlert('SUCCESS', 'Fault Cleared: Battery Restored', 'Battery state-of-charge restored to normal.');
          }
          break;
        case 'turbineStopped':
          if (nextState) {
            addAlert('WARNING', 'Fault: Hydrodynamic Turbine Jammed', 'Turbine rotor stalled by simulated seaweed debris.');
          } else {
            addAlert('SUCCESS', 'Fault Cleared: Turbine Free', 'Turbine obstruction removed. Rotation restarted.');
          }
          break;
        case 'sensorFailure':
          if (nextState) {
            addAlert('CRITICAL', 'Fault: Sensor Hub Anomaly', 'Environmental sensor ADC error. Erratic pressure/temp readings.');
          } else {
            addAlert('SUCCESS', 'Fault Cleared: Sensor Hub Reset', 'Sensor calibration verified.');
          }
          break;
        case 'buoyDisconnected':
          if (nextState) {
            setBuoy(b => ({ ...b, status: 'DISCONNECTED', tetherStatus: 'DISCONNECTED', satelliteUplink: false, cellularUplink: false }));
            addAlert('CRITICAL', 'Fault: Surface Buoy Disconnected', 'Umbilical telemetry link severed. Data buffering in internal EEPROM.');
          } else {
            setBuoy(b => ({ ...b, status: 'ONLINE', tetherStatus: 'INTACT', satelliteUplink: true, cellularUplink: true }));
            addAlert('SUCCESS', 'Fault Cleared: Buoy Reconnected', 'Surface buoy umbilical re-established. Telemetry sync active.');
          }
          break;
      }
      return updated;
    });
  };

  const resetAllFaults = () => {
    setFaults({
      highTurbidity: false,
      opticalFail: false,
      acousticFail: false,
      highBiofouling: false,
      lowBattery: false,
      turbineStopped: false,
      sensorFailure: false,
      buoyDisconnected: false,
    });
    setBuoy({
      status: 'ONLINE',
      satelliteUplink: true,
      cellularUplink: true,
      satelliteSignalDb: -82,
      cellularSignalDb: -68,
      tetherStatus: 'INTACT',
      latitude: 9.9674,
      longitude: 76.2412,
      lastSyncTime: 'Just now',
      waveHeightMeters: 0.65,
    });
    setBiofouling(bf => ({
      ...bf,
      percentage: Math.min(bf.percentage, 25),
      windowCleanliness: Math.max(bf.windowCleanliness, 75),
    }));
    addAlert('SUCCESS', 'Faults Reset', 'All simulated system faults have been cleared. System nominal.');
  };

  // Cleaning action
  const triggerManualCleaning = () => {
    if (biofouling.isCleaning) return;
    setBiofouling(prev => ({ ...prev, isCleaning: true, cleaningProgress: 0 }));
    addAlert('INFO', 'Silicone Wiper Activated', 'Servo motor initiating optical window wiping cycle...');
  };

  // Deployment transition physics tick
  useEffect(() => {
    if (!isSimulationRunning) return;
    const interval = setInterval(() => {
      setNodeDeploymentDepth(current => {
        if (nodeDeploymentState === 'RETRIEVING') {
          const next = Math.max(0.5, current - 0.4);
          if (next <= 0.6) {
            setNodeDeploymentState('SURFACE');
            addAlert('SUCCESS', 'Node At Surface', 'AquaLink node retrieved to surface maintenance cradle.');
          }
          return next;
        } else if (nodeDeploymentState === 'DEPLOYING') {
          const next = Math.min(targetDepth, current + 0.4);
          if (next >= targetDepth - 0.1) {
            setNodeDeploymentState('DEPLOYED');
            addAlert('SUCCESS', 'Node Deployed', `AquaLink node locked in ocean floor position (${targetDepth}m).`);
          }
          return next;
        }
        return current;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isSimulationRunning, nodeDeploymentState, targetDepth]);

  // Wiper cleaning animation loop
  useEffect(() => {
    if (!biofouling.isCleaning) return;

    let progress = 0;
    const initialFouling = biofouling.percentage;
    const interval = setInterval(() => {
      progress += 2.5; // reaches 100% in ~40 ticks = 2 seconds
      
      // Sweep wiper angle back and forth (0 -> 140 -> 0 -> 140 -> 0)
      const cycleAngle = Math.sin((progress / 100) * Math.PI * 4) * 70;
      setWiperAngle(Math.abs(cycleAngle));

      // Visually clean window proportionally
      const reductionFactor = progress / 100;
      const currentFouling = Math.max(3.5, initialFouling * (1 - reductionFactor * 0.95));
      
      setBiofouling(prev => ({
        ...prev,
        cleaningProgress: Math.min(100, Math.round(progress)),
        percentage: Number(currentFouling.toFixed(1)),
        windowCleanliness: Number((100 - currentFouling).toFixed(1)),
      }));

      if (progress >= 100) {
        clearInterval(interval);
        setWiperAngle(0);
        setBiofouling(prev => ({
          ...prev,
          isCleaning: false,
          cleaningProgress: 0,
          cleaningCount: prev.cleaningCount + 1,
          percentage: 4.2,
          windowCleanliness: 95.8,
        }));

        setCleaningHistory(prev => [
          {
            id: `cl-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'AUTOMATIC',
            initialFouling: Number(initialFouling.toFixed(1)),
            finalFouling: 4.2,
            durationSec: 2.8,
            status: 'SUCCESS',
          },
          ...prev
        ]);

        addAlert('SUCCESS', 'Optical Window Cleaned', 'Silicone wiper cycle complete. Optical window clarity restored to 95.8%.');
      }
    }, 50);

    return () => clearInterval(interval);
  }, [biofouling.isCleaning]);

  // Master Simulation Tick (1 Hz update for sensors, comms, energy, AI)
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();

      // 1. Environmental Sensors
      let currentTurbidity = ambientTurbidity + (Math.random() * 1.5 - 0.75);
      if (faults.highTurbidity) {
        currentTurbidity = 78.5 + (Math.random() * 8 - 4);
      }
      currentTurbidity = Math.max(1, Math.min(120, currentTurbidity));

      const depth = nodeDeploymentDepth;
      // Hydrostatic pressure: P = 1.013 bar + (depth * 0.0981) + minor wave surge
      let pressure = 1.013 + (depth * 0.0981) + (Math.sin(now / 3000) * 0.02);
      // Ambient temperature drops with depth (thermocline)
      let temp = 22.0 - (depth * 0.22) + (Math.cos(now / 5000) * 0.15);

      if (faults.sensorFailure) {
        pressure = 9.99 + (Math.random() * 5);
        temp = -99.9;
      }

      const newSensorData: SensorData = {
        temperature: Number(temp.toFixed(2)),
        pressure: Number(pressure.toFixed(2)),
        turbidity: Number(currentTurbidity.toFixed(1)),
        depth: Number(depth.toFixed(1)),
        timestamp: now,
      };
      setSensors(newSensorData);
      setHistoricalSensors(prev => [...prev.slice(-29), newSensorData]);

      // 2. Biofouling Growth & AI Simulation
      setBiofouling(prev => {
        if (prev.isCleaning) return prev; // handled in wiper loop

        let nextFouling = prev.percentage;
        if (!prev.growthPaused && !faults.highBiofouling) {
          // Natural slow growth in ocean water
          const increment = 0.08 * prev.growthRate;
          nextFouling = Math.min(100, nextFouling + increment);
        } else if (faults.highBiofouling) {
          nextFouling = Math.min(96, Math.max(85, nextFouling + 0.3));
        }

        const cleanliness = Math.max(0, 100 - nextFouling);

        // AI Contamination-Risk Score Heuristic
        // Multi-factor model: biofouling weight 70%, turbidity weight 20%, water temperature weight 10%
        const normalizedTurbidity = Math.min(100, (currentTurbidity / 80) * 100);
        const riskScoreCalc = (nextFouling * 0.7) + (normalizedTurbidity * 0.2) + ((temp > 20 ? 10 : 5) * 0.1);
        const riskScore = Math.min(100, Math.round(riskScoreCalc));

        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
        if (riskScore >= 70) riskLevel = 'HIGH';
        else if (riskScore >= 35) riskLevel = 'MEDIUM';

        // Predicted maintenance days (simulated heuristic)
        const dailyGrowthSim = 3.5 * prev.growthRate;
        const daysRemaining = Math.max(0.1, Number(((prev.autoCleanThreshold - nextFouling) / dailyGrowthSim).toFixed(1)));

        // Automatic cleaning trigger check
        if (prev.autoCleanEnabled && nextFouling >= prev.autoCleanThreshold && !prev.isCleaning) {
          // Trigger automatic cleaning on next tick
          setTimeout(() => triggerManualCleaning(), 100);
        }

        return {
          ...prev,
          percentage: Number(nextFouling.toFixed(1)),
          windowCleanliness: Number(cleanliness.toFixed(1)),
          riskScore,
          riskLevel,
          predictedMaintenanceDays: nextFouling >= prev.autoCleanThreshold ? 0 : daysRemaining,
        };
      });

      // 3. Communication Quality & Automatic Switching Logic
      setComm(prev => {
        // Optical Quality calculation:
        // Degrades with turbidity and biofouling
        const turbidityPenalty = currentTurbidity * 0.65;
        const biofoulingPenalty = biofouling.percentage * 0.6;
        let opticalQ = 100 - turbidityPenalty - biofoulingPenalty + (Math.random() * 4 - 2);
        if (faults.opticalFail) opticalQ = 0;
        opticalQ = Math.max(0, Math.min(100, Math.round(opticalQ)));

        // Signal strength dBm: -10 dBm (best) down to -65 dBm
        const opticalDbm = Number((-10 - ((100 - opticalQ) * 0.55)).toFixed(1));

        // Acoustic Quality calculation:
        // Acoustic penetrates muddy water well, but slightly affected by high water current speed / noise
        let acousticQ = 94 - (waterCurrentSpeed * 3.5) + (Math.random() * 4 - 2);
        if (faults.acousticFail) acousticQ = 0;
        acousticQ = Math.max(0, Math.min(100, Math.round(acousticQ)));
        const acousticDbm = Number((-18 - ((100 - acousticQ) * 0.35)).toFixed(1));

        // Automatic Communication Switching State Machine
        let newMode = prev.currentMode;
        if (prev.autoSwitching) {
          if (prev.currentMode === 'OPTICAL') {
            // Poor optical quality threshold: < 45%
            if (opticalQ < 45) {
              if (acousticQ >= 30) {
                newMode = 'ACOUSTIC';
                setCommSwitchHistory(h => [
                  {
                    id: `sw-${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString(),
                    fromMode: 'OPTICAL',
                    toMode: 'ACOUSTIC',
                    reason: `Optical link degraded to ${opticalQ}% (Turbidity: ${currentTurbidity.toFixed(1)} NTU, Biofouling: ${biofouling.percentage.toFixed(1)}%). Auto-switched to Acoustic.`,
                    opticalQuality: opticalQ,
                    turbidity: Number(currentTurbidity.toFixed(1)),
                    biofouling: biofouling.percentage,
                  },
                  ...h
                ]);
                addAlert('WARNING', 'Comm Failover Activated', `Switched to Acoustic link. Optical degraded to ${opticalQ}%.`);
              } else {
                newMode = 'FAILED';
                addAlert('CRITICAL', 'Comm Link Lost', 'Both optical and acoustic communication channels failed!');
              }
            }
          } else if (prev.currentMode === 'ACOUSTIC') {
            // Optical recovery threshold with hysteresis: > 62%
            if (opticalQ >= 62 && !faults.opticalFail) {
              newMode = 'OPTICAL';
              setCommSwitchHistory(h => [
                {
                  id: `sw-${Date.now()}`,
                  timestamp: new Date().toLocaleTimeString(),
                  fromMode: 'ACOUSTIC',
                  toMode: 'OPTICAL',
                  reason: `Optical channel recovered to ${opticalQ}%. Switched back to high-bandwidth Optical link.`,
                  opticalQuality: opticalQ,
                  turbidity: Number(currentTurbidity.toFixed(1)),
                  biofouling: biofouling.percentage,
                },
                ...h
              ]);
              addAlert('SUCCESS', 'Optical Link Restored', `Optical clarity recovered (${opticalQ}%). Switched back to Optical mode.`);
            } else if (acousticQ < 25) {
              newMode = 'FAILED';
              addAlert('CRITICAL', 'Acoustic Link Degraded', 'Acoustic signal quality dropped below operable threshold.');
            }
          } else if (prev.currentMode === 'FAILED') {
            if (opticalQ >= 55) newMode = 'OPTICAL';
            else if (acousticQ >= 40) newMode = 'ACOUSTIC';
          }
        }

        const isTransmitting = newMode !== 'FAILED' && buoy.status !== 'DISCONNECTED';
        const packetInc = isTransmitting ? (newMode === 'OPTICAL' ? 12 : 3) : 0;
        const dropInc = !isTransmitting ? 4 : (opticalQ < 50 && newMode === 'OPTICAL' ? 1 : 0);

        return {
          ...prev,
          currentMode: newMode,
          opticalQuality: opticalQ,
          opticalSignalDbm: opticalDbm,
          acousticQuality: acousticQ,
          acousticSignalDbm: acousticDbm,
          packetsTransmitted: prev.packetsTransmitted + packetInc,
          packetsDropped: prev.packetsDropped + dropInc,
          packetSuccessRate: prev.packetsTransmitted > 0 
            ? Number(((1 - (prev.packetsDropped / (prev.packetsTransmitted + prev.packetsDropped))) * 100).toFixed(1))
            : 99.0,
        };
      });

      // 4. Energy Harvesting & Battery Management (BMS)
      setEnergy(prev => {
        const speed = waterCurrentSpeed;
        let rpm = 0;
        let powerGen = 0;

        if (speed > 0.15 && !faults.turbineStopped) {
          // Turbine hydrodynamic curve: RPM proportional to fluid velocity
          rpm = Math.round(speed * 165 + (Math.sin(now / 1500) * 12));
          // Kinetic power: P = 0.5 * rho * A * Cp * v^3 scaled for miniature subsea turbine
          // At 1.2 m/s -> ~14.2W, at 2.0 m/s -> ~35W
          powerGen = Number((8.2 * Math.pow(speed, 2.2) * (1 + (Math.random() * 0.08 - 0.04))).toFixed(1));
        }

        // Power consumed: ESP32 + sensors (~4.5W) + comm active (~3.2W) + wiper active (~7.5W)
        let powerCons = 5.2;
        if (comm.currentMode === 'OPTICAL') powerCons += 2.8;
        else if (comm.currentMode === 'ACOUSTIC') powerCons += 4.5;
        if (biofouling.isCleaning) powerCons += 7.2;
        powerCons = Number(powerCons.toFixed(1));

        const net = Number((powerGen - powerCons).toFixed(1));

        // Battery percentage update based on net power
        // 100 Wh nominal pack: 1W net for 1 sec = 1 / 3600 Wh = ~0.00028%
        // Scaled slightly for interactive demo responsiveness
        let nextPercent = prev.batteryPercent;
        if (faults.lowBattery) {
          nextPercent = 11.5;
        } else {
          const deltaPercent = (net / 100) * 0.15; // responsive delta for interactive visualization
          nextPercent = Math.max(0, Math.min(100, nextPercent + deltaPercent));
        }

        // Battery voltage: 3S Li-ion curve (10.2V empty to 12.6V fully charged)
        const voltage = Number((10.2 + (nextPercent / 100) * 2.4).toFixed(2));

        let status: 'CHARGING' | 'DISCHARGING' | 'FLOAT' | 'CRITICAL' = 'DISCHARGING';
        if (nextPercent <= 15) status = 'CRITICAL';
        else if (net > 0.5 && nextPercent >= 99) status = 'FLOAT';
        else if (net > 0.2) status = 'CHARGING';
        else status = 'DISCHARGING';

        // Estimated runtime hours
        let runtimeHours = 99;
        if (net < 0) {
          const remainingWh = (nextPercent / 100) * 100;
          runtimeHours = Number((remainingWh / Math.abs(net)).toFixed(1));
        }

        const harvestedWh = Number((prev.harvestedWh + (powerGen / 3600)).toFixed(2));

        const updatedEnergy: EnergyState = {
          ...prev,
          waterCurrentSpeed: speed,
          turbineRPM: rpm,
          powerGenerated: powerGen,
          powerConsumed: powerCons,
          netPower: net,
          harvestedWh,
          batteryPercent: Number(nextPercent.toFixed(1)),
          batteryVoltage: voltage,
          batteryStatus: status,
          estimatedRuntimeHours: runtimeHours,
          turbineActive: rpm > 0,
        };

        setHistoricalEnergy(hist => [
          ...hist.slice(-29),
          {
            timestamp: now,
            generated: powerGen,
            consumed: powerCons,
            battery: Number(nextPercent.toFixed(1)),
          }
        ]);

        return updatedEnergy;
      });

      // 5. Surface Buoy data sync heartbeat
      setBuoy(prev => {
        if (faults.buoyDisconnected) {
          return {
            ...prev,
            status: 'DISCONNECTED',
            satelliteUplink: false,
            cellularUplink: false,
            tetherStatus: 'DISCONNECTED',
          };
        }
        return {
          ...prev,
          status: 'ONLINE',
          tetherStatus: 'INTACT',
          satelliteUplink: true,
          cellularUplink: true,
          lastSyncTime: new Date().toLocaleTimeString(),
          waveHeightMeters: Number((0.55 + Math.sin(now / 2000) * 0.18).toFixed(2)),
        };
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [
    isSimulationRunning,
    ambientTurbidity,
    waterCurrentSpeed,
    nodeDeploymentDepth,
    faults,
    biofouling.isCleaning,
    biofouling.percentage,
    biofouling.growthRate,
    biofouling.growthPaused,
    biofouling.autoCleanEnabled,
    biofouling.autoCleanThreshold,
    comm.autoSwitching,
    comm.currentMode,
  ]);

  return (
    <SimulationContext.Provider
      value={{
        activeSection,
        setActiveSection,
        cameraPreset,
        setCameraPreset,
        showInternals,
        setShowInternals,
        isRotating,
        setIsRotating,
        isSimulationRunning,
        setIsSimulationRunning,
        nodeDeploymentState,
        nodeDeploymentDepth,
        targetDepth,
        toggleDeployment,
        sensors,
        historicalSensors,
        comm,
        commSwitchHistory,
        biofouling,
        cleaningHistory,
        energy,
        historicalEnergy,
        buoy,
        faults,
        alerts,
        setWaterCurrentSpeed,
        setManualBiofouling,
        setManualTurbidity,
        triggerManualCleaning,
        toggleAutoCleaning,
        toggleAutoSwitching,
        setCommModeOverride,
        toggleFault,
        resetAllFaults,
        dismissAlert,
        clearAlerts,
        wiperAngle,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
