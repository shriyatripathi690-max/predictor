import React from 'react';
import { 
  LayoutGrid, 
  Navigation, 
  ClipboardList,
  Building2,
  Menu,
  Route
} from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }) {
  const primaryNavItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutGrid },
    { id: 'predictor', label: 'Corridor Risk Engine', icon: ClipboardList, targetId: 'predictor' },
    { id: 'hotspots', label: 'GIS Hotspots Map', icon: Navigation, targetId: 'hotspots' },
    { id: 'journey', label: 'Journey Safety Mode', icon: Route, targetId: 'journey' },
    { id: 'trends', label: 'Historical Analytics', icon: Building2, targetId: 'trends' },
  ];

  const handleNavClick = (id, targetId) => {
    setActiveTab(id);
    const scrollTarget = targetId || id;
    const element = document.getElementById(scrollTarget);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="hidden lg:flex flex-col items-center justify-between w-16 min-h-screen bg-charcoal-900 border-r border-charcoal-750/70 py-4 shrink-0 z-40 select-none sticky top-0 h-screen">
      
      {/* Top Primary Navigation Stack */}
      <div className="flex flex-col items-center w-full">
        {/* Primary Vertical Navigation Stack */}
        <nav className="flex flex-col items-center space-y-2 w-full px-2">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.targetId)}
                className={`group relative p-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-charcoal-800 text-brand-orange shadow-inner ring-1 ring-brand-orange/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-charcoal-800/60'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-orange rounded-r-full shadow-glow-orange"></span>
                )}

                {/* Floating Dark Tooltip */}
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-charcoal-850 text-white text-xs font-medium whitespace-nowrap shadow-xl border border-charcoal-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Auxiliary Controls: SR Badge & Hamburger Menu */}
      <div className="flex flex-col items-center space-y-3.5 w-full pb-2">
        {/* User / Org Initials Avatar Badge */}
        <div 
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-orange to-brand-amber text-charcoal-950 font-black text-xs flex items-center justify-center ring-2 ring-charcoal-800 shadow-md cursor-pointer select-none hover:scale-105 transition-transform"
          title="SafeRoad AI Intelligence"
        >
          SR
        </div>

        {/* Menu Hamburger Icon */}
        <button
          onClick={() => {
            const el = document.getElementById('overview');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-2 text-slate-400 hover:text-white hover:bg-charcoal-800/60 rounded-xl transition cursor-pointer"
          title="Dashboard Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

    </aside>
  );
}

