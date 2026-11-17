import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { CommMode } from '../../types';
import { 
  Wifi, 
  Radio, 
  ArrowRightLeft, 
  ShieldAlert, 
  CheckCircle2, 
  Zap, 
  Clock, 
  Activity, 
  Layers,
  Sliders,
  AlertTriangle
} from 'lucide-react';

export const HybridCommunicationView: React.FC = () => {
  const {
    comm,
    commSwitchHistory,
    sensors,
    biofouling,
    toggleAutoSwitching,
    setCommModeOverride,
    faults,
  } = useSimulation();

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wifi className="w-5 h-5 text-cyan-400" />
            HYBRID OPTICAL-ACOUSTIC UNDERWATER COMMUNICATION
          </h2>
          <p className="text-xs text-slate-400">
            Intelligent dual-modality physical layer: high-bandwidth 450nm Blue Optical link for clear water, with seamless autonomous failover to 24kHz Acoustic Carrier when turbidity or biofouling degrades optical reception.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoSwitching}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              comm.autoSwitching
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            AUTO-SWITCHING: {comm.autoSwitching ? 'ENABLED (AI HEURISTIC)' : 'MANUAL OVERRIDE'}
          </button>
        </div>
      </div>

      {/* Main Dual-Modality Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optical Transceiver Card */}
        <div className={`marine-panel p-5 border transition-all ${
          comm.currentMode === 'OPTICAL'
            ? 'border-cyan-400/60 shadow-[0_0_20px_rgba(0,242,254,0.15)] bg-slate-900/90'
            : 'border-slate-800 opacity-75'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold">
                OPT
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Optical Communication Channel</h3>
                <p className="text-xs text-cyan-400 font-mono">450 nm Blue Laser / High-Power LED</p>
              </div>
            </div>
            {comm.currentMode === 'OPTICAL' && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                ACTIVE CARRIER
              </span>
            )}
          </div>

          {/* Optical Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs mb-4">
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">LINK QUALITY</div>
              <div className="text-2xl font-bold text-cyan-400 mt-0.5">{comm.opticalQuality}%</div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                <div
                  className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${comm.opticalQuality}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">SIGNAL STRENGTH (RSSI)</div>
              <div className="text-2xl font-bold text-white mt-0.5">{comm.opticalSignalDbm} <span className="text-xs text-slate-400">dBm</span></div>
              <div className="text-[10px] text-slate-500 mt-2">BER: &lt; 10⁻⁶ in clear ocean</div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">EFFECTIVE DATA RATE</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">10.0 Mbps</div>
              <div className="text-[10px] text-slate-500 mt-1">High-def video & raw telemetry</div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">MAX LINE-OF-SIGHT RANGE</div>
              <div className="text-lg font-bold text-slate-200 mt-0.5">25.0 metres</div>
              <div className="text-[10px] text-slate-500 mt-1">Limited by water extinction coeff.</div>
            </div>
          </div>

          {/* Environmental Degradation Factors */}
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Optical Attenuation Sources
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Turbidity Extinction Loss:</span>
              <span className="font-mono text-amber-300 font-bold">-{(sensors.turbidity * 0.65).toFixed(1)} dB (at {sensors.turbidity.toFixed(1)} NTU)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sapphire Window Biofouling Loss:</span>
              <span className="font-mono text-purple-300 font-bold">-{(biofouling.percentage * 0.6).toFixed(1)} dB (at {biofouling.percentage.toFixed(1)}% biofilm)</span>
            </div>
          </div>
        </div>

        {/* Acoustic Transceiver Card */}
        <div className={`marine-panel p-5 border transition-all ${
          comm.currentMode === 'ACOUSTIC'
            ? 'border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-slate-900/90'
            : 'border-slate-800 opacity-75'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold">
                ACO
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Acoustic Communication Channel</h3>
                <p className="text-xs text-amber-400 font-mono">24 kHz Piezoceramic Transducer Dome</p>
              </div>
            </div>
            {comm.currentMode === 'ACOUSTIC' && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                ACTIVE CARRIER
              </span>
            )}
          </div>

          {/* Acoustic Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs mb-4">
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">LINK QUALITY</div>
              <div className="text-2xl font-bold text-amber-400 mt-0.5">{comm.acousticQuality}%</div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                <div
                  className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${comm.acousticQuality}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">ACOUSTIC LEVEL (SPL)</div>
              <div className="text-2xl font-bold text-white mt-0.5">{comm.acousticSignalDbm} <span className="text-xs text-slate-400">dB re 1μPa</span></div>
              <div className="text-[10px] text-slate-500 mt-2">Sound speed: ~1510 m/s</div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">EFFECTIVE DATA RATE</div>
              <div className="text-lg font-bold text-amber-300 mt-0.5">2.4 kbps</div>
              <div className="text-[10px] text-slate-500 mt-1">Essential sensor packets & alarms</div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">MAX OMNIDIRECTIONAL RANGE</div>
              <div className="text-lg font-bold text-slate-200 mt-0.5">1,200 metres</div>
              <div className="text-[10px] text-slate-500 mt-1">Penetrates dense silt & mud plumes</div>
            </div>
          </div>

          {/* Acoustic Robustness Highlights */}
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Acoustic Channel Characteristics
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Turbidity Sensitivity:</span>
              <span className="font-mono text-emerald-400 font-bold">Immune (penetrates 100+ NTU)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Biofouling Sensitivity:</span>
              <span className="font-mono text-emerald-400 font-bold">Immune (surface acoustic coupling intact)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Autonomous Switching State Machine Architecture */}
      <div className="marine-panel p-5 border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            AUTOMATIC DUAL-CHANNEL SWITCHING LOGIC (STATE MACHINE)
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Hysteresis Window: 45% (Drop) / 62% (Recover)
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs items-center">
          {/* Step 1 */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-cyan-400 font-bold">STEP 1</div>
            <div className="font-bold text-white mt-1">Continuous Optical Monitor</div>
            <div className="text-[11px] text-slate-400 mt-1">Continuously measures optical RSSI and SNR at 10 Hz</div>
          </div>

          <div className="text-center font-bold text-cyan-400 text-sm hidden md:block">→</div>

          {/* Step 2 */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-amber-400 font-bold">STEP 2</div>
            <div className="font-bold text-white mt-1">Threshold Violation</div>
            <div className="text-[11px] text-slate-400 mt-1">If Optical Quality &lt; 45%, trigger emergency failover</div>
          </div>

          <div className="text-center font-bold text-amber-400 text-sm hidden md:block">→</div>

          {/* Step 3 */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-mono text-emerald-400 font-bold">STEP 3</div>
            <div className="font-bold text-white mt-1">Acoustic Handshake</div>
            <div className="text-[11px] text-slate-400 mt-1">Acoustic carrier engages; queues high-priority telemetry</div>
          </div>
        </div>

        {/* Manual Force Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">Manual Operator Override:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCommModeOverride('OPTICAL')}
              disabled={comm.currentMode === 'OPTICAL'}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 font-semibold disabled:opacity-40"
            >
              Force Optical Mode
            </button>
            <button
              onClick={() => setCommModeOverride('ACOUSTIC')}
              disabled={comm.currentMode === 'ACOUSTIC'}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-semibold disabled:opacity-40"
            >
              Force Acoustic Mode
            </button>
          </div>
        </div>
      </div>

      {/* Complete Chronological Switching History Log */}
      <div className="marine-panel p-5 border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            COMMUNICATION SWITCHING EVENT AUDIT LOG ({commSwitchHistory.length})
          </span>
          <span className="text-xs text-slate-400 font-mono">Real-time switching telemetry</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">TRANSITION</th>
                <th className="py-2.5 px-3">OPTICAL QUALITY</th>
                <th className="py-2.5 px-3">TURBIDITY</th>
                <th className="py-2.5 px-3">BIOFOULING</th>
                <th className="py-2.5 px-3">TRIGGER RATIONALE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {commSwitchHistory.map(evt => (
                <tr key={evt.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400">{evt.timestamp}</td>
                  <td className="py-2.5 px-3 font-bold">
                    <span className={evt.toMode === 'OPTICAL' ? 'text-cyan-400' : 'text-amber-400'}>
                      {evt.fromMode} → {evt.toMode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-cyan-300">{evt.opticalQuality}%</td>
                  <td className="py-2.5 px-3 text-amber-300">{evt.turbidity} NTU</td>
                  <td className="py-2.5 px-3 text-purple-300">{evt.biofouling}%</td>
                  <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px]">{evt.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
