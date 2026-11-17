import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  BatteryCharging, 
  BatteryWarning, 
  Zap, 
  Activity, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  Cpu,
  Wifi,
  Sparkles
} from 'lucide-react';

export const BatteryManagementView: React.FC = () => {
  const {
    energy,
    comm,
    biofouling,
    faults,
    toggleFault,
  } = useSimulation();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BatteryCharging className="w-5 h-5 text-emerald-400" />
            BATTERY MANAGEMENT SYSTEM (BMS) TELEMETRY
          </h2>
          <p className="text-xs text-slate-400">
            Intelligent Li-ion energy storage management: live state-of-charge (SoC), voltage profiling, thermal balancing, dynamic power consumption breakdown, and harvest budgeting.
          </p>
        </div>

        <button
          onClick={() => toggleFault('lowBattery')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            faults.lowBattery
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          {faults.lowBattery ? 'CLEAR LOW-BATTERY FAULT' : 'TEST LOW-BATTERY FAULT (12%)'}
        </button>
      </div>

      {/* Main BMS Status Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Battery State-of-Charge */}
        <div className="marine-panel p-5 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>STATE-OF-CHARGE (SoC)</span>
            <BatteryCharging className={`w-4 h-4 ${energy.batteryPercent < 20 ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-black font-mono ${
              energy.batteryPercent < 20 ? 'text-rose-400' : energy.batteryPercent < 40 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {energy.batteryPercent.toFixed(1)}
            </span>
            <span className="text-lg font-bold text-slate-400">%</span>
          </div>

          {/* Visual Battery Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2.5 mt-3 overflow-hidden border border-slate-800">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                energy.batteryPercent < 20 ? 'bg-rose-500' : energy.batteryPercent < 40 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${energy.batteryPercent}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-400 mt-2 font-mono flex justify-between">
            <span>Pack Status:</span>
            <span className="font-bold text-white">{energy.batteryStatus}</span>
          </div>
        </div>

        {/* Battery Voltage */}
        <div className="marine-panel p-5 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>TERMINAL VOLTAGE</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-cyan-300">{energy.batteryVoltage.toFixed(2)}</span>
            <span className="text-lg font-bold text-slate-400">Volts</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Nominal Range:</span>
            <span className="text-slate-200">10.5V (0%) - 12.6V (100%)</span>
          </div>
        </div>

        {/* Net Power Balance */}
        <div className="marine-panel p-5 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>NET POWER FLOW</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-black font-mono ${
              energy.netPower > 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {energy.netPower > 0 ? `+${energy.netPower.toFixed(1)}` : energy.netPower.toFixed(1)}
            </span>
            <span className="text-lg font-bold text-slate-400">Watts</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex justify-between">
            <span>Harvest: <span className="text-emerald-400 font-bold">+{energy.powerGenerated.toFixed(1)}W</span></span>
            <span>Draw: <span className="text-rose-400 font-bold">-{energy.powerConsumed.toFixed(1)}W</span></span>
          </div>
        </div>

        {/* Estimated Runtime Remaining */}
        <div className="marine-panel p-5 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>ESTIMATED OPERATING TIME</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-blue-300">
              {energy.netPower >= 0 ? '∞' : energy.estimatedRuntimeHours.toFixed(1)}
            </span>
            <span className="text-lg font-bold text-slate-400">
              {energy.netPower >= 0 ? 'Self-Sustaining' : 'Hours'}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            {energy.netPower >= 0 ? (
              <span className="text-emerald-400 font-semibold">
                ✓ Ocean turbine harvest exceeds consumption. Continuous autonomy.
              </span>
            ) : (
              <span className="text-amber-400 font-semibold">
                ⚠️ Discharging from reserve battery capacity.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subsea Power Consumption Breakdown & BMS Safeguards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Power Consumer Breakdown (6 cols) */}
        <div className="lg:col-span-6 marine-panel p-5 border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            LIVE SUBSEA CONSUMPTION BREAKDOWN ({energy.powerConsumed.toFixed(1)} W TOTAL)
          </h3>

          <div className="space-y-3 text-xs">
            {/* Consumer 1 */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-bold text-white">ESP32 Core & Sensor ADC Hub</div>
                  <div className="text-[11px] text-slate-400">Continuous 1Hz sampling, filtering & state engine</div>
                </div>
              </div>
              <span className="font-mono text-white font-bold">4.5 W</span>
            </div>

            {/* Consumer 2 */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-bold text-white">
                    {comm.currentMode === 'OPTICAL' ? 'High-Power Blue Optical Laser' : '24kHz Acoustic Transducer PZT'}
                  </div>
                  <div className="text-[11px] text-slate-400">Active telemetry transmitter carrier</div>
                </div>
              </div>
              <span className="font-mono text-cyan-400 font-bold">
                {comm.currentMode === 'OPTICAL' ? '2.8 W' : '4.5 W'}
              </span>
            </div>

            {/* Consumer 3 */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-bold text-white">Silicone Wiper Servo Motor</div>
                  <div className="text-[11px] text-slate-400">Intermittent mechanical window sweep drive</div>
                </div>
              </div>
              <span className={`font-mono font-bold ${biofouling.isCleaning ? 'text-amber-400' : 'text-slate-500'}`}>
                {biofouling.isCleaning ? '7.2 W (ACTIVE)' : '0.0 W (IDLE)'}
              </span>
            </div>
          </div>
        </div>

        {/* BMS Hardware Safeguards & Li-ion Pack Health (6 cols) */}
        <div className="lg:col-span-6 marine-panel p-5 border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            BMS HARDWARE PROTECTION & HEALTH
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Over-Voltage Protection Cutoff (OVP):</span>
              <span className="font-mono text-emerald-400 font-bold">12.65 V (Active)</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Under-Voltage Protection Lock (UVP):</span>
              <span className="font-mono text-rose-400 font-bold">9.80 V (Safe)</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Active Thermal Dissipation to Ocean:</span>
              <span className="font-mono text-cyan-400 font-bold">Seawater Heat Sink (16.8°C)</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Total Harvested Energy Accumulated:</span>
              <span className="font-mono text-blue-300 font-bold">{energy.harvestedWh.toFixed(2)} Wh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
