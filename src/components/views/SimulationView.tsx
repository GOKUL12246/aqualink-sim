import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { UnderwaterSimulation } from '../../three/UnderwaterSimulation';
import { 
  Eye, 
  RotateCw, 
  Sparkles, 
  ArrowDownUp, 
  Sliders, 
  Layers, 
  Info,
  CheckCircle2,
  Cpu,
  Zap,
  Wifi,
  Waves
} from 'lucide-react';

export const SimulationView: React.FC = () => {
  const {
    energy,
    setWaterCurrentSpeed,
    sensors,
    setManualTurbidity,
    biofouling,
    setManualBiofouling,
    triggerManualCleaning,
    showInternals,
    setShowInternals,
    isRotating,
    setIsRotating,
    nodeDeploymentState,
    nodeDeploymentDepth,
    toggleDeployment,
    comm,
  } = useSimulation();

  return (
    <div className="space-y-4">
      {/* Simulation Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main 3D Viewport (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Waves className="w-5 h-5 text-cyan-400" />
                3D SUBSEA SIMULATION ENVIRONMENT
              </h2>
              <p className="text-xs text-slate-400">
                Real-time procedural WebGL rendering: realistic depth fog, moving ocean current, floating marine particles, god-ray shafts, and swimming marine fauna.
              </p>
            </div>
          </div>

          <div className="h-[620px] w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <UnderwaterSimulation isCompact={false} />
          </div>
        </div>

        {/* Right Side Control & Engineering Inspection Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Environmental Parameter Controls */}
          <div className="marine-panel p-4 border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              ENVIRONMENTAL CONTROL SLIDERS
            </h3>

            <div className="space-y-4 text-xs">
              {/* Ocean Current Speed Slider */}
              <div>
                <div className="flex justify-between items-center text-slate-300 mb-1">
                  <span className="font-medium">Ocean Current Velocity:</span>
                  <span className="font-mono text-amber-300 font-bold">{energy.waterCurrentSpeed.toFixed(1)} m/s</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.5"
                  step="0.1"
                  value={energy.waterCurrentSpeed}
                  onChange={(e) => setWaterCurrentSpeed(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>0.0 m/s (Still)</span>
                  <span>1.5 m/s (Moderate)</span>
                  <span>3.5 m/s (Strong)</span>
                </div>
              </div>

              {/* Turbidity Slider */}
              <div>
                <div className="flex justify-between items-center text-slate-300 mb-1">
                  <span className="font-medium">Water Turbidity (Suspended Sediment):</span>
                  <span className={`font-mono font-bold ${sensors.turbidity > 40 ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {sensors.turbidity.toFixed(1)} NTU
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="100"
                  step="1"
                  value={sensors.turbidity}
                  onChange={(e) => setManualTurbidity(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>Clear (5 NTU)</span>
                  <span>Estuarine (35 NTU)</span>
                  <span>Muddy Plume (90 NTU)</span>
                </div>
              </div>

              {/* Biofouling Accumulation Slider */}
              <div>
                <div className="flex justify-between items-center text-slate-300 mb-1">
                  <span className="font-medium">Optical Lens Biofouling Level:</span>
                  <span className={`font-mono font-bold ${biofouling.percentage > 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {biofouling.percentage.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={biofouling.percentage}
                  onChange={(e) => setManualBiofouling(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>Pristine (0%)</span>
                  <span>Algae Film (50%)</span>
                  <span>Heavy Biofilm (100%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Model Interactive Toggles */}
          <div className="marine-panel p-4 border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              NODE HARDWARE INSPECTION MODES
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setShowInternals(!showInternals)}
                className={`p-2.5 rounded-lg border font-medium flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                  showInternals
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Eye className="w-4 h-4 text-purple-400" />
                <span>{showInternals ? 'X-Ray Shell (Active)' : 'Show Internals'}</span>
              </button>

              <button
                onClick={() => setIsRotating(!isRotating)}
                className={`p-2.5 rounded-lg border font-medium flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                  isRotating
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <RotateCw className={`w-4 h-4 text-cyan-400 ${isRotating ? 'animate-spin' : ''}`} />
                <span>Auto-Rotation</span>
              </button>

              <button
                onClick={toggleDeployment}
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 font-medium flex flex-col items-center justify-center gap-1.5 transition-all text-center col-span-2"
              >
                <ArrowDownUp className="w-4 h-4 text-blue-400" />
                <span>
                  {nodeDeploymentState === 'DEPLOYED'
                    ? 'Retrieve to Surface Maintenance'
                    : 'Deploy Node to Seabed (24.5m)'}
                </span>
              </button>
            </div>
          </div>

          {/* Subsea Node Component Roster */}
          <div className="marine-panel p-4 border-slate-800">
            <h3 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              NODE HARDWARE ARCHITECTURE
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">ESP32 Core Microcontroller</div>
                  <div className="text-[11px] text-slate-400">Controls optical/acoustic modem logic, sensor sampling ADC, and servo cleaning cycles.</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
                <Wifi className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Optical & Acoustic Transceivers</div>
                  <div className="text-[11px] text-slate-400">High-speed 450nm blue laser/LED beam + 24kHz piezoelectric acoustic transducer dome.</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Silicone Wiper Cleaning Unit</div>
                  <div className="text-[11px] text-slate-400">Waterproof servo motor with articulated silicone blade sweeping across sapphire window.</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Hydrodynamic Turbine & BMS</div>
                  <div className="text-[11px] text-slate-400">Kinetic water current energy harvester coupled to 3S Li-ion rechargeable battery pack.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
