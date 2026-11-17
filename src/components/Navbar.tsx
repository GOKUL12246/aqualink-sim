import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { NavigationSection } from '../types';
import { 
  Waves, 
  Activity, 
  Wifi, 
  Cpu, 
  Sparkles, 
  Zap, 
  BatteryCharging, 
  Radio, 
  AlertTriangle, 
  FileText, 
  MapPin, 
  Play, 
  Pause,
  Layers,
  ShieldCheck,
  Disc,
  Palette,
  Type,
  Check
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    comm,
    energy,
    sensors,
    isSimulationRunning,
    setIsSimulationRunning,
    faults,
    alerts,
    nodeDeploymentState,
    nodeDeploymentDepth,
  } = useSimulation();

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [currentFont, setCurrentFont] = useState<'font-rajdhani' | 'font-space' | 'font-jakarta' | 'font-orbitron'>('font-rajdhani');
  const [currentTheme, setCurrentTheme] = useState<'theme-cyan' | 'theme-amber' | 'theme-emerald' | 'theme-titanium'>('theme-cyan');

  // Load saved preferences
  useEffect(() => {
    const savedFont = localStorage.getItem('aqualink_font') as typeof currentFont;
    const savedTheme = localStorage.getItem('aqualink_theme') as typeof currentTheme;
    if (savedFont) {
      setCurrentFont(savedFont);
    }
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Apply to body
  useEffect(() => {
    document.body.classList.remove('font-rajdhani', 'font-space', 'font-jakarta', 'font-orbitron');
    document.body.classList.remove('theme-cyan', 'theme-amber', 'theme-emerald', 'theme-titanium');
    document.body.classList.add(currentFont);
    document.body.classList.add(currentTheme);
    localStorage.setItem('aqualink_font', currentFont);
    localStorage.setItem('aqualink_theme', currentTheme);
  }, [currentFont, currentTheme]);

  const activeFaultCount = Object.values(faults).filter(Boolean).length;
  const unreadAlerts = alerts.filter(a => !a.acknowledged).length;

  const fontOptions = [
    { id: 'font-rajdhani', name: 'Rajdhani Cyber', desc: 'Futuristic Marine Telemetry (Recommended)', sample: 'AquaLink 24.5m' },
    { id: 'font-space', name: 'Space Grotesk', desc: 'Modern Geometric Cyber Tech', sample: 'AquaLink 24.5m' },
    { id: 'font-jakarta', name: 'Plus Jakarta Sans', desc: 'Ultra-Clean High-Contrast Pro UI', sample: 'AquaLink 24.5m' },
    { id: 'font-orbitron', name: 'Orbitron Tactical', desc: 'Sci-Fi Naval Command Display', sample: 'AquaLink 24.5m' },
  ] as const;

  const themeOptions = [
    { id: 'theme-cyan', name: 'Electric Cyan', desc: 'Neon Blue & Pure White', color: '#00f2fe' },
    { id: 'theme-amber', name: 'Maritime Gold', desc: 'Luminous Solar Amber & Navy', color: '#fbbf24' },
    { id: 'theme-emerald', name: 'Bioluminescent', desc: 'Subsea Emerald & Aquamarine', color: '#10b981' },
    { id: 'theme-titanium', name: 'Titanium Ice', desc: 'High-Contrast White & Ice Crystal', color: '#67e8f9' },
  ] as const;

  const navItems: { id: NavigationSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'simulation', label: '3D Simulation', icon: Waves },
    { id: 'sensors', label: 'Sensor Monitoring', icon: Cpu },
    { id: 'communication', label: 'Hybrid Comm', icon: Wifi },
    { id: 'biofouling', label: 'AI Biofouling', icon: Sparkles },
    { id: 'cleaning', label: 'Auto Cleaning', icon: Disc },
    { id: 'energy', label: 'Energy Harvest', icon: Zap },
    { id: 'battery', label: 'BMS Battery', icon: BatteryCharging },
    { id: 'buoy', label: 'Surface Buoy', icon: Radio },
    { id: 'map', label: 'Deployment Map', icon: MapPin },
    { id: 'faults', label: 'Fault Testing', icon: AlertTriangle },
    { id: 'alerts', label: 'Alerts & Logs', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-2xl">
      {/* Top Branding & Status Header */}
      <div className="max-w-[1720px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-slate-950 flex items-center justify-center border border-cyan-400/50 shadow-[0_0_20px_rgba(0,242,254,0.35)] shrink-0">
            <Waves className="w-6 h-6 text-cyan-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-300 via-blue-100 to-white bg-clip-text text-transparent font-mono">
                AquaLink
              </h1>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/50">
                v2.4 SIMULATION
              </span>
            </div>
            <p className="text-xs text-slate-300 italic font-medium tracking-wide">
              "Connecting Intelligence Beneath the Surface."
            </p>
          </div>
        </div>

        {/* Global Live Status Ribbons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Comm Mode */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 shadow-md">
            <span className="text-slate-300 font-bold text-xs">COMM:</span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs flex items-center gap-1 ${
              comm.currentMode === 'OPTICAL'
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow-[0_0_10px_rgba(0,242,254,0.2)]'
                : comm.currentMode === 'ACOUSTIC'
                ? 'bg-amber-500/25 text-amber-200 border border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-rose-500/25 text-rose-200 border border-rose-400/60'
            }`}>
              <Wifi className="w-3.5 h-3.5" />
              {comm.currentMode} ({comm.currentMode === 'OPTICAL' ? `${comm.opticalQuality}%` : `${comm.acousticQuality}%`})
            </span>
          </div>

          {/* Depth */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 font-mono shadow-md">
            <span className="text-slate-300 font-bold text-xs">DEPTH:</span>
            <span className="text-cyan-300 font-bold text-xs">{nodeDeploymentDepth.toFixed(1)}m</span>
            <span className="text-slate-400 text-xs">({nodeDeploymentState})</span>
          </div>

          {/* Battery */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 font-mono shadow-md">
            <span className="text-slate-300 font-bold text-xs">BATTERY:</span>
            <span className={`font-bold text-xs ${energy.batteryPercent < 20 ? 'text-rose-300' : 'text-emerald-300'}`}>
              {energy.batteryPercent.toFixed(1)}%
            </span>
            <span className="text-slate-400 text-xs">({energy.batteryStatus})</span>
          </div>

          {/* Turbine Power */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 font-mono shadow-md">
            <span className="text-slate-300 font-bold text-xs">TURBINE:</span>
            <span className="text-amber-300 font-bold text-xs">{energy.turbineRPM} RPM</span>
            <span className="text-emerald-300 font-bold text-xs">(+{energy.powerGenerated.toFixed(1)}W)</span>
          </div>

          {/* System Health */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 shadow-md">
            <ShieldCheck className={`w-4 h-4 ${activeFaultCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="text-slate-300 font-bold text-xs">HEALTH:</span>
            <span className={`font-bold font-mono text-xs ${activeFaultCount > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
              {activeFaultCount > 0 ? `${activeFaultCount} FAULT(S)` : 'NOMINAL 100%'}
            </span>
          </div>

          {/* Appearance / Font & Color Settings Button */}
          <button
            onClick={() => setShowThemeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-200 border border-cyan-400/50 hover:border-cyan-300 font-bold text-xs shadow-md transition-all hover:scale-105"
            title="Customize Font & Color Palette"
          >
            <Palette className="w-3.5 h-3.5 text-cyan-300" />
            <Type className="w-3.5 h-3.5 text-blue-300" />
            <span>FONTS &amp; COLORS</span>
          </button>

          {/* Sim Master Clock Pause/Play */}
          <button
            onClick={() => setIsSimulationRunning(!isSimulationRunning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md ${
              isSimulationRunning
                ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/60 hover:bg-emerald-500/35'
                : 'bg-amber-500/25 text-amber-200 border border-amber-400/60 hover:bg-amber-500/35'
            }`}
          >
            {isSimulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isSimulationRunning ? 'ACTIVE' : 'PAUSED'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-[1720px] mx-auto px-4 flex items-center gap-1 nav-scroll py-2 border-t border-slate-800/90">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-white border border-cyan-400/70 shadow-[0_0_14px_rgba(0,242,254,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.id === 'faults' && activeFaultCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFaultCount}
                </span>
              )}
              {item.id === 'alerts' && unreadAlerts > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] flex items-center justify-center font-bold">
                  {unreadAlerts}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Font & Color Theme Customization Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 max-w-xl w-full shadow-2xl shadow-cyan-500/10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Typography &amp; Color Theme Selector</h3>
                  <p className="text-xs text-slate-300">Choose your preferred font style and color palette.</p>
                </div>
              </div>
              <button
                onClick={() => setShowThemeModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Section 1: Font Selection */}
            <div>
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Type className="w-4 h-4" />
                <span>1. Select Font Style</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {fontOptions.map(f => {
                  const isSelected = currentFont === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setCurrentFont(f.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,242,254,0.25)] text-white'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-white">{f.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <span className="text-xs text-slate-400 mb-2">{f.desc}</span>
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300">
                        {f.sample}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Color Palette Selection */}
            <div>
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Palette className="w-4 h-4" />
                <span>2. Select Color Palette</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {themeOptions.map(t => {
                  const isSelected = currentTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setCurrentTheme(t.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,242,254,0.25)]'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.color }} />
                        <span className="font-bold text-xs text-white">{t.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 leading-tight block">{t.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">Settings auto-saved to browser</span>
              <button
                onClick={() => setShowThemeModal(false)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
