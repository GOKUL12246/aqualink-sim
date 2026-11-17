import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Sparkles, 
  RotateCw, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Activity, 
  Disc,
  Play,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AutomaticCleaningView: React.FC = () => {
  const {
    biofouling,
    cleaningHistory,
    triggerManualCleaning,
    toggleAutoCleaning,
    comm,
    wiperAngle,
  } = useSimulation();

  // Workflow steps
  const steps = [
    { num: 1, title: 'Biofouling Accumulation', desc: 'Marine biofilm builds up on sapphire window', active: biofouling.percentage > 30 },
    { num: 2, title: 'Optical Quality Drops', desc: 'Photodiode registers transmission loss', active: biofouling.percentage > 45 },
    { num: 3, title: 'AI Contamination Alert', desc: 'Threshold exceeded (> 65% trigger)', active: biofouling.percentage >= biofouling.autoCleanThreshold },
    { num: 4, title: 'Servo Motor Armed', desc: 'Waterproof servo energized (7.2W spike)', active: biofouling.isCleaning },
    { num: 5, title: 'Silicone Blade Sweep', desc: 'Dual bi-directional wiping cycle across lens', active: biofouling.isCleaning },
    { num: 6, title: 'Contamination Decreases', desc: 'Physical scraped biofilm flushed by current', active: biofouling.isCleaning || biofouling.percentage < 15 },
    { num: 7, title: 'Optical Quality Restores', desc: 'Clarity recovers to >95% transmittance', active: biofouling.windowCleanliness > 90 },
    { num: 8, title: 'Comm Link Re-verified', desc: 'Optical link verified before shutting motor', active: comm.currentMode === 'OPTICAL' && comm.opticalQuality > 80 },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Disc className="w-5 h-5 text-cyan-400" />
            SERVO-OPERATED SILICONE WIPER CLEANING MECHANISM
          </h2>
          <p className="text-xs text-slate-400">
            Autonomous mechanical anti-fouling: custom waterproof digital servo drive sweeping a marine-grade silicone squeegee across the sapphire optical window to prevent bio-attenuation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoCleaning}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              biofouling.autoCleanEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            AUTO-CLEANING: {biofouling.autoCleanEnabled ? 'ENABLED' : 'DISABLED'}
          </button>

          <button
            onClick={triggerManualCleaning}
            disabled={biofouling.isCleaning}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20"
          >
            <Sparkles className={`w-4 h-4 ${biofouling.isCleaning ? 'animate-spin' : ''}`} />
            {biofouling.isCleaning ? `Cleaning (${biofouling.cleaningProgress}%)` : 'Trigger Manual Wiper Cycle'}
          </button>
        </div>
      </div>

      {/* Live Wiper Visual Progress & Before/After Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Animated Wiper Simulator Box (7 cols) */}
        <div className="lg:col-span-7 marine-panel p-5 border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              OPTICAL WINDOW WIPER DYNAMICS SIMULATOR
            </h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              biofouling.isCleaning ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' : 'bg-slate-800 text-slate-400'
            }`}>
              {biofouling.isCleaning ? 'SERVO MOTOR ENERGIZED' : 'SERVO STANDBY'}
            </span>
          </div>

          {/* Wiper Circular Graphic Simulation */}
          <div className="h-64 w-full bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
            {/* Background Optical Sapphire Lens */}
            <div className="w-48 h-48 rounded-full border-4 border-slate-700 relative flex items-center justify-center shadow-inner overflow-hidden bg-slate-900">
              {/* Blue LED Glow from Emitter behind lens */}
              <div className="w-36 h-36 rounded-full bg-cyan-500/20 filter blur-md absolute" />

              {/* Biofouling Simulated Algal Film Overlay */}
              <div 
                className="absolute inset-0 bg-gradient-to-tr from-lime-950 via-emerald-950 to-amber-950 transition-opacity duration-300"
                style={{ opacity: Math.max(0.05, biofouling.percentage / 100) }}
              />

              {/* Wiper Pivot & Arm */}
              <div 
                className="absolute w-2 h-28 bg-slate-400 rounded-full origin-top transition-transform duration-75 shadow-2xl flex flex-col items-center justify-end"
                style={{
                  top: '12px',
                  transform: `rotate(${wiperAngle - 35}deg)`,
                }}
              >
                {/* Blue Silicone Squeegee Blade */}
                <div className="w-4 h-16 bg-blue-600 rounded-sm shadow-md" />
              </div>

              {/* Lens Center Target */}
              <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f2fe] z-10" />
            </div>

            {/* Overlay Wiper Telemetry HUD */}
            <div className="absolute bottom-3 left-4 text-[11px] font-mono text-slate-400">
              <div>SERVO ANGLE: <span className="text-cyan-400 font-bold">{wiperAngle.toFixed(0)}°</span></div>
              <div>SWEEP PROGRESS: <span className="text-white font-bold">{biofouling.cleaningProgress}%</span></div>
            </div>

            <div className="absolute bottom-3 right-4 text-[11px] font-mono text-slate-400 text-right">
              <div>TOTAL CYCLES: <span className="text-emerald-400 font-bold">{biofouling.cleaningCount}</span></div>
              <div>STATUS: <span className={biofouling.isCleaning ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                {biofouling.isCleaning ? 'SWEEPING' : 'IDLE'}
              </span></div>
            </div>
          </div>

          {/* Cleaning Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Wiper Cycle Progress</span>
              <span className="font-mono text-cyan-400 font-bold">{biofouling.cleaningProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${biofouling.cleaningProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Before vs After Optical Window Comparison (5 cols) */}
        <div className="lg:col-span-5 marine-panel p-5 border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            OPTICAL WINDOW BEFORE & AFTER STATE
          </h3>

          <div className="grid grid-cols-2 gap-3 text-center">
            {/* Before (Fouled) */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
              <div className="text-[10px] font-mono text-rose-400 font-bold mb-2">BEFORE CLEANING</div>
              <div className="w-24 h-24 rounded-full border-2 border-rose-500/50 bg-gradient-to-br from-lime-950 to-amber-950 relative overflow-hidden flex items-center justify-center shadow-lg">
                <span className="text-[10px] font-mono text-rose-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded">
                  75% Biofilm
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-2">
                Optical Atten: <span className="text-rose-400 font-bold">-45 dB</span>
              </div>
            </div>

            {/* After (Cleaned) */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
              <div className="text-[10px] font-mono text-emerald-400 font-bold mb-2">AFTER WIPER SWEEP</div>
              <div className="w-24 h-24 rounded-full border-2 border-emerald-500/50 bg-cyan-950/40 relative overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <div className="w-16 h-16 rounded-full bg-cyan-400/20 filter blur-sm" />
                <span className="text-[10px] font-mono text-emerald-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded z-10">
                  4% Clarity
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-2">
                Optical Atten: <span className="text-emerald-400 font-bold">-2 dB</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verified Performance Gain:
            </div>
            <div className="text-slate-400 text-[11px]">
              Silicone wiper achieves a <span className="text-emerald-400 font-bold">94.4% reduction</span> in surface biological colonization, preventing permanent micro-scratching on sapphire glass.
            </div>
          </div>
        </div>
      </div>

      {/* 8-Step Step-by-Step Simulation Workflow Timeline */}
      <div className="marine-panel p-5 border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          END-TO-END WORKING SIMULATION LIFECYCLE (8 STEPS)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {steps.map(s => (
            <div
              key={s.num}
              className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                s.active
                  ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}
            >
              <div>
                <div className="text-[10px] font-mono font-bold mb-1 flex items-center justify-between">
                  <span>STEP 0{s.num}</span>
                  {s.active && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                </div>
                <div className="font-bold text-[11px] text-white leading-tight">{s.title}</div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 leading-tight">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Cleaning Log Table */}
      <div className="marine-panel p-5 border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span>SERVO CLEANING AUDIT TRAIL ({cleaningHistory.length})</span>
          <span className="text-xs font-mono text-slate-400">Total Cleans: {biofouling.cleaningCount}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">MODE</th>
                <th className="py-2.5 px-3">INITIAL FOULING</th>
                <th className="py-2.5 px-3">POST-CLEAN FOULING</th>
                <th className="py-2.5 px-3">SWEEP TIME</th>
                <th className="py-2.5 px-3">CYCLE STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {cleaningHistory.map(log => (
                <tr key={log.id} className="hover:bg-slate-900/60">
                  <td className="py-2.5 px-3 text-slate-400">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-300">{log.type}</td>
                  <td className="py-2.5 px-3 text-rose-400">{log.initialFouling}%</td>
                  <td className="py-2.5 px-3 text-emerald-400">{log.finalFouling}%</td>
                  <td className="py-2.5 px-3 text-slate-300">{log.durationSec}s</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
