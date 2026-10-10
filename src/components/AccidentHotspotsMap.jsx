import React, { useState } from 'react';
import { 
  MapPin, 
  ChevronRight,
  Info
} from 'lucide-react';
import { SAMPLE_HOTSPOTS } from '../data/sampleData';

export function AccidentHotspotsMap({ onSelectHotspot }) {
  const [selectedHotspot, setSelectedHotspot] = useState(SAMPLE_HOTSPOTS[0]);
  const [filterLevel, setFilterLevel] = useState('ALL');

  const filteredHotspots = SAMPLE_HOTSPOTS.filter((item) => {
    if (filterLevel === 'ALL') return true;
    return item.riskLevel.toUpperCase() === filterLevel;
  });

  const getPinCoordinateStyle = (id) => {
    // Relative coordinates across mock GIS map canvas
    switch (id) {
      case 'HS-01': return { top: '32%', left: '42%' };
      case 'HS-02': return { top: '58%', left: '68%' };
      case 'HS-03': return { top: '72%', left: '30%' };
      case 'HS-04': return { top: '24%', left: '76%' };
      case 'HS-05': return { top: '80%', left: '82%' };
      default: return { top: '50%', left: '50%' };
    }
  };

  const getPinColor = (level) => {
    switch (level) {
      case 'Severe': return 'bg-red-500 shadow-red-500/50 text-white';
      case 'High': return 'bg-orange-500 shadow-orange-500/50 text-white';
      case 'Moderate': return 'bg-amber-500 shadow-amber-500/50 text-white';
      default: return 'bg-emerald-500 shadow-emerald-500/50 text-white';
    }
  };

  return (
    <div className="bg-navy-850/90 rounded-2xl border border-navy-750 shadow-xl overflow-hidden backdrop-blur-md">
      
      {/* Top Map Toolbar */}
      <div className="p-4 sm:p-5 border-b border-navy-750 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Interactive Hotspot GIS Map
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-navy-900 text-orange-400 border border-navy-700">
              Sample Geodata
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Spatial representation of simulated high-risk accident clusters and monitored road segments.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'SEVERE', 'HIGH', 'MODERATE', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wider transition ${
                filterLevel === lvl
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                  : 'bg-navy-900 text-slate-400 hover:text-white border border-navy-750'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Inspection Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        
        {/* Left GIS Canvas Placeholder (8 cols) */}
        <div className="lg:col-span-8 relative bg-navy-950 overflow-hidden border-b lg:border-b-0 lg:border-r border-navy-750 flex items-center justify-center min-h-[360px]">
          
          {/* Subtle GIS Vector Grid & Coordinate Lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{
                 backgroundImage: `radial-gradient(rgba(249, 115, 22, 0.2) 1px, transparent 1px), linear-gradient(to right, rgba(42, 60, 122, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(42, 60, 122, 0.3) 1px, transparent 1px)`,
                 backgroundSize: '24px 24px, 80px 80px, 80px 80px',
               }}>
          </div>

          {/* Stylized Road Network SVG Overlays */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-navy-700/60" fill="none">
            {/* Major Arterial 1 */}
            <path d="M 0 140 Q 250 180, 500 120 T 900 240" strokeWidth="4" strokeDasharray="6 4" />
            {/* Major Arterial 2 */}
            <path d="M 120 0 Q 320 200, 380 400 T 700 600" strokeWidth="3" />
            {/* Ring Road Arc */}
            <circle cx="50%" cy="50%" r="160" strokeWidth="2" strokeDasharray="4 6" className="stroke-navy-700/40" />
            <circle cx="50%" cy="50%" r="90" strokeWidth="1.5" className="stroke-orange-500/10" />
          </svg>

          {/* Radar Sweep Effect */}
          <div className="absolute w-72 h-72 rounded-full border border-orange-500/10 pointer-events-none animate-ping opacity-20"></div>

          {/* Map Top Status Bar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400 pointer-events-none">
            <div className="bg-navy-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-navy-750 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-slate-300">SECTOR GRID: 28.53°N, 77.20°E</span>
            </div>

            <div className="bg-navy-900/90 backdrop-blur-md px-2 py-1 rounded-md border border-navy-750 font-mono text-[10px] text-orange-400">
              LAYER: GIS_VECTOR_MOCK
            </div>
          </div>

          {/* Interactive Hotspot Pins */}
          {filteredHotspots.map((hotspot) => {
            const isSelected = selectedHotspot?.id === hotspot.id;
            const pos = getPinCoordinateStyle(hotspot.id);

            return (
              <div
                key={hotspot.id}
                onClick={() => setSelectedHotspot(hotspot)}
                style={pos}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                {/* Ping ring for severe hotspots */}
                {hotspot.riskLevel === 'Severe' && (
                  <span className="absolute -inset-2 rounded-full bg-red-500/30 animate-ping"></span>
                )}

                {/* Marker Pill */}
                <div className={`relative px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg transition-all transform group-hover:scale-110 ${
                  isSelected ? 'ring-2 ring-white scale-110' : ''
                } ${getPinColor(hotspot.riskLevel)}`}>
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="font-mono text-[11px]">{hotspot.id}</span>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block z-30 pointer-events-none">
                  <div className="bg-navy-900 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap border border-navy-700">
                    <p className="font-bold">{hotspot.name}</p>
                    <p className="text-slate-400">Risk Score: {hotspot.riskScore}/100 ({hotspot.riskLevel})</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Map Bottom Legend */}
          <div className="absolute bottom-3 left-3 bg-navy-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-navy-750 flex items-center space-x-3 text-[11px]">
            <span className="text-slate-400 font-semibold">Simulated Severity:</span>
            <div className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-slate-300">Severe</span></div>
            <div className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span><span className="text-slate-300">High</span></div>
            <div className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span><span className="text-slate-300">Moderate</span></div>
            <div className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-slate-300">Low</span></div>
          </div>

        </div>

        {/* Right Hotspot Inspection Card (4 cols) */}
        <div className="lg:col-span-4 p-5 bg-navy-900/95 flex flex-col justify-between">
          {selectedHotspot ? (
            <div className="space-y-4">
              
              {/* Hotspot Header */}
              <div className="border-b border-navy-800 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-750">
                    ID: {selectedHotspot.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedHotspot.riskColor}`}>
                    {selectedHotspot.riskLevel} Risk ({selectedHotspot.riskScore}/100)
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-1">
                  {selectedHotspot.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Type: {selectedHotspot.type}
                </p>
              </div>

              {/* Geo & Speed Details */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-navy-850 border border-navy-800 flex justify-between items-center">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="text-white font-mono font-semibold">{selectedHotspot.coordinates}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-navy-850 border border-navy-800 flex justify-between items-center">
                  <span className="text-slate-400">Speed Limit / Observed:</span>
                  <span className="text-white font-mono font-semibold">
                    {selectedHotspot.speedLimit} / <span className="text-orange-400">{selectedHotspot.observedAvgSpeed}</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-navy-850 border border-navy-800 flex justify-between items-center">
                  <span className="text-slate-400">Quarterly Incident Count:</span>
                  <span className="text-red-400 font-mono font-bold">{selectedHotspot.recentIncidentsCount} Collisions</span>
                </div>
              </div>

              {/* Primary Hazard Factor */}
              <div className="p-3 rounded-lg bg-navy-850 border border-navy-800 text-xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Primary Hazard Mechanism:
                </p>
                <p className="text-slate-200">
                  {selectedHotspot.primaryCause}
                </p>
                <p className="text-[11px] text-amber-400/90 mt-1">
                  ⚠️ {selectedHotspot.weatherImpact}
                </p>
              </div>

              {/* Recommended Action */}
              <div className="p-3 rounded-lg bg-navy-850 border border-navy-800 text-xs">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  AI Prescriptive Engineering Remediation:
                </p>
                <p className="text-slate-300">
                  {selectedHotspot.recommendedAction}
                </p>
              </div>

              {/* Action: Autofill Predictor Form */}
              <button
                type="button"
                onClick={() => {
                  if (onSelectHotspot) onSelectHotspot(selectedHotspot);
                }}
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-navy-800 hover:bg-navy-750 text-white font-semibold text-xs border border-navy-700 flex items-center justify-center space-x-1.5 transition"
              >
                <span>Analyze In Predictor Form</span>
                <ChevronRight className="w-3.5 h-3.5 text-orange-400" />
              </button>

            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              Click any hotspot marker on the GIS grid to inspect simulated incident details.
            </div>
          )}

          {/* Disclaimer at bottom of inspection card */}
          <div className="mt-4 pt-3 border-t border-navy-800 flex items-center space-x-2 text-[10px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Map displays synthetic geospatial benchmarks for hackathon review.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
