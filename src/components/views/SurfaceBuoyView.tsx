import React, { useEffect, useRef } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Radio, Satellite, Wifi, Waves, 
  CheckCircle2, AlertTriangle, Compass, Layers, ArrowUp, Activity
} from 'lucide-react';

// Animated data-flow canvas: draws node→buoy→satellite with moving packets
const DataFlowCanvas: React.FC<{
  buoyOnline: boolean;
  satOnline: boolean;
  commMode: string;
  packetsTransmitted: number;
}> = ({ buoyOnline, satOnline, commMode, packetsTransmitted }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Three nodes positions
    const NODE_X  = 90,  NODE_Y  = canvas.height - 50;
    const BUOY_X  = canvas.width / 2, BUOY_Y = canvas.height / 2 - 10;
    const SAT_X   = canvas.width - 90, SAT_Y  = 55;

    // Packet streams
    const packets: { t: number; path: 'nb'|'bs'; speed: number; phase: number }[] = [];
    for (let i = 0; i < 5; i++) packets.push({ t: i * 0.2, path: 'nb', speed: 0.004, phase: i });
    for (let i = 0; i < 3; i++) packets.push({ t: i * 0.33, path: 'bs', speed: 0.003, phase: i });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const draw = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;
      const W = canvas.width, H = canvas.height;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#030e1a';
      ctx.fillRect(0, 0, W, H);

      // ── Draw link lines ────────────────────────────────────────────────
      const drawDashedLine = (x1:number,y1:number,x2:number,y2:number,color:string,active:boolean) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = active ? 2.5 : 1.2;
        ctx.globalAlpha = active ? 0.8 : 0.25;
        ctx.setLineDash([6, 5]);
        ctx.lineDashOffset = -(elapsed * 40);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      };

      drawDashedLine(NODE_X, NODE_Y, BUOY_X, BUOY_Y,
        commMode === 'OPTICAL' ? '#00f2fe' : '#38bdf8', buoyOnline);
      drawDashedLine(BUOY_X, BUOY_Y, SAT_X, SAT_Y, '#fbbf24', satOnline);

      // ── Draw node circles ──────────────────────────────────────────────
      const drawNode = (x:number, y:number, r:number, label:string, sublabel:string, color:string, online:boolean) => {
        // Glow halo
        if (online) {
          const grad = ctx.createRadialGradient(x, y, r*0.5, x, y, r*2.4);
          grad.addColorStop(0, color + '55');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
        // Pulsing ring
        const pulse = online ? 1 + Math.sin(elapsed * 2.5) * 0.08 : 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = online ? 3 : 1.5;
        ctx.globalAlpha = online ? 1 : 0.4;
        ctx.beginPath();
        ctx.arc(x, y, r * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        // Fill
        ctx.fillStyle = online ? color + '28' : '#1e293b';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        // Label in bright crisp white
        ctx.fillStyle = online ? '#ffffff' : '#64748b';
        ctx.font = 'bold 15px "Rajdhani", "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(label, x, y - r - 8);
        ctx.font = 'bold 12px "Rajdhani", "JetBrains Mono", monospace';
        ctx.fillStyle = online ? color : '#64748b';
        ctx.fillText(sublabel, x, y - r + 3);
        // Dot inside
        ctx.fillStyle = color;
        ctx.globalAlpha = online ? 1 : 0.4;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      };

      drawNode(NODE_X, NODE_Y, 28, 'AquaLink Node', 'NODE-01 (SUBSEA)', '#00f2fe', true);
      drawNode(BUOY_X, BUOY_Y, 30, 'Surface Gateway', 'SPAR BUOY (RELAY)', '#fbbf24', buoyOnline);
      drawNode(SAT_X, SAT_Y, 28, 'Satellite Uplink', 'IRIDIUM / LTE', '#10b981', satOnline);

      // ── Draw moving data packets ───────────────────────────────────────
      packets.forEach(pk => {
        const path = pk.path;
        const active = path === 'nb' ? buoyOnline : (buoyOnline && satOnline);
        if (!active) return;

        pk.t = (pk.t + pk.speed) % 1;
        const x1 = path === 'nb' ? NODE_X : BUOY_X;
        const y1 = path === 'nb' ? NODE_Y : BUOY_Y;
        const x2 = path === 'nb' ? BUOY_X : SAT_X;
        const y2 = path === 'nb' ? BUOY_Y : SAT_Y;

        const px = lerp(x1, x2, pk.t);
        const py = lerp(y1, y2, pk.t);
        const col = path === 'nb' ? '#00f2fe' : '#fbbf24';

        // Glow
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 12);
        grad.addColorStop(0, col + 'ff');
        grad.addColorStop(1, col + '00');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fill();
        // Core dot
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Packet counter ─────────────────────────────────────────────────
      ctx.fillStyle = '#0f294a';
      (ctx as CanvasRenderingContext2D).roundRect(W/2 - 90, H - 32, 180, 24, 6);
      ctx.fill();
      ctx.strokeStyle = '#00f2fe44';
      ctx.lineWidth = 1;
      (ctx as CanvasRenderingContext2D).roundRect(W/2 - 90, H - 32, 180, 24, 6);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`TX: ${packetsTransmitted.toLocaleString()} PKTS`, W/2, H - 20);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [buoyOnline, satOnline, commMode, packetsTransmitted]);

  return (
    <canvas
      ref={canvasRef}
      width={680}
      height={340}
      className="w-full h-full rounded-xl"
    />
  );
};

