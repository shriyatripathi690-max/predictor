import React, { useEffect } from 'react';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';

export function PrivacyPolicyModal({ isOpen, onClose }) {
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
      aria-labelledby="privacy-policy-title"
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-charcoal-900 border border-charcoal-750 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-charcoal-750 bg-charcoal-850/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="privacy-policy-title" className="text-lg font-bold text-white tracking-tight">
                Privacy Policy
              </h2>
              <p className="text-xs text-slate-400">
                SafeRoad AI Data Handling &amp; Client-Side Architecture Disclosure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-charcoal-750 border border-charcoal-700/60 transition cursor-pointer"
            aria-label="Close Privacy Policy dialog"
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
                This policy accurately describes the current client-side implementation of SafeRoad AI. Before deploying commercial operations, user authentication, or server-side database storage, retain qualified legal counsel to adapt these terms to your jurisdiction.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
              <span>1. Overview &amp; Architecture</span>
            </h3>
            <p>
              SafeRoad AI is an open roadway accident risk prediction and decision support platform. The application operates primarily as a client-side web application. We do not require account registration, usernames, passwords, or personal identity profiles to access risk estimates and geospatial maps.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
              <span>2. Information We Handle</span>
            </h3>
            <div className="space-y-3 pl-3 border-l-2 border-charcoal-750">
              <div>
                <strong className="text-white font-semibold">Browser Geolocation:</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  When you explicitly click "Locate Me", your browser's HTML5 Geolocation API requests your geographic coordinates (latitude and longitude). These coordinates are processed locally in your browser memory solely to center the GIS hotspot map or set a starting point. Your coordinates are never stored in a remote database or shared with advertising networks.
                </p>
              </div>
              <div>
                <strong className="text-white font-semibold">Route &amp; Destination Inputs:</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  When you plan a journey corridor, origin and destination coordinates are sent to public routing services (Open Source Routing Machine - OSRM) solely to calculate the navigable highway polyline and distance. No personal identifiers are attached to these routing requests.
                </p>
              </div>
              <div>
                <strong className="text-white font-semibold">Atmospheric Weather Telemetry:</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  Corridor coordinates are checked against the Open-Meteo public API to fetch current weather parameters (precipitation, temperature, wind speed). No personal data is transmitted.
                </p>
              </div>
              <div>
                <strong className="text-white font-semibold">Custom Dataset Imports:</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  When you import custom CSV blackspot files, parsing and validation occur entirely within your browser via PapaParse. Imported data stays in client memory and browser localStorage; it is never uploaded to external servers.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
              <span>3. Cookies &amp; Tracking Technologies</span>
            </h3>
            <p>
              SafeRoad AI does not use third-party tracking cookies, advertising pixels, or cross-site fingerprinting tools. We utilize standard browser local storage (`localStorage`) solely to preserve your active corridor preferences, map buffer settings, and custom CSV imports between page reloads. You can clear this data at any time through your browser settings or by clicking the "Reset" button.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
              <span>4. Third-Party Services</span>
            </h3>
            <p>
              The platform interfaces with open cartographic and meteorological services:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs pl-2">
              <li><strong>OpenStreetMap:</strong> Map background tiles rendered via Leaflet under ODbL license.</li>
              <li><strong>Project OSRM:</strong> Public road network geometry queries.</li>
              <li><strong>Open-Meteo:</strong> Open-access weather forecast and observation data.</li>
              <li><strong>MoRTH &amp; NHAI:</strong> Public accident benchmarks published by the Ministry of Road Transport and Highways, Government of India.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
              <span>5. Data Retention &amp; User Controls</span>
            </h3>
            <p>
              Because data processing occurs client-side, SafeRoad AI does not retain personal records. You retain full control over your inputs: refreshing the session or clearing browser storage instantly resets all stored parameters to official benchmark defaults.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
              <span>6. Contact Information</span>
            </h3>
            <p>
              For questions regarding this privacy disclosure or platform data handling, please refer to the project repository documentation or contact the platform maintainers.
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
