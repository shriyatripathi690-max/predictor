import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Layers, 
  ShieldAlert, 
  AlertTriangle,
  Info,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Legend,
  Cell
} from 'recharts';
import { 
  MORTH_NATIONAL_TRENDS, 
  MORTH_STATE_WISE_2022, 
  MORTH_ROAD_CLASSIFICATION_2022, 
  MORTH_HOURLY_DISTRIBUTION, 
  MORTH_CAUSATIVE_FACTORS,
  MORTH_METADATA 
} from '../services/morthDataService';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-charcoal-900/95 backdrop-blur-md border border-charcoal-700 p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 z-50">
        <p className="font-bold text-white border-b border-charcoal-700 pb-1">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4 font-mono">
            <span className="flex items-center gap-1.5" style={{ color: item.color || '#cbd5e1' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || '#cbd5e1' }}></span>
              {item.name}:
            </span>
            <span className="font-bold text-white">
              {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function HistoricalTrends() {
  const [activeView, setActiveView] = useState('multi_year'); // 'multi_year' | 'state_rankings' | 'road_class' | 'hourly' | 'causes'

  // Top 10 States by Accidents & Fatalities for clear bar chart display
  const top10States = MORTH_STATE_WISE_2022.slice(0, 10).map((s) => ({
    name: s.code,
    fullName: s.state,
    accidents: s.totalAccidents,
    fatalities: s.fatalities,
    severity: s.severityIndex,
  }));

  return (
    <div className="charcoal-card rounded-2xl border border-charcoal-750/90 shadow-card-dark p-5 sm:p-7 backdrop-blur-xl space-y-6">
      
      {/* Header & View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-charcoal-750/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Official MoRTH Road Accident Statistics &amp; Nationwide Trends
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              GOVT. OF INDIA VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official multi-year crash statistics published by Ministry of Road Transport and Highways (MoRTH, 2018–2022).
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex flex-wrap items-center bg-charcoal-900 p-1 rounded-xl border border-charcoal-750 gap-1">
          <button
            onClick={() => setActiveView('multi_year')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              activeView === 'multi_year'
                ? 'bg-charcoal-800 text-brand-orange shadow-inner border border-charcoal-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>5-Year National</span>
          </button>

          <button
            onClick={() => setActiveView('state_rankings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              activeView === 'state_rankings'
                ? 'bg-charcoal-800 text-brand-orange shadow-inner border border-charcoal-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Top States</span>
          </button>

          <button
            onClick={() => setActiveView('road_class')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              activeView === 'road_class'
                ? 'bg-charcoal-800 text-brand-orange shadow-inner border border-charcoal-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Highway Class</span>
          </button>

          <button
            onClick={() => setActiveView('hourly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              activeView === 'hourly'
                ? 'bg-charcoal-800 text-brand-orange shadow-inner border border-charcoal-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hourly Circadian</span>
          </button>

          <button
            onClick={() => setActiveView('causes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              activeView === 'causes'
                ? 'bg-charcoal-800 text-brand-orange shadow-inner border border-charcoal-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Causative Factors</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: 5-Year National Trends (MoRTH 2018-2022) */}
      {activeView === 'multi_year' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-750">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">2022 Total Accidents</span>
              <p className="text-xl font-bold font-mono text-white mt-1">461,312</p>
              <span className="text-[10px] text-brand-orange font-semibold">+11.9% post-pandemic rebound</span>
            </div>
            <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-750">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">2022 Fatalities</span>
              <p className="text-xl font-bold font-mono text-red-400 mt-1">168,491</p>
              <span className="text-[10px] text-red-400 font-semibold">Highest recorded annually</span>
            </div>
            <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-750">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Accident Severity Index</span>
              <p className="text-xl font-bold font-mono text-amber-300 mt-1">36.5 / 100</p>
              <span className="text-[10px] text-slate-400">Deaths per 100 crashes</span>
            </div>
            <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-750">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">NH Fatality Share</span>
              <p className="text-xl font-bold font-mono text-cyan-400 mt-1">36.2%</p>
              <span className="text-[10px] text-slate-400">Over 61,038 deaths on NHs</span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MORTH_NATIONAL_TRENDS} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="accidentsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6a00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ff6a00" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="fatalitiesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252a36" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="totalAccidents" name="Total Accidents" stroke="#ff6a00" strokeWidth={2.5} fillOpacity={1} fill="url(#accidentsGrad)" />
                <Area type="monotone" dataKey="fatalities" name="Fatalities (Killed)" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#fatalitiesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 2: Top States by Accidents & Fatalities (MoRTH 2022) */}
      {activeView === 'state_rankings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Top 10 Indian States by Accident Volume &amp; Fatality Impact (MoRTH 2022)</span>
            <span className="font-mono text-slate-500">Source: MoRTH Table 1.1</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10States} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252a36" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 'bold' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="square" />
                <Bar dataKey="accidents" name="Reported Accidents" fill="#ff6a00" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fatalities" name="Fatalities" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-slate-300 flex items-start space-x-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>Severity Disparity Note:</strong> Tamil Nadu reported the highest raw accident count (64,105), but Uttar Pradesh recorded the highest fatal outcome (22,595 deaths with a 54.1 severity index), demonstrating why fatality-weighted risk modeling is scientifically essential over raw accident counts.
            </p>
          </div>
        </div>
      )}

      {/* VIEW 3: Road Classification Distribution (MoRTH 2022) */}
      {activeView === 'road_class' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MORTH_ROAD_CLASSIFICATION_2022.map((rc) => (
              <div key={rc.category} className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-750 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{rc.category}</h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${rc.color}25`, color: rc.color }}>
                    {rc.accidentShare}% accidents
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{rc.description}</p>
                <div className="pt-2 border-t border-charcoal-800 flex justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Accidents:</span>
                    <strong className="text-white font-mono">{rc.totalAccidents.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Fatalities:</span>
                    <strong className="text-red-400 font-mono">{rc.fatalities.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Severity:</span>
                    <strong className="text-amber-300 font-mono">{rc.severityIndex}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MORTH_ROAD_CLASSIFICATION_2022} layout="vertical" margin={{ top: 10, right: 20, left: 70, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252a36" />
                <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="category" type="category" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="totalAccidents" name="Total Accidents" fill="#ff6a00" radius={[0, 4, 4, 0]} />
                <Bar dataKey="fatalities" name="Fatalities" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 4: Hourly Circadian Collision Profile (MoRTH 2022) */}
      {activeView === 'hourly' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>24-Hour Time of Day Crash Frequency &amp; Risk Concentration (MoRTH 2022)</span>
            <span className="font-mono text-brand-orange">Peak Crash Hours: 18:00 – 21:00 (20.2%)</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MORTH_HOURLY_DISTRIBUTION} margin={{ top: 10, right: 10, left: -15, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252a36" />
                <XAxis dataKey="timeRange" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="share" name="% of Total Accidents" radius={[4, 4, 0, 0]}>
                  {MORTH_HOURLY_DISTRIBUTION.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.riskLevel === 'Severe' ? '#ef4444' : entry.riskLevel === 'High' ? '#ff6a00' : '#06b6d4'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-750">
              <strong className="text-red-400 block mb-1">Peak Frequency Sector (18:00 – 21:00):</strong>
              93,185 collisions occur during dusk-to-night transition due to commuter rush, lighting drop, and pedestrian crossing conflicts.
            </div>
            <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-750">
              <strong className="text-amber-400 block mb-1">High Severity Sector (00:00 – 06:00):</strong>
              While crash frequency drops to 14.0%, fatality rates surge due to high freight speed differentials, driver fatigue, and poor fog visibility.
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: Contributing Causes (MoRTH 2022) */}
      {activeView === 'causes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Primary Causative Factors in Indian Collisions (MoRTH 2022)
              </h4>
              <div className="space-y-2.5">
                {MORTH_CAUSATIVE_FACTORS.map((c) => (
                  <div key={c.cause} className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-750 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></span>
                        <span>{c.cause}</span>
                      </span>
                      <span className="font-mono font-bold" style={{ color: c.color }}>
                        {c.percentage}% ({c.accidents.toLocaleString()})
                      </span>
                    </div>
                    <div className="w-full bg-charcoal-800 h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${c.percentage}%`, backgroundColor: c.color }}></div>
                    </div>
                    <span className="text-[10px] text-slate-400 block text-right font-mono">
                      Fatalities: {c.fatalities.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-charcoal-900/90 border border-charcoal-750 flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2 text-white font-bold">
                  <ShieldAlert className="w-4 h-4 text-brand-orange" />
                  <span>Key Empirical Insights from MoRTH Registry:</span>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-slate-400 leading-relaxed">
                  <li>
                    <strong className="text-slate-200">Over-Speeding Dominance:</strong> Accounts for over 72.3% of all recorded road crashes in India (333,282 accidents and 119,904 deaths in 2022).
                  </li>
                  <li>
                    <strong className="text-slate-200">Adverse Weather Compound Effect:</strong> Rain, fog, and poor visibility contribute to 17.0% of highway fatal collisions, predominantly in northern and coastal states.
                  </li>
                  <li>
                    <strong className="text-slate-200">Vulnerable Road Users:</strong> Two-wheelers and pedestrians accounted for 44.5% and 19.5% of total fatalities nationwide.
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Dataset Standard: MoRTH Official Transport Research Wing</span>
                <span className="font-mono text-cyan-400">100% Non-Simulated</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dataset Provenance & Citation Footer (Requirement 1 & 6) */}
      <div className="pt-4 border-t border-charcoal-750/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>
            <strong>Official Provenance:</strong> {MORTH_METADATA.citation}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href={MORTH_METADATA.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
          >
            <span>MoRTH Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={MORTH_METADATA.openDataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
          >
            <span>Data.gov.in (OGD)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-500 font-mono">{MORTH_METADATA.license}</span>
        </div>
      </div>

    </div>
  );
}
