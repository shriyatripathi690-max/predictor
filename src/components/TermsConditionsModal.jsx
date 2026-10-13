import React, { useEffect } from 'react';
import { X, ShieldAlert, Scale, AlertCircle } from 'lucide-react';

export function TermsConditionsModal({ isOpen, onClose }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-charcoal-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-conditions-title"
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-charcoal-900 border border-charcoal-750 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-charcoal-750 bg-charcoal-850/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 id="terms-conditions-title" className="text-lg font-bold text-white tracking-tight">
                Terms and Conditions
              </h2>
              <p className="text-xs text-slate-400">
                SafeRoad AI Platform Usage Terms &amp; Safety Disclaimer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-charcoal-750 border border-charcoal-700/60 transition cursor-pointer"
            aria-label="Close Terms and Conditions dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          
          {/* Owner Legal Review Notice */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold text-amber-300 block">Notice for Platform Operators:</strong>
              <p>
                These terms provide operational disclaimers for the SafeRoad AI analytics system. Before binding users in commercial production or government deployment, have this document reviewed by legal counsel in your operating region.
              </p>
            </div>
          </div>

          {/* Critical Safety Notice Box */}
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold text-red-300 block">Crucial Road Safety Limitation:</strong>
              <p>
                Risk scores, factor contributions, and prescriptive advisories provided by SafeRoad AI are <strong>informational statistical estimates only</strong>. They do not constitute a guarantee of road safety, nor do they guarantee that an accident will or will not occur on any given roadway.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
              <span>1. Acceptance of Terms</span>
            </h3>
            <p>
              By accessing or using SafeRoad AI, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. If you do not agree with any part of these terms, do not access or use the platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
              <span>2. Purpose &amp; Scope of the Platform</span>
            </h3>
            <p>
              SafeRoad AI is designed to assist traffic safety planners, civil engineers, researchers, and drivers by visualizing historical crash trends (MoRTH), identifying high-density accident blackspots (NHAI), and evaluating simulated hazard factors using AASHTO Highway Safety Manual heuristics.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
              <span>3. User Responsibilities &amp; Safe Driving Rules</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 text-xs pl-2">
              <li>
                <strong className="text-slate-200">No In-Motion Interaction:</strong> Never configure routes, adjust simulation parameters, or interact with this application while actively operating a motor vehicle or bicycle. Set up your route before departing or pull over safely in a designated parking area.
              </li>
              <li>
                <strong className="text-slate-200">Legal Compliance:</strong> Drivers remain solely responsible for adhering to posted speed limits, roadway signage, traffic signals, seatbelt regulations, and all motor vehicle laws.
              </li>
              <li>
                <strong className="text-slate-200">Independent Judgment:</strong> Weather conditions, unexpected construction, debris, and unpredictable driver behavior can alter safety in seconds. Always prioritize real-world sensory observation and defensive driving over any digital simulation.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
              <span>4. Data Limitations &amp; Third-Party Services</span>
            </h3>
            <p>
              Accident statistics and blackspot locations are based on public historical records published by the Ministry of Road Transport and Highways (MoRTH, 2018–2022). While verified against official government reports, records may have reporting delays or regional variations. Routing information (OSRM) and weather feeds (Open-Meteo) are provided by third parties and may be subject to occasional interruption.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
              <span>5. Disclaimer of Warranties</span>
            </h3>
            <p>
              SafeRoad AI is provided on an "as is" and "as available" basis without warranties of any kind, whether express, implied, or statutory, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
              <span>6. Limitation of Liability</span>
            </h3>
            <p>
              To the fullest extent permitted by applicable law, the authors, developers, and platform maintainers shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages, including traffic accidents, personal injury, property loss, or travel delays arising out of or related to the use of or inability to use this platform.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
              <span>7. Changes to Terms</span>
            </h3>
            <p>
              The operators reserve the right to revise or update these Terms and Conditions at any time. Continued use of the platform after updates indicates acceptance of the revised terms.
            </p>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-charcoal-750 bg-charcoal-850/90 shrink-0">
          <span className="text-[11px] text-slate-400 font-mono">
            Last Updated: October 2026
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-charcoal-750 hover:bg-charcoal-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
