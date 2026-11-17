import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Trash2, 
  Filter, 
  ShieldCheck, 
  Clock,
  Printer
} from 'lucide-react';

export const AlertsReportsView: React.FC = () => {
  const {
    alerts,
    dismissAlert,
    clearAlerts,
    sensors,
    comm,
    biofouling,
    energy,
    buoy,
    nodeDeploymentDepth,
  } = useSimulation();

  const [filterType, setFilterType] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS'>('ALL');

  const filteredAlerts = alerts.filter(a => filterType === 'ALL' || a.type === filterType);

  // Generate downloadable simulation report
  const downloadReport = () => {
    const reportData = {
      project: "AquaLink – Intelligent Underwater Communication and Monitoring System",
      tagline: "Connecting Intelligence Beneath the Surface.",
      reportTimestamp: new Date().toISOString(),
      deploymentStatus: {
        nodeDepthMeters: nodeDeploymentDepth,
        waterTemperatureC: sensors.temperature,
        hydrostaticPressureBar: sensors.pressure,
        turbidityNtu: sensors.turbidity,
      },
      communicationTelemetry: {
        activeMode: comm.currentMode,
        opticalQualityPercent: comm.opticalQuality,
        opticalSignalDbm: comm.opticalSignalDbm,
        acousticQualityPercent: comm.acousticQuality,
        acousticSignalDbm: comm.acousticSignalDbm,
        packetsTransmitted: comm.packetsTransmitted,
        packetSuccessRate: `${comm.packetSuccessRate}%`,
      },
      biofoulingDiagnostics: {
        biofoulingPercent: biofouling.percentage,
        windowCleanlinessPercent: biofouling.windowCleanliness,
        aiContaminationRiskScore: biofouling.riskScore,
        aiRiskLevel: biofouling.riskLevel,
        totalCleaningCyclesPerformed: biofouling.cleaningCount,
      },
      energyHarvestingAndBms: {
        waterCurrentSpeedMs: energy.waterCurrentSpeed,
        turbineRpm: energy.turbineRPM,
        generatedPowerWatts: energy.powerGenerated,
        consumedPowerWatts: energy.powerConsumed,
        netPowerWatts: energy.netPower,
        batteryPercentSoC: energy.batteryPercent,
        batteryVoltage: energy.batteryVoltage,
        batteryStatus: energy.batteryStatus,
        cumulativeHarvestedWh: energy.harvestedWh,
      },
      surfaceBuoyGateway: {
        status: buoy.status,
        satelliteUplinkActive: buoy.satelliteUplink,
        cellularUplinkActive: buoy.cellularUplink,
        latitude: buoy.latitude,
        longitude: buoy.longitude,
      },
      systemAlertsCount: alerts.length,
      recentAlerts: alerts.slice(0, 10),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AquaLink_Simulation_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            SYSTEM ALERTS, INCIDENT LOGS & SIMULATION REPORT
          </h2>
          <p className="text-xs text-slate-400">
            Real-time event logging, threshold violation alarms, communication failover records, and automated diagnostic report export for engineering review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadReport}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Engineering Report (.JSON)
          </button>

          <button
            onClick={clearAlerts}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 transition-all border border-slate-700"
          >
            <Trash2 className="w-4 h-4" />
            Clear Log
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Filter by:
        </span>
        {(['ALL', 'CRITICAL', 'WARNING', 'INFO', 'SUCCESS'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${
              filterType === type
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Alerts Feed List */}
      <div className="marine-panel p-5 border-slate-800 space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            No alerts matching the selected filter.
          </div>
        ) : (
          filteredAlerts.map(alt => (
            <div
              key={alt.id}
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                alt.type === 'CRITICAL'
                  ? 'bg-rose-950/30 border-rose-500/60 text-rose-200'
                  : alt.type === 'WARNING'
                  ? 'bg-amber-950/30 border-amber-500/60 text-amber-200'
                  : alt.type === 'SUCCESS'
                  ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                  alt.type === 'CRITICAL' ? 'bg-rose-500 animate-ping' : alt.type === 'WARNING' ? 'bg-amber-400' : 'bg-cyan-400'
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{alt.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {alt.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alt.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs text-slate-400">{alt.timestamp}</span>
                <button
                  onClick={() => dismissAlert(alt.id)}
                  className="text-slate-500 hover:text-slate-300 p-1 rounded"
                  title="Dismiss alert"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
