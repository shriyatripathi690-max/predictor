import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  MapPin, 
  BarChart3, 
  Sliders, 
  Menu, 
  X,
  BellRing
} from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, unreadAlertsCount, onToggleAlerts }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'predictor', label: 'Risk Predictor', icon: Sliders },
    { id: 'hotspots', label: 'Hotspot Map', icon: MapPin },
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
    <header className="sticky top-0 z-50 bg-navy-900/90 backdrop-blur-md border-b border-navy-750">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-1 ring-orange-400/40">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">SafeRoad</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  AI Core
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Road Accident Risk Prediction & Safety Analytics
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-navy-800 text-white shadow-inner border border-navy-700 shadow-orange-500/5'
                      : 'text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center space-x-3">
            {/* Stage 1 Prototype Pill */}
            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-navy-850 border border-navy-700/80 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Stage 1 Prototype</span>
              <span className="text-[10px] text-slate-400 border-l border-navy-700 pl-1.5 font-mono">Sample Data</span>
            </div>

            {/* Notification Bell Button */}
            <button
              onClick={onToggleAlerts}
              title="Toggle Simulated Alerts Banner"
              className="relative p-2 rounded-lg bg-navy-850 text-slate-300 hover:text-white hover:bg-navy-800 border border-navy-750 transition-colors"
            >
              <BellRing className="w-4 h-4 text-orange-400" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-navy-850 text-slate-300 hover:text-white border border-navy-750"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-900 border-b border-navy-750 px-4 pt-2 pb-4 space-y-1">
          <div className="pb-2 border-b border-navy-800 mb-2">
            <span className="text-xs text-orange-400 font-medium uppercase tracking-wider">
              Hackathon Prototype Mode (Sample Data)
            </span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-navy-800 text-orange-400 border border-navy-700'
                    : 'text-slate-300 hover:bg-navy-850'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}

