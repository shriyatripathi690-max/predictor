import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  MapPin, 
  BarChart3, 
  Sliders, 
  Menu, 
  X,
  BellRing,
  Route,
  Database
} from 'lucide-react';

export function Navbar({ 
  activeTab, 
  setActiveTab, 
  unreadAlertsCount, 
  onToggleAlerts,
  onOpenDatasetModal 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'predictor', label: 'Risk Predictor', icon: Sliders },
    { id: 'hotspots', label: 'Hotspot Map', icon: MapPin },
    { id: 'journey', label: 'Journey Safety', icon: Route },
    { id: 'trends', label: 'Historical Analytics', icon: BarChart3 },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-charcoal-900/90 backdrop-blur-xl border-b border-charcoal-750/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleNavClick('overview')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-red-600 flex items-center justify-center shadow-lg shadow-brand-orange/20 ring-1 ring-brand-orange/40 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-slate-100 transition-colors">SafeRoad</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
                  AI Analytics
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Road Accident Risk Prediction & Safety Analytics
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-charcoal-800 text-brand-orange shadow-inner border border-charcoal-700/80'
                      : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-orange' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center space-x-2.5">
            {/* Dataset Integration & Import Trigger */}
            <button
              onClick={onOpenDatasetModal}
              title="Official MoRTH Data & Dataset Import"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 text-slate-200 hover:text-white border border-charcoal-750 transition-colors text-xs font-semibold cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-brand-orange" />
              <span className="hidden sm:inline">Datasets &amp; Import</span>
            </button>

            {/* Notification Bell Button */}
            <button
              onClick={onToggleAlerts}
              title="Toggle Simulated Alerts Banner"
              className="relative p-2 rounded-xl bg-charcoal-850 text-slate-300 hover:text-white hover:bg-charcoal-800 border border-charcoal-750 transition-colors cursor-pointer"
            >
              <BellRing className="w-4 h-4 text-brand-orange" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-red text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-charcoal-900">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-charcoal-850 text-slate-300 hover:text-white border border-charcoal-750 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-charcoal-900 border-b border-charcoal-750 px-4 pt-3 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-charcoal-800 text-brand-orange border border-charcoal-700'
                    : 'text-slate-300 hover:bg-charcoal-850'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenDatasetModal) onOpenDatasetModal();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-charcoal-850"
          >
            <Database className="w-4 h-4 text-brand-orange" />
            <span>Datasets &amp; Import</span>
          </button>
        </div>
      )}
    </header>
  );
}
