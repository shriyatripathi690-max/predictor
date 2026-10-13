import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Compass, 
  CloudRain, 
  Moon, 
  Gauge, 
  Car, 
  Lightbulb, 
  Layers, 
  Route,
  AlertTriangle,
  Users,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { SAMPLE_PRESET_SCENARIOS } from '../data/sampleData';
import { useJourney } from '../context/JourneyContext';
import { calculateSimulatedRisk } from '../utils/riskCalculator';

const DEFAULT_FORM_STATE = {
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
  selectedSegment: 'all',
  originName: '',
  destinationName: '',
};

export function RiskAnalysisForm({ onAnalyze, isAnalyzing }) {
  const { 
    currentJourney, 
    evaluateJourney, 
    updateFormInputs, 
    planJourney, 
    isPlanningJourney 
  } = useJourney();

  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [originInput, setOriginInput] = useState('');
  const [destInput, setDestInput] = useState('');
  const [showEndpointsEditor, setShowEndpointsEditor] = useState(false);
  const [recalcError, setRecalcError] = useState(null);
  const [justEvaluatedId, setJustEvaluatedId] = useState(null);
  const [evaluationError, setEvaluationError] = useState(null);

  // Automatically populate form when currentJourney changes or loads from persistence
  useEffect(() => {
    if (currentJourney) {
      const inputs = currentJourney.formInputs || {};
      setFormData((prev) => ({
        ...prev,
        corridorName: inputs.corridorName || `${currentJourney.origin?.name} → ${currentJourney.destination?.name}`,
        originName: currentJourney.origin?.name || '',
        destinationName: currentJourney.destination?.name || '',
        roadType: inputs.roadType || 'expressway',
        weather: inputs.weather || 'heavy_rain',
        surfaceCondition: inputs.surfaceCondition || 'waterlogged',
        timeOfDay: inputs.timeOfDay || 'late_night',
        lighting: inputs.lighting || 'unlit',
        trafficDensity: inputs.trafficDensity || 'moderate',
        speedLimit: inputs.speedLimit || 90,
        userSpeed: inputs.userSpeed || 96,
        dangerousIntersections: inputs.dangerousIntersections || (currentJourney.alongRouteHotspotIds?.length > 0 ? 'moderate' : 'none'),
        pedestrianActivity: inputs.pedestrianActivity || 'low',
        accidentHistory: inputs.accidentHistory || (currentJourney.alongRouteHotspotIds?.length > 0 ? 'frequent_collisions' : 'standard'),
        selectedSegment: inputs.selectedSegment || 'all',
      }));

      setOriginInput(currentJourney.origin?.name || '');
      setDestInput(currentJourney.destination?.name || '');
      setJustEvaluatedId(currentJourney.evaluationResult?.evaluationId || null);
    }
  }, [currentJourney?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      [name]: name === 'speedLimit' || name === 'userSpeed' ? Number(value) : value,
    };
    setFormData(updated);

    // Keep journey state synchronized
    if (currentJourney) {
      updateFormInputs(updated);
    }
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      ...preset.data,
      dangerousIntersections: preset.data.dangerousIntersections || 'moderate',
      pedestrianActivity: preset.data.pedestrianActivity || 'low',
      accidentHistory: preset.data.accidentHistory || 'standard',
    }));
  };

  const handleReset = () => {
    if (currentJourney?.formInputs) {
      setFormData(currentJourney.formInputs);
    } else {
      setFormData(DEFAULT_FORM_STATE);
    }
    setJustEvaluatedId(null);
  };

  // Recalculate route if the user modifies origin or destination directly in this form
  const handleRecalculateCorridor = async (e) => {
    e.preventDefault();
    if (!originInput.trim() || !destInput.trim()) return;

    setRecalcError(null);
    try {
      await planJourney(originInput.trim(), destInput.trim());
      setShowEndpointsEditor(false);
      setJustEvaluatedId(null);
    } catch (err) {
      setRecalcError(err.message || 'Could not recalculate route. Please check location names.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEvaluationError(null);

    // Input validation
    const parsedSpeedLimit = Number(formData.speedLimit);
    const parsedUserSpeed = Number(formData.userSpeed);
    if (isNaN(parsedSpeedLimit) || parsedSpeedLimit <= 0) {
      setEvaluationError('Speed limit must be a valid positive number.');
      return;
    }
    if (isNaN(parsedUserSpeed) || parsedUserSpeed < 0) {
      setEvaluationError('Observed speed must be a valid non-negative number.');
      return;
    }

    try {
      // Evaluate selected journey and record results
      const rawResult = evaluateJourney ? evaluateJourney(formData) : null;
      const validResult = (rawResult && typeof rawResult.score === 'number' && Array.isArray(rawResult.factorContributions))
        ? rawResult
        : calculateSimulatedRisk(formData);

      setJustEvaluatedId(validResult?.evaluationId || 'EVAL-OK');

      if (onAnalyze) {
        onAnalyze(formData, validResult);
      }
    } catch (err) {
      console.error('Error during RiskAnalysisForm evaluation:', err);
      try {
        const fallbackResult = calculateSimulatedRisk(formData);
        setJustEvaluatedId(fallbackResult?.evaluationId || 'EVAL-OK');
        if (onAnalyze) {
          onAnalyze(formData, fallbackResult);
        }
      } catch (fallbackErr) {
        setEvaluationError(fallbackErr.message || 'Evaluation computation encountered an unexpected error.');
      }
    }
  };

  const speedDelta = formData.userSpeed - formData.speedLimit;

  return (
    <div className="charcoal-card rounded-2xl border border-charcoal-750/90 shadow-card-dark p-5 sm:p-7 backdrop-blur-xl">
      
      {/* 1. Header & Quick Presets */}
      <div className="border-b border-charcoal-750/80 pb-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
                <Compass className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Road Risk Evaluation Form
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {currentJourney 
                ? 'Corridor route parameters auto-populated from active Journey Safety Mode telemetry.' 
                : 'Configure roadway environmental conditions to simulate corridor collision probability.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {currentJourney && (
              <button
                type="button"
                onClick={() => setShowEndpointsEditor(!showEndpointsEditor)}
                className="flex items-center space-x-1.5 text-xs text-brand-orange hover:text-orange-300 px-3 py-1.5 rounded-xl bg-brand-orange/10 border border-brand-orange/30 hover:bg-brand-orange/20 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{showEndpointsEditor ? 'Cancel Edit' : 'Edit Endpoints'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 hover:bg-charcoal-800 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Connected Journey Telemetry Card (Requirement 2 & 6) */}
        {currentJourney ? (
          <div className="mt-4 p-4 rounded-xl bg-charcoal-900/90 border border-brand-orange/30 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-xs font-bold text-white tracking-wide">
                  Active Connected Journey:
                </span>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {currentJourney.id}
                </span>
              </div>

              {justEvaluatedId && (
                <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Saved: {justEvaluatedId}</span>
                </div>
              )}
            </div>

            {/* Route Geometry & Telemetry Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-charcoal-950/70 border border-charcoal-800">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Origin Node</div>
                <div className="text-slate-200 font-bold truncate mt-0.5" title={currentJourney.origin.name}>
                  {currentJourney.origin.name}
                </div>
                <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
                  {currentJourney.origin.lat.toFixed(4)}° N, {currentJourney.origin.lon.toFixed(4)}° E
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-charcoal-950/70 border border-charcoal-800">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Destination Node</div>
                <div className="text-slate-200 font-bold truncate mt-0.5" title={currentJourney.destination.name}>
                  {currentJourney.destination.name}
                </div>
                <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
                  {currentJourney.destination.lat.toFixed(4)}° N, {currentJourney.destination.lon.toFixed(4)}° E
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-charcoal-950/70 border border-charcoal-800">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Route Geometry</div>
                <div className="text-slate-200 font-bold mt-0.5">
                  {currentJourney.routeData.distanceKm} km
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  ~{currentJourney.routeData.durationMin} mins drive
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-charcoal-950/70 border border-charcoal-800">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Corridor Blackspots</div>
                <div className="text-brand-orange font-bold mt-0.5">
                  {currentJourney.alongRouteHotspotIds?.length || 0} intersecting
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Spatial radius &lt;15 km
                </div>
              </div>
            </div>

            {/* Endpoints Editor Form (Visible when toggled) */}
            {showEndpointsEditor && (
              <form onSubmit={handleRecalculateCorridor} className="mt-4 pt-3.5 border-t border-charcoal-800 space-y-3">
                <p className="text-xs text-amber-300 font-semibold flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Changing endpoints will recalculate route geometry and invalidate outdated evaluations.</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">New Starting Point:</label>
                    <input
                      type="text"
                      value={originInput}
                      onChange={(e) => setOriginInput(e.target.value)}
                      placeholder="e.g. Connaught Place, New Delhi"
                      className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-700 text-white text-xs focus:border-brand-orange focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">New Destination:</label>
                    <input
                      type="text"
                      value={destInput}
                      onChange={(e) => setDestInput(e.target.value)}
                      placeholder="e.g. Cyber City, Gurugram"
                      className="w-full px-3 py-2 rounded-lg bg-charcoal-950 border border-charcoal-700 text-white text-xs focus:border-brand-orange focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {recalcError && (
                  <p className="text-xs text-red-400 font-mono">{recalcError}</p>
                )}

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowEndpointsEditor(false)}
                    className="px-3 py-1.5 rounded-lg bg-charcoal-800 text-slate-300 text-xs hover:bg-charcoal-750 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPlanningJourney}
                    className="px-4 py-1.5 rounded-lg bg-brand-orange text-white text-xs font-bold hover:bg-brand-orangeLight disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
                  >
                    {isPlanningJourney ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Recalculating...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        <span>Recalculate &amp; Sync Route</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="mt-4 p-3.5 rounded-xl bg-charcoal-900/60 border border-charcoal-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-400">
              <Route className="w-4 h-4 text-brand-orange shrink-0" />
              <span>
                No active journey planned yet. You can evaluate standalone parameters or plan a journey route first.
              </span>
            </div>
            <a
              href="#journey"
              className="text-brand-orange hover:text-orange-300 font-semibold shrink-0 ml-2 flex items-center space-x-1 transition"
            >
              <span>Plan Route</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Quick Test Scenarios */}
        <div className="mt-4 pt-3 border-t border-charcoal-800">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            <span className="font-semibold text-slate-300">Quick Test Scenarios:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESET_SCENARIOS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-xs px-3 py-1.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-slate-300 hover:text-white border border-charcoal-700/80 hover:border-brand-orange/50 transition-all flex items-center space-x-1.5 cursor-pointer"
                title={preset.description}
              >
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Row 1: Corridor Name & Segment Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Corridor / Segment Name
            </label>
            <input
              type="text"
              name="corridorName"
              value={formData.corridorName}
              onChange={handleChange}
              placeholder="e.g. NH-48 West Expressway"
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Roadway Geometry Class
            </label>
            <div className="relative">
              <select
                name="roadType"
                value={formData.roadType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange appearance-none transition-all cursor-pointer"
              >
                <option value="expressway">Highway Expressway (Controlled Access)</option>
                <option value="urban_arterial">Urban Arterial (Multi-lane Commercial)</option>
                <option value="rural_two_lane">Rural Two-Lane (Undivided Road)</option>
                <option value="intersection">Multi-Leg Intersection / Signalized Node</option>
              </select>
              <Layers className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Atmospheric Weather, Surface & Circadian Period */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Atmospheric Weather
            </label>
            <div className="relative">
              <select
                name="weather"
                value={formData.weather}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange appearance-none transition-all cursor-pointer"
              >
                <option value="clear">Clear &amp; Dry</option>
                <option value="light_rain">Light Rain / Drizzle</option>
                <option value="heavy_rain">Heavy Downpour / Monsoon</option>
                <option value="dense_fog">Dense Fog / Severe Haze</option>
                <option value="snow_ice">Snow / Freezing Sleet</option>
              </select>
              <CloudRain className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Pavement Surface State
            </label>
            <select
              name="surfaceCondition"
              value={formData.surfaceCondition}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-all cursor-pointer"
            >
              <option value="dry">Dry Grip (High Traction)</option>
              <option value="wet">Wet Surface (Moderate Slippage)</option>
              <option value="waterlogged">Waterlogged / Standing Water</option>
              <option value="uneven_potholes">Degraded / Severe Potholes</option>
              <option value="icy">Icy / Low Skid Coefficient</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Time Period &amp; Sun Angle
            </label>
            <div className="relative">
              <select
                name="timeOfDay"
                value={formData.timeOfDay}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange appearance-none transition-all cursor-pointer"
              >
                <option value="daylight">Daylight (10:00 - 16:00)</option>
                <option value="rush_evening">Evening Commute / Dusk (16:30 - 19:30)</option>
                <option value="night">Night (20:00 - 23:59)</option>
                <option value="late_night">Late Night / Post-Midnight (00:00 - 04:30)</option>
                <option value="dawn">Dawn / Early Sunrise (05:00 - 08:00)</option>
              </select>
              <Moon className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 3: Lighting, Traffic & Route Segment Evaluation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Visibility &amp; Lighting
            </label>
            <div className="relative">
              <select
                name="lighting"
                value={formData.lighting}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange appearance-none transition-all cursor-pointer"
              >
                <option value="daylight">Natural Daylight</option>
                <option value="streetlights_good">Continuous Streetlights (Adequate)</option>
                <option value="streetlights_poor">Substandard / Dim Lighting</option>
                <option value="unlit">Completely Unlit (High Darkness)</option>
              </select>
              <Lightbulb className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Traffic Congestion Level
            </label>
            <div className="relative">
              <select
                name="trafficDensity"
                value={formData.trafficDensity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange appearance-none transition-all cursor-pointer"
              >
                <option value="low">Low (Free-flow Conditions)</option>
                <option value="moderate">Moderate (Intermittent Platoons)</option>
                <option value="congested">Congested (Heavy Friction / Stop-and-Go)</option>
              </select>
              <Car className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Route Segment Focus
            </label>
            <div className="relative">
              <select
                name="selectedSegment"
                value={formData.selectedSegment}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange appearance-none transition-all cursor-pointer"
              >
                <option value="all">Full Corridor Length</option>
                {currentJourney?.riskAnalysis?.evaluatedSegments?.map((seg) => (
                  <option key={seg.id || seg.segmentId} value={seg.id || seg.segmentId}>
                    {seg.title || seg.name} ({seg.lengthKm} km)
                  </option>
                )) || (
                  <>
                    <option value="seg_1">Initial Egress Section (Km 0 - 15)</option>
                    <option value="seg_2">Mid-Corridor Express Section</option>
                    <option value="seg_3">Terminal Node &amp; Interchanges</option>
                  </>
                )}
              </select>
              <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 4: Newly Integrated Hazard Factors (Requirement 2 & 4) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-900/80 border border-charcoal-750/90 space-y-4">
          <div className="flex items-center space-x-2 border-b border-charcoal-800 pb-3">
            <ShieldAlert className="w-4 h-4 text-brand-orange" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Corridor Hazard &amp; Safety Factors (AI Assessment Controls)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Dangerous Intersections */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Dangerous Intersections</span>
              </label>
              <select
                name="dangerousIntersections"
                value={formData.dangerousIntersections}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white text-xs focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange"
              >
                <option value="none">None / Grade Separated</option>
                <option value="minor">1-2 Minor Signalized Crossings</option>
                <option value="moderate">Multiple Complex Intersections</option>
                <option value="high_risk_junctions">Critical Multi-leg Roundabouts</option>
              </select>
            </div>

            {/* Pedestrian Activity */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pedestrian Activity</span>
              </label>
              <select
                name="pedestrianActivity"
                value={formData.pedestrianActivity}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white text-xs focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange"
              >
                <option value="low">Low (Fenced Expressway)</option>
                <option value="moderate_crossings">Moderate Crossings / Bus Stops</option>
                <option value="high_dense_pedestrians">Dense Market / Uncontrolled Crossings</option>
              </select>
            </div>

            {/* Accident History */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>Historical Blackspot Frequency</span>
              </label>
              <select
                name="accidentHistory"
                value={formData.accidentHistory}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white text-xs focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange"
              >
                <option value="standard">Standard Historical Safety Baseline</option>
                <option value="frequent_collisions">Frequent Collisions / Rear-End Cluster</option>
                <option value="severe_fatality_cluster">Severe High-Fatality Blackspot History</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 5: Velocity Differential Controls */}
        <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-900/90 border border-charcoal-750/90 space-y-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-brand-orange" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Velocity Differential Controls
              </span>
            </div>
            
            {/* Speed Delta Badge */}
            <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-semibold ${
              speedDelta > 15 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : speedDelta > 0 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {speedDelta > 0 ? `+${speedDelta} km/h (Over Limit)` : `${speedDelta} km/h (Within Limit)`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Speed Limit */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-400">Designated Speed Limit:</span>
                <span className="text-white font-mono font-bold">{formData.speedLimit} km/h</span>
              </div>
              <input
                type="range"
                name="speedLimit"
                min="30"
                max="120"
                step="5"
                value={formData.speedLimit}
                onChange={handleChange}
                className="w-full h-2 bg-charcoal-750 rounded-lg appearance-none cursor-pointer accent-brand-orange"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>30 km/h</span>
                <span>80 km/h</span>
                <span>120 km/h</span>
              </div>
            </div>

            {/* Observed User Speed */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-400">Average Observed Fleet Speed:</span>
                <span className="text-white font-mono font-bold">{formData.userSpeed} km/h</span>
              </div>
              <input
                type="range"
                name="userSpeed"
                min="20"
                max="140"
                step="5"
                value={formData.userSpeed}
                onChange={handleChange}
                className="w-full h-2 bg-charcoal-750 rounded-lg appearance-none cursor-pointer accent-brand-orange"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>20 km/h</span>
                <span>80 km/h</span>
                <span>140 km/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button & Disclaimer */}
        <div className="pt-2">
          {evaluationError && (
            <div className="mb-3 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{evaluationError}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={isAnalyzing || isPlanningJourney}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-brand-orange via-orange-600 to-brand-red hover:from-brand-orangeLight hover:to-red-700 shadow-glow-orange border border-brand-orange/40 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAnalyzing || isPlanningJourney ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Evaluating Connected Corridor Risk...</span>
              </>
            ) : currentJourney ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Evaluate Journey Risk ({currentJourney.id})</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Evaluate Corridor Risk Index (Simulation Engine)</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
