import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Zap, 
  RotateCw, 
  Sliders, 
  Activity, 
  BatteryCharging, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';

export const EnergyHarvestingView: React.FC = () => {
  const {
    energy,
    setWaterCurrentSpeed,
    faults,
  } = useSimulation();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            OCEAN-CURRENT HYDRODYNAMIC TURBINE ENERGY HARVESTING
          </h2>
          <p className="text-xs text-slate-400">
            In-situ kinetic energy extraction: 3-blade helical hydrofoil turbine harvesting subsea tidal and ocean-current momentum to charge the internal 3S Li-ion battery pack for indefinite underwater autonomy.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            POWER STATUS: <span className={energy.batteryStatus === 'CHARGING' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {energy.batteryStatus}
            </span>
          </span>
        </div>
      </div>

      {/* 4 Primary Energy KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Speed */}
        <div className="marine-panel p-4 border-slate-800">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>WATER VELOCITY</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-white">{energy.waterCurrentSpeed.toFixed(1)}</span>
            <span className="text-sm font-bold text-slate-400">m/s</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Knots: {(energy.waterCurrentSpeed * 1.94384).toFixed(1)} kn
          </div>
        </div>

        {/* Turbine RPM */}
        <div className="marine-panel p-4 border-slate-800">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>TURBINE ROTATION</span>
            <RotateCw className={`w-4 h-4 text-amber-400 ${energy.turbineRPM > 0 ? 'animate-spin' : ''}`} />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-amber-400">{energy.turbineRPM}</span>
            <span className="text-sm font-bold text-slate-400">RPM</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Tip Speed Ratio (TSR): 4.2
          </div>
        </div>

        {/* Generated Power */}
        <div className="marine-panel p-4 border-slate-800">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>INSTANT POWER GENERATED</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-emerald-400">+{energy.powerGenerated.toFixed(1)}</span>
            <span className="text-sm font-bold text-slate-400">Watts</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Net: <span className={energy.netPower > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {energy.netPower > 0 ? `+${energy.netPower}` : energy.netPower} W
            </span>
          </div>
        </div>

        {/* Cumulative Harvested Wh */}
        <div className="marine-panel p-4 border-slate-800">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>CUMULATIVE ENERGY HARVESTED</span>
            <BatteryCharging className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-blue-300">{energy.harvestedWh.toFixed(2)}</span>
            <span className="text-sm font-bold text-slate-400">Wh</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Battery SoC: {energy.batteryPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Interactive Speed Controller & Physics Power Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Slider & Live Turbine Control (6 cols) */}
        <div className="lg:col-span-6 marine-panel p-5 border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            WATER CURRENT SPEED ADJUSTMENT CONTROLLER
          </h3>
          <p className="text-xs text-slate-400">
            Slide to alter the simulated ocean current velocity. Observe immediate response in turbine blade rotation speed and electrical energy output.
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Fluid Flow Speed:</span>
              <span className="font-mono text-xl font-bold text-amber-400">{energy.waterCurrentSpeed.toFixed(1)} m/s</span>
            </div>

            <input
              type="range"
              min="0.0"
              max="3.5"
              step="0.1"
              value={energy.waterCurrentSpeed}
              onChange={(e) => setWaterCurrentSpeed(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.0 m/s (Slack Tide)</span>
              <span>1.5 m/s (Nominal)</span>
              <span>3.5 m/s (Spring Current)</span>
            </div>
          </div>

          {/* Turbine Diagnostics */}
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Hydrodynamic Turbine Subsystem Specifications
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Rotor Diameter:</span>
              <span className="font-mono text-white font-bold">0.45 m (Swept Area: 0.16 m²)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Generator Type:</span>
              <span className="font-mono text-white font-bold">Direct-Drive 3-Phase PM Synchronous</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cut-in Velocity:</span>
              <span className="font-mono text-emerald-400 font-bold">0.25 m/s</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Turbine Rotor Status:</span>
              <span className={`font-mono font-bold ${faults.turbineStopped ? 'text-rose-400' : 'text-emerald-400'}`}>
                {faults.turbineStopped ? 'BLOCKED / JAMMED' : 'ROTATING NORMALLY'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Power-Conditioning Stage Pipeline (6 cols) */}
        <div className="lg:col-span-6 marine-panel p-5 border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            5-STAGE POWER CONVERSION & HARVESTING ARCHITECTURE
          </h3>

          <div className="space-y-2.5 text-xs">
            {/* Stage 1 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono text-[10px] flex items-center justify-center">1</span>
                <div>
                  <div className="font-bold text-white">Hydrodynamic Momentum Capture</div>
                  <div className="text-[11px] text-slate-400">Kinetic flux: 0.5 × ρ × A × v³ (ρ = 1025 kg/m³)</div>
                </div>
              </div>
              <span className="font-mono text-amber-400 font-bold">{(15.4 * Math.pow(energy.waterCurrentSpeed, 3) * 0.16).toFixed(1)} W gross</span>
            </div>

            {/* Stage 2 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono text-[10px] flex items-center justify-center">2</span>
                <div>
                  <div className="font-bold text-white">Low-Friction Magneto Generator</div>
                  <div className="text-[11px] text-slate-400">Permanent magnet stator conversion ({energy.turbineRPM} RPM)</div>
                </div>
              </div>
              <span className="font-mono text-white font-bold">η = 88%</span>
            </div>

            {/* Stage 3 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono text-[10px] flex items-center justify-center">3</span>
                <div>
                  <div className="font-bold text-white">Active Synchronous Rectification</div>
                  <div className="text-[11px] text-slate-400">Converts AC generator wave to smooth DC bus</div>
                </div>
              </div>
              <span className="font-mono text-white font-bold">96% efficiency</span>
            </div>

            {/* Stage 4 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono text-[10px] flex items-center justify-center">4</span>
                <div>
                  <div className="font-bold text-white">MPPT Buck-Boost Power Conditioner</div>
                  <div className="text-[11px] text-slate-400">Maximizes harvest matching variable water speeds</div>
                </div>
              </div>
              <span className="font-mono text-emerald-400 font-bold">+{energy.powerGenerated.toFixed(1)} W net</span>
            </div>

            {/* Stage 5 */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono text-[10px] flex items-center justify-center">5</span>
                <div>
                  <div className="font-bold text-white">3S Li-ion Battery Charging Circuit</div>
                  <div className="text-[11px] text-slate-400">CC/CV charge profile with overcharge protection</div>
                </div>
              </div>
              <span className="font-mono text-cyan-400 font-bold">{energy.batteryPercent.toFixed(1)}% SoC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
