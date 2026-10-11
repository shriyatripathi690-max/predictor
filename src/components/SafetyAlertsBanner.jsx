import React, { useState } from 'react';
import { AlertTriangle, Info, X, ChevronRight } from 'lucide-react';
import { SAMPLE_SYSTEM_ALERTS } from '../data/sampleData';

export function SafetyAlertsBanner({ isVisible, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isVisible) return null;

  const currentAlert = SAMPLE_SYSTEM_ALERTS[currentIndex] || SAMPLE_SYSTEM_ALERTS[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SAMPLE_SYSTEM_ALERTS.length);
  };

  const getAlertStyle = (level) => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-charcoal-900/95 border-brand-red/50 text-red-200',
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: <AlertTriangle className="w-4 h-4 text-brand-red shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'bg-charcoal-900/95 border-brand-orange/50 text-orange-200',
          badge: 'bg-brand-orange/20 text-brand-orange border-brand-orange/40',
          icon: <AlertTriangle className="w-4 h-4 text-brand-orange shrink-0" />,
        };
      default:
        return {
          bg: 'bg-charcoal-900/95 border-charcoal-700 text-slate-200',
          badge: 'bg-charcoal-800 text-slate-300 border-charcoal-700',
          icon: <Info className="w-4 h-4 text-brand-orange shrink-0" />,
        };
    }
  };

  const style = getAlertStyle(currentAlert.level);

  return (
    <div className={`border-b transition-all duration-200 backdrop-blur-md ${style.bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
          
          <div className="flex items-center gap-2.5 min-w-0">
            {style.icon}
            
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border shrink-0 ${style.badge}`}>
              Simulated Advisory
            </span>
            
            <p className="truncate text-slate-200 font-medium text-xs sm:text-sm">
              <strong className="text-white font-bold mr-1.5">{currentAlert.title}:</strong>
              <span className="text-slate-300 hidden sm:inline">{currentAlert.message}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
              Alert {currentIndex + 1} of {SAMPLE_SYSTEM_ALERTS.length}
            </span>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700 transition cursor-pointer"
              title="View next simulated alert"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3 text-brand-orange" />
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
