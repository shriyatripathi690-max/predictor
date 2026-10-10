import React from 'react';
import { TrendingUp, TrendingDown, ShieldAlert, Route, AlertOctagon, CheckCircle2 } from 'lucide-react';

export function MetricCard({ metric }) {
  const { title, value, subtext, change, isPositive, status } = metric;

  const getStatusIcon = () => {
    switch (status) {
      case 'severe':
        return <AlertOctagon className="w-5 h-5 text-red-400" />;
      case 'moderate':
        return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'safe':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      default:
        return <Route className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBorderAccent = () => {
    switch (status) {
      case 'severe':
        return 'hover:border-red-500/40 group-hover:shadow-red-500/10';
      case 'moderate':
        return 'hover:border-amber-500/40 group-hover:shadow-amber-500/10';
      case 'safe':
        return 'hover:border-emerald-500/40 group-hover:shadow-emerald-500/10';
      default:
        return 'hover:border-blue-500/40 group-hover:shadow-blue-500/10';
    }
  };

  return (
    <div className={`group relative bg-navy-850/80 rounded-xl p-5 border border-navy-750/80 shadow-md backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 ${getBorderAccent()}`}>
      
      {/* Top Row: Icon + Sample Label */}
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-navy-900 border border-navy-750">
          {getStatusIcon()}
        </div>
        <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-navy-900/80 text-slate-400 border border-navy-750">
          Sample Benchmark
        </span>
      </div>

      {/* Main Metric Value */}
      <div className="space-y-1">
        <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </h3>
        <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
          {value}
        </p>
      </div>

      {/* Bottom Row: Trend and Subtext */}
      <div className="mt-4 pt-3 border-t border-navy-750/60 flex items-center justify-between text-xs">
        <div className={`flex items-center space-x-1 font-semibold ${isPositive ? 'text-emerald-400' : 'text-orange-400'}`}>
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>{change}</span>
        </div>
        <span className="text-slate-400 truncate max-w-[140px] text-right" title={subtext}>
          {subtext}
        </span>
      </div>

    </div>
  );
}

