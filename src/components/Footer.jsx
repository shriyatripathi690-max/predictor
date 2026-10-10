import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-navy-750/80 bg-navy-900/90 py-10 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-navy-800">
          
          {/* Brand & Mission */}
          <div className="space-y-2 max-w-md">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">SafeRoad AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-semibold uppercase">
                Hackathon Prototype
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Predictive road safety intelligence platform designed to evaluate accident probability, highlight high-risk corridors, and prescribe dynamic engineering interventions.
            </p>
          </div>

          {/* Tech Stack Specs */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
              Frontend Architecture (Stage 1)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['React 19', 'Vite', 'Tailwind CSS', 'Recharts', 'Lucide React'].map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-md bg-navy-850 text-slate-300 border border-navy-750 font-mono text-[11px]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <Info className="w-3.5 h-3.5 text-orange-400/80 shrink-0" />
            <span>
              All metrics, geolocations, and risk indices are simulated benchmarks for stage 1 hackathon review.
            </span>
          </div>

          <div className="text-slate-400 font-mono">
            Stage 1 UI Build • Next: Stage 2 ML Model Integration
          </div>
        </div>

      </div>
    </footer>
  );
}
