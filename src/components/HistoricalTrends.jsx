import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  PieChart, 
  ShieldCheck
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
  Legend
} from 'recharts';
import { 
  SAMPLE_HISTORICAL_MONTHLY, 
  SAMPLE_HOURLY_RISK, 
  SAMPLE_CAUSES_BREAKDOWN 
} from '../data/sampleData';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-900 border border-navy-700 p-3 rounded-lg shadow-xl text-xs">
        <p className="font-bold text-white mb-1.5">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3 font-mono">
            <span className="flex items-center gap-1.5" style={{ color: item.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
              {item.name}:
            </span>
            <span className="font-bold text-white">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function HistoricalTrends() {
  const [activeView, setActiveView] = useState('monthly'); // 'monthly' | 'hourly' | 'causes'

  return (
    <div className="bg-navy-850/90 rounded-2xl border border-navy-750 shadow-xl p-5 sm:p-7 backdrop-blur-md">
      
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-750/80 pb-5 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Historical Safety Analytics & Trends
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-navy-900 text-orange-400 border border-navy-750">
              Sample Data
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated historical collision patterns and hazard distribution models.
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center bg-navy-900 p-1 rounded-xl border border-navy-750">
          <button
            onClick={() => setActiveView('monthly')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeView === 'monthly'
                ? 'bg-navy-800 text-orange-400 shadow-sm border border-navy-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>12-Month Trend</span>
          </button>

          <button
            onClick={() => setActiveView('hourly')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeView === 'hourly'
                ? 'bg-navy-800 text-orange-400 shadow-sm border border-navy-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Circadian Profile</span>
          </button>

          <button
            onClick={() => setActiveView('causes')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeView === 'causes'
                ? 'bg-navy-800 text-orange-400 shadow-sm border border-navy-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Root Factors</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-72 sm:h-80">
        {activeView === 'monthly' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SAMPLE_HISTORICAL_MONTHLY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorSevere" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorPreventable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2F68" opacity={0.4} />
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                formatter={(val) => <span className="text-xs text-slate-300 mr-2">{val}</span>} 
              />
              <Area 
                type="monotone" 
                dataKey="totalIncidents" 
                name="Total Collisions" 
                stroke="#F97316" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
              <Area 
                type="monotone" 
                dataKey="severeIncidents" 
                name="Severe / Critical" 
                stroke="#EF4444" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSevere)" 
              />
              <Area 
                type="monotone" 
                dataKey="preventable" 
                name="Simulated Preventable" 
                stroke="#10B981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPreventable)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeView === 'hourly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SAMPLE_HOURLY_RISK} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2F68" opacity={0.4} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="riskIndex" 
                name="Hourly Risk Index (/100)" 
                fill="#F97316" 
                radius={[6, 6, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeView === 'causes' && (
          <div className="h-full flex flex-col justify-center space-y-4 px-2">
            {SAMPLE_CAUSES_BREAKDOWN.map((item, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-200">{item.name}</span>
                  <span className="font-mono font-bold text-white">{item.percentage}% of simulated incidents</span>
                </div>
                <div className="w-full h-2.5 bg-navy-900 rounded-full overflow-hidden border border-navy-800">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytical Insights Highlights */}
      <div className="mt-6 pt-4 border-t border-navy-750/80 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-750 text-xs">
          <div className="flex items-center space-x-1.5 text-orange-400 font-semibold mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Monsoon Spike (Jun - Aug)</span>
          </div>
          <p className="text-slate-300 text-[11px]">
            Hydroplaning and wet friction reduction elevate collision volume by 46% during seasonal rains.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-750 text-xs">
          <div className="flex items-center space-x-1.5 text-red-400 font-semibold mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Circadian Peak (20:00 - 04:00)</span>
          </div>
          <p className="text-slate-300 text-[11px]">
            Compounding factors of speed differentials and unlit corridors cause the highest fatality indices at night.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-750 text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Predictive Mitigation Potential</span>
          </div>
          <p className="text-slate-300 text-[11px]">
            76.8% of high-risk scenarios are preventable via real-time variable speed limit advisories.
          </p>
        </div>
      </div>

    </div>
  );
}
