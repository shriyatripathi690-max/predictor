import React from 'react';
import { 
  Activity, 
  Cpu, 
  Clock, 
  Lightbulb, 
  Sliders
} from 'lucide-react';

export function RiskResultCard({ result, corridorName }) {
  if (!result) return null;

  const {
    score,
    category,
    badgeColor,
    gaugeColor,
    alertSummary,
    factorContributions,
    recommendations,
    calculationTimestamp,
  } = result;

  // Percentage for circular / horizontal gauge
  const scorePercent = Math.min(100, Math.max(0, score));

  return (
    <div className="bg-navy-850/90 rounded-2xl border border-navy-750 shadow-xl p-5 sm:p-7 backdrop-blur-md flex flex-col justify-between">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-navy-750/80 pb-4 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Simulated Risk Assessment
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[280px]">
              Corridor: <span className="text-slate-200 font-semibold">{corridorName || 'Selected Segment'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono bg-navy-900 px-2.5 py-1 rounded-md border border-navy-750">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{calculationTimestamp}</span>
          </div>
        </div>

        {/* Big Score Gauge Section */}
        <div className="bg-navy-900/90 rounded-xl p-5 border border-navy-750 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center space-x-4">
              {/* Circular Gauge Ring */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-navy-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Active Value */}
                  <path
                    stroke={gaugeColor}
                    strokeDasharray={`${scorePercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white font-mono leading-none">
                    {score}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">
                    / 100
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                    Predicted Severity:
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeColor}`}>
                    {category} Risk
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-sm">
                  {alertSummary}
                </p>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="hidden sm:block text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                Calculated Mode
              </span>
              <span className="text-xs font-semibold text-orange-400">
                Deterministic Heuristic
              </span>
            </div>

          </div>

          {/* Linear Meter Bar */}
          <div className="mt-4 pt-3 border-t border-navy-800">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>Low (0-35)</span>
              <span>Moderate (36-57)</span>
              <span>High (58-77)</span>
              <span>Severe (78-100)</span>
            </div>
            <div className="w-full h-2 bg-navy-800 rounded-full overflow-hidden flex">
              <div className="w-[35%] bg-emerald-500/30 border-r border-navy-900"></div>
              <div className="w-[22%] bg-amber-500/30 border-r border-navy-900"></div>
              <div className="w-[20%] bg-orange-500/30 border-r border-navy-900"></div>
              <div className="w-[23%] bg-red-500/30"></div>
            </div>
          </div>
        </div>

        {/* Contributing Risk Factors Breakdown */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-orange-400" />
            <span>Key Contributing Risk Factors (Simulated Attribution)</span>
          </h4>

          <div className="space-y-2">
            {factorContributions.map((item, index) => (
              <div
                key={index}
                className="p-2.5 rounded-lg bg-navy-900/60 border border-navy-750/70 flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-slate-200 truncate">
                    {item.factor}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {item.description}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    item.severity === 'high' 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                      : item.severity === 'medium'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {item.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prescriptive Safety Actions */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-orange-400" />
            <span>AI Prescriptive Safety Advisories</span>
          </h4>

          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-navy-900/40 border border-navy-800 flex items-start space-x-2.5 text-xs"
              >
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${
                  rec.priority === 'Urgent' || rec.priority === 'Safety Critical'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                }`}>
                  {rec.priority}
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {rec.action}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Stage 2 ML Integration Bridge Callout */}
      <div className="pt-4 border-t border-navy-800">
        <div className="p-3 rounded-xl bg-gradient-to-r from-navy-900 to-navy-850 border border-navy-750 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Stage 2 AI Connection Ready</p>
              <p className="text-[11px] text-slate-400">Clean input schema ready for XGBoost / RandomForest inference</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-navy-800 text-slate-300 border border-navy-700">
            Pending API
          </span>
        </div>
      </div>

    </div>
  );
}
