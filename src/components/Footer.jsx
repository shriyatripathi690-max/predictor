import React from 'react';
import { ShieldAlert } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-charcoal-750/80 bg-charcoal-900/90 py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand & Description */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-orange to-red-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-orange/20">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">SafeRoad AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Predictive road safety intelligence platform designed to evaluate accident probability, highlight high-risk corridors, and prescribe dynamic engineering interventions.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