export const SurfaceBuoyView: React.FC = () => {
  const {
    buoy, comm, sensors, biofouling, energy,
    nodeDeploymentDepth, faults, toggleFault,
  } = useSimulation();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400" />
            SURFACE BUOY & SATELLITE / CELLULAR DATA FORWARDING GATEWAY
          </h2>
          <p className="text-xs text-slate-400">
            Surface relay node: spar buoy tethered to the AquaLink subsea node via electro-optical umbilical, bridging underwater acoustic/optical carriers to global satellite and cellular networks. 
            Moving animated packets show live data flow: <span className="text-cyan-400 font-mono font-bold">Node → Buoy → Satellite</span>.
          </p>
        </div>

        <button
          onClick={() => toggleFault('buoyDisconnected')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            faults.buoyDisconnected
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          {faults.buoyDisconnected ? 'RECONNECT BUOY TETHER' : 'DISCONNECT TETHER (TEST)'}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Data-Flow Animated Canvas (7 cols) */}
        <div className="lg:col-span-7 marine-panel p-5 border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              LIVE END-TO-END TELEMETRY FORWARDING ANIMATION
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Node→Buoy ({comm.currentMode})
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Buoy→Satellite
              </span>
            </div>
          </div>

          <div className="h-[300px] w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <DataFlowCanvas
              buoyOnline={buoy.status === 'ONLINE'}
              satOnline={buoy.satelliteUplink}
              commMode={comm.currentMode}
              packetsTransmitted={comm.packetsTransmitted}
            />
          </div>

          {/* Quick pipeline status row */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* Leg 1: Node → Buoy */}
            <div className={`p-2.5 rounded-lg border flex flex-col gap-1 ${
              buoy.tetherStatus === 'INTACT' ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-rose-500/40 bg-rose-950/20'
            }`}>
              <div className="flex items-center justify-between font-bold text-white text-[11px]">
                <span>Node → Buoy</span>
                <span className={`text-[10px] font-mono ${buoy.tetherStatus === 'INTACT' ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {buoy.tetherStatus}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Medium: <span className={comm.currentMode === 'OPTICAL' ? 'text-cyan-300' : 'text-amber-300'}>
                  {comm.currentMode}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Quality: <span className="text-white font-bold">
                  {comm.currentMode === 'OPTICAL' ? comm.opticalQuality : comm.acousticQuality}%
                </span>
              </div>
            </div>

            {/* Leg 2: Buoy → Satellite */}
            <div className={`p-2.5 rounded-lg border flex flex-col gap-1 ${
              buoy.satelliteUplink ? 'border-amber-500/40 bg-amber-950/20' : 'border-rose-500/40 bg-rose-950/20'
            }`}>
              <div className="flex items-center justify-between font-bold text-white text-[11px]">
                <span>Buoy → Sat/LTE</span>
                <span className={`text-[10px] font-mono ${buoy.satelliteUplink ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {buoy.satelliteUplink ? 'ACTIVE' : 'NO LINK'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Sat RSSI: <span className="text-white">{buoy.satelliteSignalDb} dBm</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                LTE RSSI: <span className="text-white">{buoy.cellularSignalDb} dBm</span>
              </div>
            </div>

            {/* Overall system */}
            <div className="p-2.5 rounded-lg border border-emerald-500/40 bg-emerald-950/20 flex flex-col gap-1">
              <div className="font-bold text-white text-[11px]">Cloud Dashboard</div>
              <div className="text-[10px] text-slate-400 font-mono">
                Sync: <span className="text-emerald-400 font-bold">{buoy.lastSyncTime}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Packets: <span className="text-cyan-400 font-bold">{comm.packetsTransmitted.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Buoy physical details & live telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Buoy Status Overview */}
          <div className="marine-panel p-4 border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Waves className="w-4 h-4 text-amber-400" />
              SURFACE BUOY LIVE STATUS
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[9px]">BUOY GATEWAY STATUS</div>
                <div className={`font-bold text-sm mt-0.5 ${buoy.status === 'ONLINE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {buoy.status}
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[9px]">TETHER CABLE</div>
                <div className={`font-bold text-sm mt-0.5 ${buoy.tetherStatus === 'INTACT' ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {buoy.tetherStatus}
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[9px]">OCEAN WAVE HEAVE</div>
                <div className="font-bold text-white mt-0.5">{buoy.waveHeightMeters} m</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[9px]">LAST DATA SYNC</div>
                <div className="font-bold text-cyan-400 mt-0.5 text-[11px]">{buoy.lastSyncTime}</div>
              </div>
            </div>

            {/* Satellite & Cellular uplink indicators */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <Satellite className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300">Iridium Satellite SBD Uplink</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-400">{buoy.satelliteSignalDb} dBm</span>
                  <span className={`font-bold ${buoy.satelliteUplink ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {buoy.satelliteUplink ? 'LINKED' : 'OFFLINE'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <Wifi className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300">Maritime 4G / Band 28 LTE Uplink</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-400">{buoy.cellularSignalDb} dBm</span>
                  <span className={`font-bold ${buoy.cellularUplink ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {buoy.cellularUplink ? 'LINKED' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* GPS Position */}
          <div className="marine-panel p-4 border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              GPS DEPLOYMENT POSITION
            </h3>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[9px]">LATITUDE (WGS-84)</div>
                <div className="font-bold text-white">09° 58' 02.6" N</div>
                <div className="text-[10px] text-slate-500">{buoy.latitude}°</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[9px]">LONGITUDE (WGS-84)</div>
                <div className="font-bold text-white">076° 14' 28.3" E</div>
                <div className="text-[10px] text-slate-500">{buoy.longitude}°</div>
              </div>
            </div>
          </div>

          {/* Live Outgoing JSON Packet */}
          <div className="marine-panel p-4 border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                OUTGOING TELEMETRY FRAME
              </span>
              <span className="text-[10px] font-mono text-emerald-400 animate-pulse">● LIVE</span>
            </h3>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-0.5 overflow-x-auto">
              <div className="text-slate-500">// AquaLink High-Priority Telemetry Frame</div>
              <div>{'{'}</div>
              <div className="pl-4 text-slate-200">"node_id": <span className="text-cyan-300">"AQUALINK-01"</span>,</div>
              <div className="pl-4 text-slate-200">"depth_m": <span className="text-amber-300">{nodeDeploymentDepth.toFixed(2)}</span>,</div>
              <div className="pl-4 text-slate-200">"temp_c": <span className="text-amber-300">{sensors.temperature.toFixed(2)}</span>,</div>
              <div className="pl-4 text-slate-200">"pressure_bar": <span className="text-amber-300">{sensors.pressure.toFixed(2)}</span>,</div>
              <div className="pl-4 text-slate-200">"turbidity_ntu": <span className="text-amber-300">{sensors.turbidity.toFixed(1)}</span>,</div>
              <div className="pl-4 text-slate-200">"comm_mode": <span className="text-cyan-300">"{comm.currentMode}"</span>,</div>
              <div className="pl-4 text-slate-200">"biofouling_pct": <span className="text-amber-300">{biofouling.percentage.toFixed(1)}</span>,</div>
              <div className="pl-4 text-slate-200">"battery_soc": <span className="text-amber-300">{energy.batteryPercent.toFixed(1)}</span>,</div>
              <div className="pl-4 text-slate-200">"turbine_rpm": <span className="text-amber-300">{energy.turbineRPM}</span>,</div>
              <div className="pl-4 text-slate-200">"checksum": <span className="text-emerald-400">"0x8F32C19B"</span></div>
              <div>{'}'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
