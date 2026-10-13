import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { SafetyAlertsBanner } from './components/SafetyAlertsBanner';
import { MetricCard } from './components/MetricCard';
import { RouteAnalyticsBar } from './components/RouteAnalyticsBar';
import { RiskAnalysisForm } from './components/RiskAnalysisForm';
import { RiskResultCard } from './components/RiskResultCard';
import { AccidentHotspotsMap } from './components/AccidentHotspotsMap';
import { JourneySafetyMode } from './components/JourneySafetyMode';
import { MissionStatement } from './components/MissionStatement';
import { HistoricalTrends } from './components/HistoricalTrends';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MonitoredCorridorsModal } from './components/MonitoredCorridorsModal';
import { DatasetImportModal } from './components/DatasetImportModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsConditionsModal } from './components/TermsConditionsModal';
import { JourneyProvider, useJourney } from './context/JourneyContext';
import { calculateSimulatedRisk } from './utils/riskCalculator';
import { ShieldCheck, CarFront, HeartPulse, MapPin, Gauge } from 'lucide-react';

function DashboardContent() {
  const { 
    currentJourney, 
    hotspots,
    corridorMetrics, 
    datasetSourceInfo,
    routeMetrics,
    historicalPeriod,
    bufferDistanceKm,
    isPlanningJourney,
  } = useJourney();

  const [activeTab, setActiveTab] = useState('overview');
  const [showAlertsBanner, setShowAlertsBanner] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCorridorModal, setShowCorridorModal] = useState(false);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Synchronize hash routing for legal modals (#privacy, #terms)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#privacy') {
        setShowPrivacyModal(true);
      } else if (window.location.hash === '#terms') {
        setShowTermsModal(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Initial simulated evaluation state
  const initialFormState = {
    corridorName: 'NH-48 West Expressway (Km 42)',
    roadType: 'expressway',
    weather: 'heavy_rain',
    timeOfDay: 'late_night',
    lighting: 'unlit',
    surfaceCondition: 'waterlogged',
    trafficDensity: 'moderate',
    speedLimit: 100,
    userSpeed: 108,
    dangerousIntersections: 'moderate',
    pedestrianActivity: 'low',
    accidentHistory: 'frequent_collisions',
  };

  const [currentCorridorName, setCurrentCorridorName] = useState(initialFormState.corridorName);
  const [currentResult, setCurrentResult] = useState(() => calculateSimulatedRisk(initialFormState));

  // Automatically synchronize result when active journey evaluation changes
  useEffect(() => {
    if (currentJourney?.evaluationResult && typeof currentJourney.evaluationResult.score === 'number') {
      setCurrentResult(currentJourney.evaluationResult);
      setCurrentCorridorName(
        currentJourney.formInputs?.corridorName || 
        `${currentJourney.origin?.name} → ${currentJourney.destination?.name}`
      );
    } else if (currentJourney?.formInputs?.corridorName) {
      setCurrentCorridorName(currentJourney.formInputs.corridorName);
    }
  }, [currentJourney?.evaluationResult, currentJourney?.id, currentJourney?.formInputs?.corridorName]);

  // Handle Risk Analysis submission
  const handleAnalyze = (formData, evaluatedResult) => {
    setIsAnalyzing(true);
    setCurrentCorridorName(formData.corridorName);

    // Realistic brief computation delay
    setTimeout(() => {
      const result = (evaluatedResult && typeof evaluatedResult.score === 'number' && Array.isArray(evaluatedResult.factorContributions))
        ? evaluatedResult
        : calculateSimulatedRisk(formData);
      setCurrentResult(result);
      setIsAnalyzing(false);

      // Smooth scroll to result if on mobile
      if (window.innerWidth < 768) {
        const resultEl = document.getElementById('risk-result-section');
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 450);
  };

  // Handle selecting a hotspot from the map to populate predictor
  const handleSelectHotspotFromMap = (hotspot) => {
    setCurrentCorridorName(hotspot.name);
    
    const parsedSpeedLimit = parseInt(hotspot.speedLimit, 10) || 80;
    const parsedObservedSpeed = parseInt(hotspot.observedAvgSpeed, 10) || 92;

    const mockInputs = {
      corridorName: hotspot.name,
      roadType: (hotspot.type || hotspot.roadType || '').toLowerCase().includes('highway') ? 'expressway' : 'urban_arterial',
      weather: (hotspot.weatherImpact || '').toLowerCase().includes('rain') ? 'heavy_rain' : 'clear',
      timeOfDay: 'late_night',
      lighting: 'unlit',
      surfaceCondition: (hotspot.weatherImpact || '').toLowerCase().includes('water') ? 'waterlogged' : 'wet',
      trafficDensity: 'moderate',
      speedLimit: parsedSpeedLimit,
      userSpeed: parsedObservedSpeed,
      dangerousIntersections: 'moderate',
      pedestrianActivity: 'low',
      accidentHistory: 'frequent_collisions',
    };

    const calculated = calculateSimulatedRisk(mockInputs);
    setCurrentResult(calculated);

    const predictorEl = document.getElementById('predictor');
    if (predictorEl) {
      predictorEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to section helper
  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- The Four Route-Specific Historical Accident Dashboard Cards ---
  const dynamicMetrics = useMemo(() => {
    const isCalculating = isPlanningJourney || routeMetrics?.status === 'calculating';
    const isNoRoute = routeMetrics?.status === 'no_route';

    // Format historical period badge text
    const periodBadge = historicalPeriod === '2022' 
      ? '2022 ONLY' 
      : historicalPeriod === '2020_2022' 
      ? '2020–2022' 
      : '2018–2022';

    return [
      // Card 1: Total Historical Accidents along Route
      {
        id: 'route_total_accidents',
        title: 'Total Historical Accidents',
        icon: CarFront,
        value: isCalculating
          ? 'Calculating...'
          : isNoRoute
          ? 'No Route'
          : `${routeMetrics.totalAccidents.toLocaleString()} Collisions`,
        subtext: isNoRoute 
          ? 'Select a route corridor above' 
          : `Along ${routeMetrics.routeName} (${routeMetrics.routeDistanceKm} km)`,
        change: `${routeMetrics.bufferDistanceKm || bufferDistanceKm} km corridor buffer`,
        isPositive: routeMetrics.totalAccidents < 50,
        status: isCalculating ? 'normal' : routeMetrics.totalAccidents >= 80 ? 'severe' : routeMetrics.totalAccidents >= 30 ? 'moderate' : 'safe',
        badgeText: periodBadge,
        onClick: () => scrollToSection('hotspots'),
      },

      // Card 2: Fatal Accidents along Route
      {
        id: 'route_fatal_accidents',
        title: 'Fatal Accidents',
        icon: HeartPulse,
        value: isCalculating
          ? 'Calculating...'
          : isNoRoute
          ? 'No Route'
          : `${routeMetrics.fatalAccidents.toLocaleString()} Fatalities`,
        subtext: isNoRoute 
          ? 'Select a route corridor above' 
          : `${routeMetrics.severityRate}% severity rate along corridor`,
        change: `${routeMetrics.grievousInjuries || 0} severe injuries`,
        isPositive: false,
        status: isCalculating ? 'normal' : routeMetrics.fatalAccidents >= 30 ? 'severe' : routeMetrics.fatalAccidents > 0 ? 'moderate' : 'safe',
        badgeText: 'ROUTE FATALITIES',
        onClick: () => scrollToSection('hotspots'),
      },

      // Card 3: Verified Blackspots along Route
      {
        id: 'route_verified_blackspots',
        title: 'Verified Blackspots',
        icon: MapPin,
        value: isCalculating
          ? 'Calculating...'
          : isNoRoute
          ? 'No Route'
          : `${routeMetrics.verifiedBlackspotsCount} Nodes`,
        subtext: isNoRoute
          ? 'Select a route corridor above'
          : `${routeMetrics.highRiskBlackspotsCount} High/Severe priority zones`,
        change: `Within ${routeMetrics.bufferDistanceKm || bufferDistanceKm} km buffer`,
        isPositive: routeMetrics.verifiedBlackspotsCount === 0,
        status: isCalculating ? 'normal' : routeMetrics.verifiedBlackspotsCount >= 2 ? 'severe' : routeMetrics.verifiedBlackspotsCount > 0 ? 'moderate' : 'safe',
        badgeText: 'CORRIDOR NODES',
        onClick: () => scrollToSection('hotspots'),
      },

      // Card 4: Route Accident Risk Score (0 - 100 or "Insufficient data")
      {
        id: 'route_risk_score',
        title: 'Route Accident Risk Score',
        icon: Gauge,
        value: isCalculating
          ? 'Calculating...'
          : isNoRoute
          ? 'No Route'
          : routeMetrics.riskScore !== null
          ? `${routeMetrics.riskScore} / 100`
          : 'Insufficient data',
        subtext: isNoRoute
          ? 'Select a route corridor above'
          : routeMetrics.riskScore !== null
          ? `${routeMetrics.riskLevel} Risk Classification`
          : 'Zero geocoded records in buffer',
        change: routeMetrics.riskScore !== null
          ? 'Multi-factor empirical index'
          : 'Data unavailable',
        isPositive: routeMetrics.riskScore !== null ? routeMetrics.riskScore < 50 : true,
        status: isCalculating
          ? 'normal'
          : routeMetrics.riskScore !== null
          ? (routeMetrics.riskScore >= 70 ? 'severe' : routeMetrics.riskScore >= 50 ? 'moderate' : 'safe')
          : 'normal',
        badgeText: routeMetrics.riskScore !== null ? 'ROUTE SCORE' : 'DATA GAP',
        onClick: () => scrollToSection('predictor'),
      },
    ];
  }, [routeMetrics, historicalPeriod, bufferDistanceKm, isPlanningJourney]);

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex font-sans selection:bg-brand-orange/30 selection:text-orange-200">
      
      {/* 0. Slim Left Sidebar (Desktop) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 1. Global Navigation Bar */}
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          unreadAlertsCount={showAlertsBanner ? 3 : 0}
          onToggleAlerts={() => setShowAlertsBanner(!showAlertsBanner)}
          onOpenDatasetModal={() => setShowDatasetModal(true)}
        />

        {/* 2. Top Simulated Alerts Banner */}
        <SafetyAlertsBanner 
          isVisible={showAlertsBanner} 
          onClose={() => setShowAlertsBanner(false)} 
        />

        {/* Main Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          
          {/* Hero Section & Route-Specific Analytics Header */}
          <section id="overview" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 charcoal-card rounded-2xl border border-charcoal-750/90 p-6 sm:p-7 shadow-card-dark">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Road Accident Risk Prediction &amp; Safety Analytics
                </h1>
                <p className="text-sm text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
                  Corridor-grounded decision support platform calculating actual historical collision frequencies, fatalities, and empirical risk scores along your active route.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-400">
                  <span className="flex items-center space-x-1 font-mono text-[11px] text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Route-Specific Spatial Matching</span>
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[11px] text-cyan-300">
                    Verified NHAI Blackspots ({hotspots.length} Nationwide Nodes)
                  </span>
                  <span>•</span>
                  <button
                    onClick={() => setShowCorridorModal(true)}
                    className="font-mono text-[11px] text-brand-orange hover:underline cursor-pointer"
                  >
                    Monitored Network ({corridorMetrics.formattedDistance})
                  </button>
                </div>
              </div>

              {/* Provenance Attribution */}
              <div className="shrink-0 flex sm:items-end self-start md:self-end">
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono text-left md:text-right">
                  Provenance: {datasetSourceInfo.sourceName || 'Official MoRTH (2022) & NHAI Blackspot Registry'}
                </span>
              </div>
            </div>

            {/* Route Analytics Context & Parameter Bar (Route switcher, Buffer distance, Period) */}
            <RouteAnalyticsBar />

            {/* The Four Route-Specific Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {dynamicMetrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          </section>

          {/* 4. Journey Safety Mode (Live Route Navigation Foundation) */}
          <section id="journey" className="scroll-mt-20 space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-brand-orange shadow-glow-orange animate-pulse"></span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Journey Safety Mode (Live Route Navigation Foundation)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculate custom road routes across India. Any planned journey automatically updates the 4 dashboard cards above with route-specific historical accident records.
              </p>
            </div>

            <ErrorBoundary title="Journey Safety Mode">
              <JourneySafetyMode />
            </ErrorBoundary>
          </section>

          {/* 5. Interactive Risk Prediction Workspace */}
          <section id="predictor" className="scroll-mt-20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-brand-orange shadow-glow-orange"></span>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Corridor Risk Evaluation Engine
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate environmental factors or click any verified blackspot below to inspect collision probability.
                </p>
              </div>
            </div>

            {/* Two-Column Grid: Form (Left) & Results Card (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Form Column (7 Cols on large screens) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <ErrorBoundary title="Corridor Risk Evaluation Form">
                  <RiskAnalysisForm 
                    onAnalyze={handleAnalyze} 
                    isAnalyzing={isAnalyzing} 
                  />
                </ErrorBoundary>

                {/* Minimalist 3D Aerial Road Network Visualization */}
                <div 
                  className="relative w-full flex-1 min-h-[260px] sm:min-h-[300px] lg:min-h-[340px] flex items-center justify-center overflow-hidden rounded-2xl select-none"
                  aria-hidden="true"
                >
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-25 blur-3xl"
                    style={{
                      background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 106, 0, 0.28) 0%, rgba(255, 152, 0, 0.1) 40%, transparent 70%)',
                    }}
                  />

                  <img 
                    src="/road_hazard_aerial.jpg" 
                    alt="" 
                    className="w-full h-full object-cover object-center max-h-[380px] pointer-events-none opacity-85 transition-opacity duration-700 hover:opacity-95"
                    style={{
                      maskImage: 'radial-gradient(ellipse 85% 80% at 50% 50%, black 50%, rgba(0,0,0,0.8) 70%, transparent 98%)',
                      WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at 50% 50%, black 50%, rgba(0,0,0,0.8) 70%, transparent 98%)',
                    }}
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Result Column (5 Cols on large screens) */}
              <div id="risk-result-section" className="lg:col-span-5 flex flex-col">
                <RiskResultCard 
                  result={currentResult} 
                  corridorName={currentCorridorName} 
                />
              </div>

            </div>

            {/* Our Mission Statement */}
            <div className="pt-2">
              <MissionStatement />
            </div>
          </section>

          {/* 6. Interactive GIS Accident Hotspots Map */}
          <section id="hotspots" className="scroll-mt-20 space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-brand-orange shadow-glow-orange animate-pulse"></span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  High-Risk Accident Hotspots (GIS Geospatial Grid)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                All-India spatial clustering of verified NHAI highway blackspots with state census benchmarks. Click any pin to inspect or load into the risk predictor.
              </p>
            </div>

            <ErrorBoundary title="GIS Accident Hotspots Map">
              <AccidentHotspotsMap onSelectHotspot={handleSelectHotspotFromMap} />
            </ErrorBoundary>
          </section>

          {/* 7. Historical Analytics and Trends Section (MoRTH Nationwide Data) */}
          <section id="trends" className="scroll-mt-20 space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-brand-amber shadow-glow-amber"></span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Historical Collision Safety Analytics (Official MoRTH Data)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official Ministry of Road Transport and Highways (MoRTH) nationwide 5-year trends (2018–2022), 36 state/UT census comparisons, road class breakdowns, and circadian distributions.
              </p>
            </div>

            <HistoricalTrends />
          </section>

        </main>

        {/* 8. Footer */}
        <Footer 
          onOpenPrivacy={() => setShowPrivacyModal(true)}
          onOpenTerms={() => setShowTermsModal(true)}
        />

      </div>

      {/* 9. Monitored Corridors Audit & Route Breakdown Modal */}
      <MonitoredCorridorsModal
        isOpen={showCorridorModal}
        onClose={() => setShowCorridorModal(false)}
      />

      {/* 10. Dataset Management & CSV Validation Modal */}
      <DatasetImportModal
        isOpen={showDatasetModal}
        onClose={() => setShowDatasetModal(false)}
      />

      {/* 11. Dedicated Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => {
          setShowPrivacyModal(false);
          if (window.location.hash === '#privacy') {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }}
      />

      {/* 12. Dedicated Terms and Conditions Modal */}
      <TermsConditionsModal
        isOpen={showTermsModal}
        onClose={() => {
          setShowTermsModal(false);
          if (window.location.hash === '#terms') {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <JourneyProvider>
      <ErrorBoundary title="SafeRoad AI Application Shell">
        <DashboardContent />
      </ErrorBoundary>
    </JourneyProvider>
  );
}
