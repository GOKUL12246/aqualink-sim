import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { FaultStates } from '../../types';
import { 
  AlertTriangle, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  Droplets, 
  Wifi, 
  Radio, 
  Sparkles, 
  BatteryLow, 
  ZapOff, 
  Gauge, 
  Anchor
} from 'lucide-react';

export const FaultSimulationView: React.FC = () => {
  const {
    faults,
    toggleFault,
    resetAllFaults,
    alerts,
  } = useSimulation();

  const faultDefinitions: {
    key: keyof FaultStates;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    systemResponse: string;
    severity: 'CRITICAL' | 'WARNING';
  }[] = [
    {
      key: 'highTurbidity',
      name: '1. High Turbidity Surge (>75 NTU)',
      icon: Droplets,
      description: 'Simulates severe underwater sediment plume from seabed dredging or storm current.',
      systemResponse: 'Optical attenuation spikes. Triggers automatic failover to acoustic carrier.',
      severity: 'WARNING',
    },
    {
      key: 'opticalFail',
      name: '2. Optical Transceiver Hardware Loss',
      icon: Wifi,
      description: 'Simulates physical optical emitter shutdown, driver failure, or physical blockage.',
      systemResponse: 'Optical quality drops to 0%. Immediate autonomous switch to 24kHz acoustic modem.',
      severity: 'CRITICAL',
    },
    {
      key: 'acousticFail',
      name: '3. Acoustic Transducer Failure',
      icon: Radio,
      description: 'Simulates ultrasonic transducer impedance fault or heavy acoustic cavitation interference.',
      systemResponse: 'Acoustic channel disabled. Relies on optical channel if within range, else comm failure.',
      severity: 'CRITICAL',
    },
    {
      key: 'highBiofouling',
      name: '4. Severe Biofouling Biofilm (>85%)',
      icon: Sparkles,
      description: 'Simulates rapid organic biofilm and algal growth coating the sapphire optical window.',
      systemResponse: 'AI risk score escalates to HIGH. Triggers automatic servo wiper cleaning sequence.',
      severity: 'WARNING',
    },
    {
      key: 'lowBattery',
      name: '5. Critical Low Battery (<15% SoC)',
      icon: BatteryLow,
      description: 'Simulates extended periods of slack tide with battery depleted to reserve threshold.',
      systemResponse: 'Enters low-power sleep state; throttles non-essential sampling; sounds telemetry alarm.',
      severity: 'CRITICAL',
    },
    {
      key: 'turbineStopped',
      name: '6. Hydrodynamic Turbine Jam',
      icon: ZapOff,
      description: 'Simulates marine seaweed or fishing net debris mechanically binding the turbine rotor.',
      systemResponse: 'Turbine RPM drops to 0; generated power drops to 0W; system transitions to battery drain.',
      severity: 'WARNING',
    },
    {
      key: 'sensorFailure',
      name: '7. Environmental Sensor ADC Malfunction',
      icon: Gauge,
      description: 'Simulates analog front-end transducer error delivering erratic pressure & temperature data.',
      systemResponse: 'Sensor sanity validation triggers warning; tags telemetry frames with error flag.',
      severity: 'CRITICAL',
    },
    {
      key: 'buoyDisconnected',
      name: '8. Surface Buoy Tether Severed',
      icon: Anchor,
      description: 'Simulates surface vessel anchor snag severing the umbilical tether to the floating buoy.',
      systemResponse: 'Satellite/LTE uplink ceases; node shifts to local non-volatile EEPROM telemetry logging.',
      severity: 'CRITICAL',
    },
  ];

  const activeFaultCount = Object.values(faults).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Title & Reset Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            STRESS TESTING & FAULT INJECTION LABORATORY
          </h2>
          <p className="text-xs text-slate-400">
            Simulate realistic subsea hardware failures, extreme oceanic conditions, and communication outages to verify AquaLink's autonomous mitigation response in real-time.
          </p>
        </div>

        <button
          onClick={resetAllFaults}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All Faults (Restore Normal)
        </button>
      </div>

      {/* Active Fault Status Counter Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
        activeFaultCount > 0
          ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
          : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
      }`}>
        <div className="flex items-center gap-3">
          <AlertTriangle className={`w-5 h-5 ${activeFaultCount > 0 ? 'text-rose-400 animate-bounce' : 'text-emerald-400'}`} />
          <div>
            <span className="font-bold text-sm text-white">
              {activeFaultCount > 0 ? `${activeFaultCount} FAULT(S) CURRENTLY ACTIVE` : 'SYSTEM OPERATING AT 100% HEALTH'}
            </span>
            <div className="text-slate-400 mt-0.5">
              {activeFaultCount > 0
                ? 'Autonomous subsea mitigation strategies are currently responding to the injected faults.'
                : 'All subsea sensors, hybrid communication modems, energy harvester, and buoy gateway nominal.'}
            </div>
          </div>
        </div>

        {activeFaultCount > 0 && (
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-rose-500/30 text-rose-300 font-bold border border-rose-500/50">
            ANOMALY IN PROGRESS
          </span>
        )}
      </div>

      {/* 8 Fault Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {faultDefinitions.map(f => {
          const Icon = f.icon;
          const isTriggered = faults[f.key];

          return (
            <div
              key={f.key}
              className={`marine-panel p-4 border transition-all flex flex-col justify-between ${
                isTriggered
                  ? 'border-rose-500/80 bg-rose-950/20 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isTriggered ? 'text-rose-400' : 'text-slate-400'}`} />
                    <span className="text-[10px] font-mono font-bold text-slate-500">{f.severity}</span>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${isTriggered ? 'bg-rose-500 animate-ping' : 'bg-slate-700'}`} />
                </div>

                <h4 className="font-bold text-xs text-white mb-1">{f.name}</h4>
                <p className="text-[11px] text-slate-400 leading-snug mb-3">{f.description}</p>
                
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300 mb-3">
                  <span className="text-cyan-400 font-bold">Mitigation: </span>
                  {f.systemResponse}
                </div>
              </div>

              <button
                onClick={() => toggleFault(f.key)}
                className={`w-full py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  isTriggered
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isTriggered ? 'CLEAR FAULT' : 'INJECT FAULT'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
