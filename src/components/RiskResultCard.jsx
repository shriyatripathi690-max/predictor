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
    <div className="charcoal-card rounded-2xl border border-charcoal-750/90 shadow-card-dark p-5 sm:p-7 backdrop-blur-xl flex flex-col justify-between h-full">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-charcoal-750/80 pb-4 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-brand-orange" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Simulated Risk Assessment
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[280px]">
              Corridor: <span className="text-slate-200 font-semibold">{corridorName || 'Selected Segment'}</span>
            </p>
            {result.evaluationId && (
              <div className="flex items-center space-x-1.5 mt-1 font-mono text-[10px]">
                <span className="text-emerald-400 font-bold">ID: {result.evaluationId}</span>
                {result.journeyId && <span className="text-cyan-400">• {result.journeyId}</span>}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono bg-charcoal-900/90 px-2.5 py-1 rounded-lg border border-charcoal-750">
            <Clock className="w-3 h-3 text-brand-orange/80" />
            <span>{calculationTimestamp}</span>
          </div>
        </div>

        {/* Big Score Gauge Section */}
        <div className="bg-charcoal-900/90 rounded-2xl p-5 sm:p-6 border border-charcoal-750/80 mb-6 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center space-x-4">
              {/* Circular Gauge Ring with Glowing Accent */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-charcoal-800"
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
                  <span className="text-2xl font-black text-white font-mono leading-none tracking-tight">
                    {score}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-mono mt-0.5">
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
                <p className="text-xs text-slate-300 mt-1 max-w-sm leading-relaxed">
                  {alertSummary}
                </p>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="hidden sm:block text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                Calculated Mode
              </span>
              <span className="text-xs font-semibold text-brand-orange">
                Deterministic Heuristic
              </span>
            </div>

          </div>

          {/* Linear Meter Bar (styled like the progress bars in reference image) */}
          <div className="mt-4 pt-3.5 border-t border-charcoal-800">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span>Low (0-35)</span>
              <span>Moderate (36-57)</span>
              <span>High (58-77)</span>
              <span>Severe (78-100)</span>
            </div>
            <div className="w-full h-2.5 bg-charcoal-950 rounded-full overflow-hidden flex border border-charcoal-800">
              <div className="w-[35%] bg-emerald-500/40 border-r border-charcoal-900"></div>
              <div className="w-[22%] bg-amber-500/50 border-r border-charcoal-900"></div>
              <div className="w-[20%] bg-brand-orange/60 border-r border-charcoal-900"></div>
              <div className="w-[23%] bg-brand-red/70"></div>
            </div>
          </div>
        </div>

        {/* Contributing Risk Factors Breakdown */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-brand-orange" />
            <span>Key Contributing Risk Factors (Simulated Attribution)</span>
          </h4>

          <div className="space-y-2">
            {factorContributions.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-charcoal-900/70 border border-charcoal-750/80 hover:border-charcoal-700 flex items-center justify-between text-xs transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-slate-200 truncate">
                    {item.factor}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.description}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className={`font-mono font-bold px-2 py-0.5 rounded-lg text-[11px] ${
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
            <Lightbulb className="w-3.5 h-3.5 text-brand-orange" />
            <span>AI Prescriptive Safety Advisories</span>
          </h4>

          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-charcoal-900/50 border border-charcoal-750/80 flex items-start space-x-2.5 text-xs"
              >
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${
                  rec.priority === 'Urgent' || rec.priority === 'Safety Critical'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-brand-orange/20 text-brand-orange border border-brand-orange/30'
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
      <div className="pt-4 border-t border-charcoal-750/80">
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-charcoal-900 to-charcoal-850 border border-charcoal-750/80 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Stage 2 AI Connection Ready</p>
              <p className="text-[11px] text-slate-400">Clean input schema ready for XGBoost / RandomForest inference</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-charcoal-800 text-slate-300 border border-charcoal-700">
            Pending API
          </span>
        </div>
      </div>

    </div>
  );
}
