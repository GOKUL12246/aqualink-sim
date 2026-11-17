import React, { useEffect, useRef } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Thermometer, 
  Gauge, 
  Droplets, 
  ArrowDownCircle, 
  Sliders, 
  Activity, 
  RefreshCw,
  TrendingUp,
  Compass
} from 'lucide-react';

export const SensorMonitoringView: React.FC = () => {
  const {
    sensors,
    historicalSensors,
    setManualTurbidity,
    nodeDeploymentDepth,
    faults,
  } = useSimulation();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render high-performance live multi-sensor trend chart on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#071526';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#0f294a';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - 25);
      ctx.stroke();
    }
    for (let y = 20; y < height - 25; y += 35) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes and labels
    ctx.strokeStyle = '#205594';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, height - 25);
    ctx.lineTo(width - 10, height - 25);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Rajdhani", sans-serif';
    ctx.fillText('TIME (t) ➔', width - 85, height - 10);
    ctx.fillText('▲ NORMALIZED SENSOR TELEMETRY', 45, 20);

    const dataPoints = historicalSensors;
    if (dataPoints.length < 2) return;

    const chartW = width - 50;
    const chartH = height - 40;
    const stepX = chartW / (dataPoints.length - 1);

    // Helper to draw a sensor series
    const drawSeries = (
      getValue: (d: typeof dataPoints[0]) => number,
      minVal: number,
      maxVal: number,
      color: string,
      label: string
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      dataPoints.forEach((point, i) => {
        const val = getValue(point);
        const norm = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal || 1)));
        const px = 40 + i * stepX;
        const py = (height - 25) - norm * chartH;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Draw last point dot
      const lastPoint = dataPoints[dataPoints.length - 1];
      const lastVal = getValue(lastPoint);
      const lastNorm = Math.max(0, Math.min(1, (lastVal - minVal) / (maxVal - minVal || 1)));
      const lx = 40 + (dataPoints.length - 1) * stepX;
      const ly = (height - 25) - lastNorm * chartH;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    // Plot: Turbidity (0 to 100 NTU) in Amber
    drawSeries(d => d.turbidity, 0, 100, '#fbbf24', 'Turbidity');

    // Plot: Temperature (10 to 30 °C) in Cyan
    drawSeries(d => d.temperature, 10, 30, '#00f2fe', 'Temperature');

    // Plot: Pressure (1 to 5 bar) in Emerald
    drawSeries(d => d.pressure, 1, 5, '#10b981', 'Pressure');
  }, [historicalSensors]);

  // Statistics calculation
  const temps = historicalSensors.map(s => s.temperature);
  const pressures = historicalSensors.map(s => s.pressure);
  const turbidities = historicalSensors.map(s => s.turbidity);

  const avgTemp = temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2) : sensors.temperature.toFixed(2);
  const maxTemp = temps.length ? Math.max(...temps).toFixed(2) : sensors.temperature.toFixed(2);
  const minTemp = temps.length ? Math.min(...temps).toFixed(2) : sensors.temperature.toFixed(2);

  const avgPres = pressures.length ? (pressures.reduce((a, b) => a + b, 0) / pressures.length).toFixed(2) : sensors.pressure.toFixed(2);
  const avgTurb = turbidities.length ? (turbidities.reduce((a, b) => a + b, 0) / turbidities.length).toFixed(1) : sensors.turbidity.toFixed(1);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            OCEANOGRAPHIC SENSOR HUB MONITORING
          </h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry stream from calibrated subsea sensors on the AquaLink node: CTD probe cluster, piezoresistive pressure transducer, and nephelometric turbidity cell.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            SAMPLING RATE: <span className="text-cyan-400 font-bold">1 Hz</span>
          </span>
          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            ADC RESOLUTION: <span className="text-emerald-400 font-bold">16-Bit Sigma-Delta</span>
          </span>
        </div>
      </div>

      {/* 4 Primary Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Temperature Sensor */}
        <div className="marine-panel p-4 border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              WATER TEMPERATURE
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-cyan-300">{sensors.temperature.toFixed(2)}</span>
            <span className="text-lg font-bold text-slate-400">°C</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-[11px] font-mono text-slate-400">
            <div>
              <div className="text-[9px] text-slate-500">MIN</div>
              <div className="text-slate-200 font-bold">{minTemp}°C</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500">AVG</div>
              <div className="text-slate-200 font-bold">{avgTemp}°C</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500">MAX</div>
              <div className="text-slate-200 font-bold">{maxTemp}°C</div>
            </div>
          </div>
        </div>

        {/* 2. Hydrostatic Pressure Sensor */}
        <div className="marine-panel p-4 border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-400" />
              HYDROSTATIC PRESSURE
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-emerald-400">{sensors.pressure.toFixed(2)}</span>
            <span className="text-lg font-bold text-slate-400">bar</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-400">
            <div>
              <div className="text-[9px] text-slate-500">KILOPASCALS</div>
              <div className="text-slate-200 font-bold">{(sensors.pressure * 100).toFixed(0)} kPa</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500">ATMOSPHERES</div>
              <div className="text-slate-200 font-bold">{(sensors.pressure / 1.013).toFixed(2)} atm</div>
            </div>
          </div>
        </div>

        {/* 3. Turbidity Sensor */}
        <div className="marine-panel p-4 border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-amber-400" />
              WATER TURBIDITY
            </span>
            <span className={`w-2 h-2 rounded-full ${sensors.turbidity > 40 ? 'bg-amber-400 animate-pulse' : 'bg-slate-400'}`} />
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-3xl font-black font-mono ${sensors.turbidity > 40 ? 'text-amber-400' : 'text-slate-100'}`}>
              {sensors.turbidity.toFixed(1)}
            </span>
            <span className="text-lg font-bold text-slate-400">NTU</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] flex justify-between items-center text-slate-400">
            <span>Water Clarity:</span>
            <span className={`font-bold font-mono ${sensors.turbidity < 20 ? 'text-emerald-400' : sensors.turbidity < 50 ? 'text-amber-400' : 'text-rose-400'}`}>
              {sensors.turbidity < 20 ? 'CLEAR OCEAN' : sensors.turbidity < 50 ? 'PARTIAL SEDIMENT' : 'HIGH TURBIDITY'}
            </span>
          </div>
        </div>

        {/* 4. Deployed Depth */}
        <div className="marine-panel p-4 border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDownCircle className="w-4 h-4 text-blue-400" />
              DEPLOYMENT DEPTH
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-400" />
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-blue-300">{nodeDeploymentDepth.toFixed(1)}</span>
            <span className="text-lg font-bold text-slate-400">metres</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] flex justify-between items-center text-slate-400">
            <span>Seabed Clearance:</span>
            <span className="font-mono text-slate-200 font-bold">{(30.0 - nodeDeploymentDepth).toFixed(1)} m above floor</span>
          </div>
        </div>
      </div>

      {/* Live Waveform Chart & Physics Equation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Multi-parameter Live Oscillogram (8 cols) */}
        <div className="lg:col-span-8 marine-panel p-5 border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                MULTI-CHANNEL REAL-TIME SENSOR OSCILLOGRAM
              </h3>
              <p className="text-[11px] text-slate-400">Live sliding window of the last 30 seconds of subsea telemetry.</p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#00f2fe] rounded" />
                <span className="text-slate-300">Temp (°C)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#10b981] rounded" />
                <span className="text-slate-300">Pressure (bar)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#fbbf24] rounded" />
                <span className="text-slate-300">Turbidity (NTU)</span>
              </div>
            </div>
          </div>

          {/* Canvas Render */}
          <div className="w-full h-72 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
            <canvas ref={canvasRef} width={800} height={280} className="w-full h-full" />
          </div>
        </div>

        {/* Physics Calculation & Configurator (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Hydrostatic Depth Physics Card */}
          <div className="marine-panel p-4 border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              HYDROSTATIC FORMULA VERIFICATION
            </h3>
            <div className="p-3 rounded bg-slate-950 font-mono text-xs border border-slate-800 text-cyan-300 mb-3">
              P(h) = P_atm + ρ_seawater × g × h
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Atmospheric P_0:</span>
                <span className="font-mono">1.013 bar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Seawater Density (ρ):</span>
                <span className="font-mono">1025 kg/m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gravitational Accel (g):</span>
                <span className="font-mono">9.80665 m/s²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Depth (h):</span>
                <span className="font-mono text-cyan-400 font-bold">{nodeDeploymentDepth.toFixed(1)} m</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                <span className="text-white">Calculated Hydrostatic:</span>
                <span className="font-mono text-emerald-400">{sensors.pressure.toFixed(2)} bar</span>
              </div>
            </div>
          </div>

          {/* Interactive Environment Adjuster */}
          <div className="marine-panel p-4 border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              TURBIDITY ENVIRONMENT SLIDER
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Simulate sudden sediment agitation from dredge activity or underwater current turbidity plumes.
            </p>
            <input
              type="range"
              min="2"
              max="110"
              step="1"
              value={sensors.turbidity}
              onChange={(e) => setManualTurbidity(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>2 NTU (Crystal Clear)</span>
              <span>{sensors.turbidity.toFixed(1)} NTU</span>
              <span>110 NTU (Mud Slurry)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
