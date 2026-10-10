import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { SafetyAlertsBanner } from './components/SafetyAlertsBanner';
import { MetricCard } from './components/MetricCard';
import { RiskAnalysisForm } from './components/RiskAnalysisForm';
import { RiskResultCard } from './components/RiskResultCard';
import { AccidentHotspotsMap } from './components/AccidentHotspotsMap';
import { HistoricalTrends } from './components/HistoricalTrends';
import { Footer } from './components/Footer';
import { SAMPLE_METRICS } from './data/sampleData';
import { calculateSimulatedRisk } from './utils/riskCalculator';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAlertsBanner, setShowAlertsBanner] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
  };

  const [currentCorridorName, setCurrentCorridorName] = useState(initialFormState.corridorName);
  const [currentResult, setCurrentResult] = useState(() => calculateSimulatedRisk(initialFormState));

  // Handle Risk Analysis submission
  const handleAnalyze = (formData) => {
    setIsAnalyzing(true);
    setCurrentCorridorName(formData.corridorName);

    // Realistic brief computation delay
    setTimeout(() => {
      const result = calculateSimulatedRisk(formData);
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
      roadType: hotspot.type.toLowerCase().includes('highway') ? 'expressway' : 'urban_arterial',
      weather: hotspot.weatherImpact.toLowerCase().includes('rain') ? 'heavy_rain' : 'clear',
      timeOfDay: 'late_night',
      lighting: 'unlit',
      surfaceCondition: hotspot.weatherImpact.toLowerCase().includes('water') ? 'waterlogged' : 'wet',
      trafficDensity: 'moderate',
      speedLimit: parsedSpeedLimit,
      userSpeed: parsedObservedSpeed,
    };

    const calculated = calculateSimulatedRisk(mockInputs);
    setCurrentResult(calculated);

    // Scroll to predictor section
    const predictorEl = document.getElementById('predictor');
    if (predictorEl) {
      predictorEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* 1. Global Navigation Bar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        unreadAlertsCount={showAlertsBanner ? 3 : 0}
        onToggleAlerts={() => setShowAlertsBanner(!showAlertsBanner)}
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy-900/60 p-6 rounded-2xl border border-navy-750/80 backdrop-blur-md">
            <div>
              <div className="flex items-center space-x-2.5 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Hackathon Track: AI & Smart Mobility
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  • Stage 1 Frontend
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Road Accident Risk Prediction & Safety Analytics
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Interactive decision-support dashboard simulating roadway collision probability, contributing hazard mechanisms, and real-time prescriptive mitigations.
              </p>
            </div>

            {/* Quick Prototype Callout */}
            <div className="shrink-0 flex flex-col sm:items-end">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-700 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300 font-medium">Simulation Mode Active</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">
                Deterministic traffic engineering heuristics
              </span>
            </div>
          </div>

          {/* 3. Dashboard KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAMPLE_METRICS.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </section>

        {/* 4. Interactive Risk Prediction Workspace */}
        <section id="predictor" className="scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Corridor Risk Evaluation Engine
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate environmental factors or click any hotspot below to inspect collision probability.
              </p>
            </div>
          </div>

          {/* Two-Column Grid: Form (Left) & Results Card (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Form Column (7 Cols on large screens) */}
            <div className="lg:col-span-7">
              <RiskAnalysisForm 
                onAnalyze={handleAnalyze} 
                isAnalyzing={isAnalyzing} 
              />
            </div>

            {/* Result Column (5 Cols on large screens) */}
            <div id="risk-result-section" className="lg:col-span-5">
              <RiskResultCard 
                result={currentResult} 
                corridorName={currentCorridorName} 
              />
            </div>

          </div>
        </section>

        {/* 5. Interactive GIS Accident Hotspots Map Placeholder */}
        <section id="hotspots" className="scroll-mt-20 space-y-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                High-Risk Accident Hotspots (GIS Geospatial Grid)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Spatial clustering of simulated accident blackspots. Click any pin to inspect or load into the risk predictor.
            </p>
          </div>

          <AccidentHotspotsMap onSelectHotspot={handleSelectHotspotFromMap} />
        </section>

        {/* 6. Historical Analytics and Trends Section */}
        <section id="trends" className="scroll-mt-20 space-y-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Historical Collision Safety Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-dimensional analysis of seasonal trends, hourly circadian risk peaks, and root cause distributions.
            </p>
          </div>

          <HistoricalTrends />
        </section>

      </main>

      {/* 7. Footer */}
      <Footer />

    </div>
  );
}
