import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { UnderwaterSimulation } from '../../three/UnderwaterSimulation';
import { 
  Activity, 
  Wifi, 
  Cpu, 
  Sparkles, 
  Zap, 
  BatteryCharging, 
  Radio, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const {
    setActiveSection,
    sensors,
    comm,
    biofouling,
    energy,
    buoy,
    faults,
    alerts,
    nodeDeploymentState,
    nodeDeploymentDepth,
    triggerManualCleaning,
  } = useSimulation();

  const activeFaultsCount = Object.values(faults).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="marine-panel p-5 relative overflow-hidden bg-gradient-to-r from-slate-900 via-ocean-900 to-slate-900 border border-ocean-700/50">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                DIGITAL TWIN SIMULATION
              </span>
              <span className="text-slate-400 text-xs">| Kochi Marine Trench Deployment Site #1</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              AquaLink – Intelligent Underwater Communication & Monitoring System
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1">
              Autonomous subsea sensor node featuring hybrid optical-acoustic wireless communication, in-situ ocean-current hydrodynamic energy harvesting, and AI-driven optical window anti-biofouling wiper mechanism.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveSection('simulation')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <span>Launch Fullscreen 3D</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* High-Level Fleet & System KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Total Nodes */}
        <div className="marine-panel p-3.5 border-slate-800">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>TOTAL NODES</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">3</div>
          <div className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 1 Deployed, 2 Standby
          </div>
        </div>

        {/* Deployment Depth */}
        <div className="marine-panel p-3.5 border-slate-800">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>NODE DEPTH</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {nodeDeploymentDepth.toFixed(1)} <span className="text-sm text-slate-400">m</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Target: 24.5 m ({nodeDeploymentState})
          </div>
        </div>

        {/* Comm Mode */}
        <div className="marine-panel p-3.5 border-slate-800">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>COMM CHANNEL</span>
            <Wifi className="w-4 h-4 text-cyan-400" />
          </div>
          <div className={`text-xl font-bold font-mono mt-1 ${comm.currentMode === 'OPTICAL' ? 'text-cyan-300' : 'text-amber-300'}`}>
            {comm.currentMode}
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5">
            Link Quality: <span className="font-mono font-bold">{comm.currentMode === 'OPTICAL' ? comm.opticalQuality : comm.acousticQuality}%</span>
          </div>
        </div>

        {/* Biofouling Risk */}
        <div className="marine-panel p-3.5 border-slate-800">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>AI BIOFOULING</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className={`text-xl font-bold font-mono mt-1 ${biofouling.riskLevel === 'HIGH' ? 'text-rose-400' : biofouling.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
            {biofouling.percentage.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Risk: <span className="font-bold">{biofouling.riskLevel}</span> (Cleaned: {biofouling.cleaningCount}x)
          </div>
        </div>

        {/* Turbine Power */}
        <div className="marine-panel p-3.5 border-slate-800">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>TURBINE HARVEST</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            {energy.powerGenerated.toFixed(1)} <span className="text-sm text-slate-400">W</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
            {energy.turbineRPM} RPM @ {energy.waterCurrentSpeed.toFixed(1)} m/s
          </div>
        </div>

        {/* Battery Health */}
        <div className="marine-panel p-3.5 border-slate-800">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>BATTERY SoC</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-2xl font-bold font-mono mt-1 ${energy.batteryPercent < 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {energy.batteryPercent.toFixed(1)} <span className="text-sm text-slate-400">%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {energy.batteryVoltage.toFixed(2)}V ({energy.batteryStatus})
          </div>
        </div>
      </div>

      {/* Main Split: 3D Simulation Preview & System Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 3D View Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              LIVE 3D SUBSEA DIGITAL TWIN
            </h3>
            <span className="text-xs text-slate-400">Interactive: Rotate, Zoom, Pan</span>
          </div>

          <div className="h-[480px] w-full rounded-xl overflow-hidden border border-slate-800 relative shadow-2xl">
            <UnderwaterSimulation isCompact={true} />
          </div>

          {/* Quick Node Controls Strip */}
          <div className="marine-panel p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-medium">Quick Node Actions:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={triggerManualCleaning}
                disabled={biofouling.isCleaning}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {biofouling.isCleaning ? 'Cleaning...' : 'Trigger Lens Wiper'}
              </button>

              <button
                onClick={() => setActiveSection('faults')}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-semibold flex items-center gap-1.5 transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Inject Fault
              </button>

              <button
                onClick={() => setActiveSection('sensors')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-semibold flex items-center gap-1.5 transition-all"
              >
                <Cpu className="w-3.5 h-3.5" />
                View Sensor Plots
              </button>
            </div>
          </div>
        </div>

        {/* Right System Telemetry & Signal Flow (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Signal Pipeline Flow Diagram */}
          <div className="marine-panel p-4 border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>END-TO-END DATA FORWARDING PIPELINE</span>
              <span className="text-[10px] text-cyan-400 font-mono">NODE → BUOY → SATELLITE</span>
            </h3>

            <div className="space-y-3">
              {/* Step 1: Subsea Node */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">AquaLink Underwater Node</div>
                    <div className="text-[11px] text-slate-400">ESP32 + Turbidity/Temp/Pressure + BMS</div>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <span className="text-emerald-400 font-bold">ONLINE</span>
                  <div className="text-slate-500">{nodeDeploymentDepth.toFixed(1)}m depth</div>
                </div>
              </div>

              {/* Transition Link: Optical/Acoustic */}
              <div className="flex items-center justify-center gap-3 py-0.5 text-xs font-mono">
                <div className="h-4 w-px bg-cyan-500/50" />
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  comm.currentMode === 'OPTICAL'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {comm.currentMode} WIRELESS LINK ({comm.currentMode === 'OPTICAL' ? `${comm.opticalQuality}%` : `${comm.acousticQuality}%`})
                </span>
                <div className="h-4 w-px bg-cyan-500/50" />
              </div>

              {/* Step 2: Surface Buoy */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Floating Surface Buoy Gateway</div>
                    <div className="text-[11px] text-slate-400">Solar Deck, Marine Strobe, GPS, RF Receiver</div>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <span className={buoy.status === 'ONLINE' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {buoy.status}
                  </span>
                  <div className="text-slate-500">Waves: {buoy.waveHeightMeters}m</div>
                </div>
              </div>

              {/* Transition Link: Satellite/Cellular */}
              <div className="flex items-center justify-center gap-3 py-0.5 text-xs font-mono">
                <div className="h-4 w-px bg-blue-500/50" />
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  IRIDIUM SATELLITE + 4G LTE UPLINK
                </span>
                <div className="h-4 w-px bg-blue-500/50" />
              </div>

              {/* Step 3: Remote Cloud Dashboard */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Remote Oceanographic Control Center</div>
                    <div className="text-[11px] text-slate-400">Telemetry Stream, Telemetry DB & Alert Engine</div>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px]">
                  <span className="text-emerald-400 font-bold">CONNECTED</span>
                  <div className="text-slate-500">Sync: {buoy.lastSyncTime}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Sensor Quick Snapshot */}
          <div className="marine-panel p-4 border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                ENVIRONMENTAL SENSOR SNAPSHOT
              </h3>
              <button
                onClick={() => setActiveSection('sensors')}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Full Telemetry</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">WATER TEMPERATURE</div>
                <div className="text-lg font-bold text-white mt-0.5">{sensors.temperature.toFixed(2)} °C</div>
                <div className="text-[10px] text-slate-500 mt-1">Thermocline gradient normal</div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">HYDROSTATIC PRESSURE</div>
                <div className="text-lg font-bold text-cyan-400 mt-0.5">{sensors.pressure.toFixed(2)} bar</div>
                <div className="text-[10px] text-slate-500 mt-1">~0.1 bar per metre depth</div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">TURBIDITY (SUSPENDED SOLIDS)</div>
                <div className={`text-lg font-bold mt-0.5 ${sensors.turbidity > 40 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {sensors.turbidity.toFixed(1)} NTU
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Optical visibility: {sensors.turbidity < 20 ? 'High' : 'Attenuated'}</div>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">CURRENT FLUID VELOCITY</div>
                <div className="text-lg font-bold text-amber-300 mt-0.5">{energy.waterCurrentSpeed.toFixed(1)} m/s</div>
                <div className="text-[10px] text-slate-500 mt-1">Turbine RPM: {energy.turbineRPM}</div>
              </div>
            </div>
          </div>

          {/* Active Alerts Banner */}
          <div className="marine-panel p-4 border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${alerts.length > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
                LATEST SYSTEM ALERTS ({alerts.length})
              </h3>
              <button
                onClick={() => setActiveSection('alerts')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                View Log
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {alerts.slice(0, 3).map(alt => (
                <div
                  key={alt.id}
                  className={`p-2.5 rounded-lg text-xs border ${
                    alt.type === 'CRITICAL'
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                      : alt.type === 'WARNING'
                      ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span>{alt.title}</span>
                    <span className="font-mono text-slate-400 text-[10px]">{alt.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{alt.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
