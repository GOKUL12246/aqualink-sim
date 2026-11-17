import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  MapPin, 
  Radio, 
  Wifi, 
  Compass, 
  Anchor, 
  Layers, 
  ShieldCheck, 
  Navigation,
  Globe
} from 'lucide-react';

export const LiveMapView: React.FC = () => {
  const {
    buoy,
    comm,
    nodeDeploymentDepth,
    energy,
  } = useSimulation();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            GEOSPATIAL SUBSEA DEPLOYMENT & BATHYMETRY MAP
          </h2>
          <p className="text-xs text-slate-400">
            Kochi Offshore Marine Shelf Deployment Field: Live GPS coordinates, ocean floor bathymetry contours, acoustic omnidirectional reception zone (1.2 km radius), and optical line-of-sight cone (25m radius).
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            COORDINATES: <span className="text-cyan-400 font-bold">{buoy.latitude}° N, {buoy.longitude}° E</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Map Canvas / Tactical Radar Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tactical Nautical Radar / Bathymetry Plot (8 cols) */}
        <div className="lg:col-span-8 marine-panel p-5 border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>TACTICAL SUBSEA SITUATION DISPLAY</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Optical Beam (25m)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Acoustic Ring (1.2km)
              </span>
            </div>
          </div>

          {/* Interactive Radar Box */}
          <div className="h-[460px] w-full bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center tech-grid">
            {/* Bathymetric depth contour lines */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
              <circle cx="50%" cy="50%" r="220" fill="none" stroke="#205594" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="50%" cy="50%" r="160" fill="none" stroke="#205594" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="50%" cy="50%" r="100" fill="none" stroke="#205594" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="50%" cy="50%" r="40" fill="none" stroke="#205594" strokeWidth="1" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#173f6f" strokeWidth="1" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#173f6f" strokeWidth="1" />
            </svg>

            {/* Rotating Sonar Radar Sweep Line */}
            <div className="absolute w-[440px] h-[440px] rounded-full border border-cyan-500/20 pointer-events-none flex items-center justify-center">
              <div 
                className="w-full h-full rounded-full sonar-sweep"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(0, 242, 254, 0.25) 0deg, transparent 60deg, transparent 360deg)',
                }}
              />
            </div>

            {/* Acoustic Coverage Circle (Outer Pulse) */}
            <div className="absolute w-72 h-72 rounded-full border-2 border-amber-500/40 bg-amber-500/5 animate-pulse flex items-center justify-center">
              <span className="absolute top-2 text-[9px] font-mono text-amber-400 font-bold">
                ACOUSTIC COVERAGE ZONE (1,200m)
              </span>
            </div>

            {/* Optical Coverage Cone (Inner Target) */}
            <div className="absolute w-24 h-24 rounded-full border-2 border-cyan-400 bg-cyan-400/10 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.3)]">
              <span className="text-[8px] font-mono text-cyan-300 font-bold">OPTICAL (25m)</span>
            </div>

            {/* Center Deploy Node Marker */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_15px_#00f2fe] flex items-center justify-center animate-bounce">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
              </div>
              <div className="bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white mt-1 shadow-lg">
                AQUALINK NODE-01 ({nodeDeploymentDepth.toFixed(1)}m)
              </div>
            </div>

            {/* Surface Buoy Marker (Slightly offset by wave drift) */}
            <div className="absolute top-[38%] left-[54%] z-10 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-[0_0_12px_#f59e0b] flex items-center justify-center">
                <Radio className="w-2.5 h-2.5 text-slate-950" />
              </div>
              <div className="bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-amber-300 mt-1 shadow-lg">
                SURFACE BUOY (WAVE HEAVE: {buoy.waveHeightMeters}m)
              </div>
            </div>

            {/* Simulated Tether Line Graphic */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="50%" y1="50%" x2="54%" y2="38%" stroke="#00f2fe" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
          </div>
        </div>

        {/* Deployment Telemetry & Field Info (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="marine-panel p-5 border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              OCEANOGRAPHIC DEPLOYMENT SITE SPECS
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px]">DEPLOYMENT LOCATION</span>
                <div className="font-bold text-white mt-0.5">Arabian Sea Continental Margin</div>
                <div className="text-[11px] text-slate-500">Subsea Station Sector 4-B</div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px]">LOCAL BATHYMETRIC DEPTH</span>
                <div className="font-bold text-cyan-400 mt-0.5">32.0 metres Total Sounding</div>
                <div className="text-[11px] text-slate-500">Fine marine sand & silt substrate</div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px]">OCEAN CURRENT VECTOR</span>
                <div className="font-bold text-amber-300 mt-0.5">{energy.waterCurrentSpeed.toFixed(1)} m/s @ 245° SW</div>
                <div className="text-[11px] text-slate-500">Tidal ebb/flow harmonic regime</div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px]">SURFACE UPLINK COVERAGE</span>
                <div className="font-bold text-emerald-400 mt-0.5">Dual-Mode Satellite / Marine LTE</div>
                <div className="text-[11px] text-slate-500">Iridium SBD + Band 28 Maritime LTE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
