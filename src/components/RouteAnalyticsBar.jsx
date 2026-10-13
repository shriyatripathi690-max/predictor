import React from 'react';
import { 
  Route, 
  SlidersHorizontal, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useJourney } from '../context/JourneyContext.jsx';
import { PREDEFINED_ROUTES } from '../services/routeAccidentMatcher.js';

export function RouteAnalyticsBar() {
  const { 
    currentJourney, 
    selectedRouteId, 
    selectRouteById, 
    bufferDistanceKm, 
    setBufferDistanceKm, 
    historicalPeriod, 
    setHistoricalPeriod, 
    routeMetrics
  } = useJourney();

  return (
    <div className="charcoal-card rounded-2xl border border-charcoal-750/90 p-4 sm:p-5 shadow-card-dark bg-charcoal-900/90 backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Active Route Indicator & Route Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-brand-orange/15 text-brand-orange border border-brand-orange/30 shrink-0 self-start sm:self-center">
            <Route className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Active Route Corridor</span>
              </span>

              {currentJourney?.routeData?.distanceKm && (
                <span className="text-[10px] font-mono text-slate-400 font-semibold">
                  • {currentJourney.routeData.distanceKm} km drivable geometry
                </span>
              )}
            </div>

            {/* Route Selector Dropdown */}
            <div className="flex items-center space-x-2 pt-0.5">
              <select
                value={selectedRouteId}
                onChange={(e) => selectRouteById(e.target.value)}
                className="bg-charcoal-850 hover:bg-charcoal-800 text-white font-bold text-xs sm:text-sm px-3 py-1.5 rounded-xl border border-charcoal-700 focus:outline-none focus:border-brand-orange cursor-pointer transition max-w-full sm:max-w-md"
              >
                {PREDEFINED_ROUTES.map((route) => (
                  <option key={route.id} value={route.id} className="bg-charcoal-900 text-white">
                    {route.name} ({route.distanceKm} km)
                  </option>
                ))}
                {currentJourney?.id?.startsWith('JRN-') && !PREDEFINED_ROUTES.some(r => r.id === selectedRouteId) && (
                  <option value="custom" className="bg-charcoal-900 text-white">
                    Custom Route: {currentJourney.origin?.name} → {currentJourney.destination?.name}
                  </option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Right: Configurable Corridor Buffer & Historical Period Filters */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-charcoal-800/80">
          
          {/* Buffer Distance Dropdown */}
          <div className="flex items-center space-x-1.5 bg-charcoal-850 px-3 py-1.5 rounded-xl border border-charcoal-750">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-orange shrink-0" />
            <span className="text-[10px] text-slate-400 font-mono uppercase">Buffer:</span>
            <select
              value={bufferDistanceKm}
              onChange={(e) => setBufferDistanceKm(Number(e.target.value))}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value={2} className="bg-charcoal-900 text-white">2 km corridor</option>
              <option value={5} className="bg-charcoal-900 text-white">5 km (Standard)</option>
              <option value={10} className="bg-charcoal-900 text-white">10 km buffer</option>
              <option value={15} className="bg-charcoal-900 text-white">15 km regional</option>
            </select>
          </div>

          {/* Historical Period Filter */}
          <div className="flex items-center space-x-1.5 bg-charcoal-850 px-3 py-1.5 rounded-xl border border-charcoal-750">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[10px] text-slate-400 font-mono uppercase">Period:</span>
            <select
              value={historicalPeriod}
              onChange={(e) => setHistoricalPeriod(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-charcoal-900 text-white">2018–2022 (5 Years)</option>
              <option value="2020_2022" className="bg-charcoal-900 text-white">2020–2022 (3 Years)</option>
              <option value="2022" className="bg-charcoal-900 text-white">2022 (Latest Year)</option>
            </select>
          </div>

          {/* Quick status badge */}
          {routeMetrics && (
            <div className={`hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              routeMetrics.riskScore !== null
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              {routeMetrics.riskScore !== null ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{routeMetrics.verifiedBlackspotsCount} nodes matched</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Data gap (0 nodes)</span>
                </>
              )}
            </div>
          )}

          {/* Jump to Journey Mode link */}
          <a
            href="#journey"
            className="flex items-center space-x-1 text-brand-orange hover:text-orange-300 text-xs font-bold transition px-2 py-1"
            title="Open Journey Safety Mode to enter custom route coordinates"
          >
            <span>Plan Custom Route</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>

        </div>

      </div>

      {/* Explanatory subtitle for data integrity */}
      <div className="mt-3 pt-2.5 border-t border-charcoal-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            The 4 cards below display <strong>actual historical road accident records</strong> spatially matched to this route within {bufferDistanceKm} km.
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400 mt-1 sm:mt-0">
          Source: MoRTH &amp; NHAI Blackspot Registry
        </span>
      </div>
    </div>
  );
}
