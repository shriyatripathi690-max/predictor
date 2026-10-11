import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { SafetyAlertsBanner } from './components/SafetyAlertsBanner';
import { MetricCard } from './components/MetricCard';
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
import { JourneyProvider, useJourney } from './context/JourneyContext';
import { calculateSimulatedRisk } from './utils/riskCalculator';
import { Database, ShieldCheck } from 'lucide-react';

function DashboardContent() {
  const { 
    currentJourney, 
    hotspots,
    hotspotStats, 
    corridorMetrics, 
    morthSummary, 
    datasetSourceInfo 
  } = useJourney();

  const [activeTab, setActiveTab] = useState('overview');
  const [showAlertsBanner, setShowAlertsBanner] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCorridorModal, setShowCorridorModal] = useState(false);
  const [showDatasetModal, setShowDatasetModal] = useState(false);

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
    if (currentJourney?.evaluationResult) {
      setCurrentResult(currentJourney.evaluationResult);
      setCurrentCorridorName(
        currentJourney.formInputs?.corridorName || 
        `${currentJourney.origin?.name} → ${currentJourney.destination?.name}`
      );
    }
  }, [currentJourney?.evaluationResult, currentJourney?.id]);

  // Handle Risk Analysis submission
  const handleAnalyze = (formData, evaluatedResult) => {
    setIsAnalyzing(true);
    setCurrentCorridorName(formData.corridorName);

    // Realistic brief computation delay
    setTimeout(() => {
      const result = evaluatedResult || calculateSimulatedRisk(formData);
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
    
    // Parse speed values from hotspot strings like "80 km/h"
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

    // Scroll to predictor section
    const predictorEl = document.getElementById('predictor');
    if (predictorEl) {
      predictorEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamically calculated dashboard statistics from single source of truth & MoRTH official census
  const dynamicMetrics = useMemo(() => [
    {
      id: 'corridors',
      title: 'Monitored Corridors',
      value: corridorMetrics.status === 'calculating'
        ? 'Calculating...'
        : corridorMetrics.status === 'unavailable'
        ? 'Distance unavailable'
        : `${corridorMetrics.formattedDistance}${corridorMetrics.isCached ? ' (Cached)' : ''}`,
      subtext: `Across ${corridorMetrics.corridorCount} monitored arterial corridors`,
      change: corridorMetrics.status === 'unavailable'
        ? 'Routing API offline'
        : corridorMetrics.isCached
        ? 'Cached road network'
        : '100% OSRM road geometry',
      isPositive: corridorMetrics.status !== 'unavailable',
      status: corridorMetrics.status === 'unavailable' ? 'severe' : 'normal',
      badgeText: corridorMetrics.status === 'live' ? 'LIVE OSRM' : corridorMetrics.status === 'cached' ? 'CACHED' : 'OFFLINE',
      onClick: () => setShowCorridorModal(true),
    },
    {
      id: 'national_accidents',
      title: 'National Reported Accidents',
      value: morthSummary?.totalAccidents ? `${morthSummary.totalAccidents.toLocaleString()}` : '461,312',
      subtext: `${morthSummary?.fatalities?.toLocaleString() || '168,491'} fatalities (MoRTH Official 2022)`,
      change: '+11.9% vs 2021 (Post-COVID)',
      isPositive: false,
      status: 'severe',
      badgeText: 'MoRTH CENSUS',
      onClick: () => setShowDatasetModal(true),
    },
    {
      id: 'avg_severity',
      title: 'National Severity Index',
      value: `${morthSummary?.severityIndex || 36.5} / 100`,
      subtext: 'Fatalities per 100 accidents (MoRTH standard)',
      change: '+4.1 vs 2018 (32.4)',
      isPositive: false,
      status: 'severe',
      badgeText: 'FATALITY RATIO',
      onClick: () => setShowDatasetModal(true),
    },
    {
      id: 'verified_blackspots',
      title: 'Verified Highway Blackspots',
      value: `${hotspots.length} Nodes`,
      subtext: `NHAI 500m protocol (${hotspotStats.highRiskCount} High / Severe)`,
      change: datasetSourceInfo.isOfficialBenchmark ? 'MoRTH / NHAI Registry' : 'Custom Imported',
      isPositive: true,
      status: 'normal',
      badgeText: datasetSourceInfo.isOfficialBenchmark ? 'NHAI VERIFIED' : 'CUSTOM DATA',
      onClick: () => setShowDatasetModal(true),
    },
  ], [corridorMetrics, morthSummary, hotspots.length, hotspotStats.highRiskCount, datasetSourceInfo]);

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
          
          {/* Hero Section & Prototype Status Header */}
          <section id="overview" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 charcoal-card rounded-2xl border border-charcoal-750/90 p-6 sm:p-7 shadow-card-dark">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Road Accident Risk Prediction &amp; Safety Analytics
                </h1>
                <p className="text-sm text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
                  Interactive decision-support platform integrating official Ministry of Road Transport and Highways (MoRTH) nationwide statistics and NHAI geolocated National Highway blackspot intelligence.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-400">
                  <span className="flex items-center space-x-1 font-mono text-[11px] text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>MoRTH 2022 Census (461,312 Accidents)</span>
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[11px] text-cyan-300">
                    Verified NHAI Blackspots ({hotspots.length} Nodes)
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[11px] text-brand-orange">
                    OSRM Monitored Corridors ({corridorMetrics.formattedDistance})
                  </span>
                </div>
              </div>

              {/* Dataset Management & Status Callout */}
              <div className="shrink-0 flex flex-col sm:items-end space-y-2">
                <button
                  onClick={() => setShowDatasetModal(true)}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-850 border border-charcoal-700 text-xs text-slate-200 hover:text-white transition cursor-pointer shadow-md"
                >
                  <Database className="w-3.5 h-3.5 text-brand-orange" />
                  <span className="font-semibold">Datasets &amp; CSV Import</span>
                </button>
                <span className="text-[10px] text-slate-400 font-mono text-right">
                  Provenance: {datasetSourceInfo.sourceName || 'Official MoRTH (2022)'}
                </span>
              </div>
            </div>

            {/* 3. Dashboard KPI Metrics Cards */}
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
                Calculate road routes across India, display driving paths, and initialize journey safety controls with blackspot intersection detection.
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

          {/* 7. Historical Analytics and Trends Section */}
          <section id="trends" className="scroll-mt-20 space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-brand-amber shadow-glow-amber"></span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Historical Collision Safety Analytics (Official MoRTH Data)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official Ministry of Road Transport and Highways (MoRTH) 5-year trends (2018–2022), 36 state/UT census comparisons, road class breakdowns, and circadian distributions.
              </p>
            </div>

            <HistoricalTrends />
          </section>

        </main>

        {/* 8. Footer */}
        <Footer />

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
