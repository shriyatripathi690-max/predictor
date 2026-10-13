import React from 'react';
import { ShieldAlert, ExternalLink, ShieldCheck, Scale } from 'lucide-react';

export function Footer({ onOpenPrivacy, onOpenTerms }) {
  const currentYear = 2026;

  return (
    <footer className="mt-16 border-t border-charcoal-750/80 bg-charcoal-900/95 py-10 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Grid: Brand & Description, Navigation, and Legal & Attributions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand & Mission Summary (Col 1-5) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-orange to-red-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-orange/20 ring-1 ring-brand-orange/40">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">SafeRoad AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
                Analytics
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Empirical road safety intelligence and accident prediction platform designed to visualize national crash patterns, identify high-risk highway blackspots, and calculate corridor risk scores based on official Ministry of Road Transport and Highways (MoRTH) data.
            </p>

            <div className="pt-1 flex items-center space-x-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Client-Side Privacy Architecture</span>
            </div>
          </div>

          {/* Platform Sections Navigation (Col 6-8) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#overview" className="hover:text-white transition">Dashboard Overview</a>
              </li>
              <li>
                <a href="#predictor" className="hover:text-white transition">Corridor Risk Engine</a>
              </li>
              <li>
                <a href="#hotspots" className="hover:text-white transition">GIS Blackspots Map</a>
              </li>
              <li>
                <a href="#journey" className="hover:text-white transition">Journey Safety Mode</a>
              </li>
              <li>
                <a href="#trends" className="hover:text-white transition">MoRTH Historical Analytics</a>
              </li>
            </ul>
          </div>

          {/* Legal, Privacy & Inquiries (Col 9-12) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Legal &amp; Transparency
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="flex items-center space-x-1.5 text-slate-300 hover:text-brand-orange transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Privacy Policy &amp; Data Handling</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="flex items-center space-x-1.5 text-slate-300 hover:text-brand-orange transition cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Terms and Conditions &amp; Safety Disclaimer</span>
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/shriyatripathi690-max/predictor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition"
                >
                  <svg className="w-3.5 h-3.5 text-slate-400 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>Platform Repository &amp; Issue Tracker</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>

            <div className="pt-2 text-[11px] text-slate-400 leading-normal border-t border-charcoal-750/70">
              <strong className="text-slate-300">Important Disclaimer:</strong> All risk scores and hazard classifications are informational statistical estimates and do not guarantee roadway safety. Always follow local traffic laws.
            </div>
          </div>

        </div>

        {/* Bottom Attribution & Copyright Row */}
        <div className="pt-6 border-t border-charcoal-750/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            &copy; {currentYear} SafeRoad AI. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400">
            <span>Data Sources: MoRTH &amp; NHAI (Govt. of India)</span>
            <span>•</span>
            <span>Routing: OSRM</span>
            <span>•</span>
            <span>Cartography: &copy; OpenStreetMap contributors</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
