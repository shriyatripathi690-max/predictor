import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CarFront, 
  HeartPulse, 
  MapPin, 
  Gauge, 
  ShieldAlert, 
  Route, 
  AlertOctagon, 
  CheckCircle2 
} from 'lucide-react';

export function MetricCard({ metric }) {
  const { title, value, subtext, change, isPositive, status, badgeText, onClick, icon: CustomIcon } = metric;

  const getCardIcon = () => {
    // 1. If explicit icon provided on metric
    if (CustomIcon) {
      let iconColor = 'text-brand-orange';
      if (metric.id === 'route_fatal_accidents' || status === 'severe') {
        iconColor = 'text-red-400';
      } else if (metric.id === 'route_verified_blackspots') {
        iconColor = 'text-amber-400';
      } else if (metric.id === 'route_risk_score') {
        iconColor = status === 'severe' ? 'text-red-400' : status === 'moderate' ? 'text-amber-400' : 'text-emerald-400';
      } else if (status === 'safe') {
        iconColor = 'text-emerald-400';
      }
      return <CustomIcon className={`w-5 h-5 ${iconColor}`} />;
    }

    // 2. Identify by ID or title for distinct meaningful iconography
    if (metric.id === 'route_total_accidents' || (title && title.includes('Total') && title.includes('Accident'))) {
      return <CarFront className="w-5 h-5 text-brand-orange" />;
    }
    if (metric.id === 'route_fatal_accidents' || (title && title.includes('Fatal'))) {
      return <HeartPulse className="w-5 h-5 text-red-400" />;
    }
    if (metric.id === 'route_verified_blackspots' || (title && title.includes('Blackspot'))) {
      return <MapPin className="w-5 h-5 text-amber-400" />;
    }
    if (metric.id === 'route_risk_score' || (title && title.includes('Risk Score'))) {
      const riskColor = status === 'severe' ? 'text-red-400' : status === 'moderate' ? 'text-amber-400' : 'text-emerald-400';
      return <Gauge className={`w-5 h-5 ${riskColor}`} />;
    }

    // Fallback status icon
    switch (status) {
      case 'severe':
        return <AlertOctagon className="w-5 h-5 text-red-400" />;
      case 'moderate':
        return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'safe':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      default:
        return <Route className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getBorderAccent = () => {
    switch (status) {
      case 'severe':
        return 'hover:border-red-500/50 group-hover:shadow-red-500/5';
      case 'moderate':
        return 'hover:border-brand-amber/50 group-hover:shadow-brand-amber/5';
      case 'safe':
        return 'hover:border-emerald-500/50 group-hover:shadow-emerald-500/5';
      default:
        return 'hover:border-brand-orange/50 group-hover:shadow-brand-orange/5';
    }
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`group relative charcoal-card rounded-2xl p-5 border border-charcoal-750/90 shadow-card-dark transition-all duration-200 hover:-translate-y-1 hover:border-charcoal-700 ${getBorderAccent()} ${
        onClick ? 'cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-brand-orange/50' : ''
      }`}
    >
      {/* Subtle Top Accent Highlight on Hover */}
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-brand-orange/40 transition-colors"></div>

      {/* Top Row: Icon and optional status badge */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750/80 group-hover:scale-105 transition-transform">
          {getCardIcon()}
        </div>

        {badgeText && (
          <span
            className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border tracking-wider uppercase transition-colors ${
              badgeText === 'LIVE OSRM'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 group-hover:bg-emerald-500/20'
                : badgeText === 'CACHED'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 group-hover:bg-amber-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </h3>
        <p className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
          {value}
        </p>
      </div>

      {/* Bottom Row: Trend and Subtext */}
      <div className="mt-4 pt-3.5 border-t border-charcoal-750/70 flex items-center justify-between text-xs">
        <div className={`flex items-center space-x-1.5 font-bold ${isPositive ? 'text-emerald-400' : 'text-brand-orange'}`}>
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>{change}</span>
        </div>
        <span className="text-slate-400 truncate max-w-[140px] text-right text-[11px]" title={subtext}>
          {subtext}
        </span>
      </div>

    </div>
  );
}

