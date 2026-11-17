import React from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { Navbar } from './components/Navbar';
import { OverviewView } from './components/views/OverviewView';
import { SimulationView } from './components/views/SimulationView';
import { SensorMonitoringView } from './components/views/SensorMonitoringView';
import { HybridCommunicationView } from './components/views/HybridCommunicationView';
import { AIBiofoulingView } from './components/views/AIBiofoulingView';
import { AutomaticCleaningView } from './components/views/AutomaticCleaningView';
import { EnergyHarvestingView } from './components/views/EnergyHarvestingView';
import { BatteryManagementView } from './components/views/BatteryManagementView';
import { SurfaceBuoyView } from './components/views/SurfaceBuoyView';
import { FaultSimulationView } from './components/views/FaultSimulationView';
import { AlertsReportsView } from './components/views/AlertsReportsView';
import { LiveMapView } from './components/views/LiveMapView';

const MainContent: React.FC = () => {
  const { activeSection } = useSimulation();

  return (
    <main className="max-w-[1720px] mx-auto px-4 py-6">
      {activeSection === 'overview' && <OverviewView />}
      {activeSection === 'simulation' && <SimulationView />}
      {activeSection === 'sensors' && <SensorMonitoringView />}
      {activeSection === 'communication' && <HybridCommunicationView />}
      {activeSection === 'biofouling' && <AIBiofoulingView />}
      {activeSection === 'cleaning' && <AutomaticCleaningView />}
      {activeSection === 'energy' && <EnergyHarvestingView />}
      {activeSection === 'battery' && <BatteryManagementView />}
      {activeSection === 'buoy' && <SurfaceBuoyView />}
      {activeSection === 'faults' && <FaultSimulationView />}
      {activeSection === 'alerts' && <AlertsReportsView />}
      {activeSection === 'map' && <LiveMapView />}
    </main>
  );
};

export function App() {
  return (
    <SimulationProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>

        {/* Professional Footer */}
        <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 py-5 text-xs text-slate-400">
          <div className="max-w-[1720px] mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold font-mono text-cyan-300">AquaLink</span>
                <span>– Intelligent Underwater Communication & Monitoring System</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 italic">
                "Connecting Intelligence Beneath the Surface."
              </p>
            </div>

            <div className="text-[11px] text-slate-500 text-right max-w-xl">
              Simulated subsea digital twin demonstration for research, system architecture verification, and final project review. All sensor streams, optical/acoustic channel physics, turbine energy harvesting, and AI predictions are generated in-silico.
            </div>
          </div>
        </footer>
      </div>
    </SimulationProvider>
  );
}

export default App;
