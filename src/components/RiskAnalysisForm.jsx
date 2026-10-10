import React, { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { SAMPLE_PRESET_SCENARIOS } from '../data/sampleData';

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
};

export function RiskAnalysisForm({ onAnalyze, isAnalyzing }) {
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'speedLimit' || name === 'userSpeed' ? Number(value) : value,
    }));
  };

  const handleApplyPreset = (preset) => {
    setFormData(preset.data);
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM_STATE);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze(formData);
  };

  const speedDelta = formData.userSpeed - formData.speedLimit;

  return (
    <div className="bg-navy-850/90 rounded-2xl border border-navy-750 shadow-xl p-5 sm:p-7 backdrop-blur-md">
      
      {/* Header and Presets */}
      <div className="border-b border-navy-750/80 pb-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Compass className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Road Risk Evaluation Form
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure roadway environmental conditions to simulate safety risk probability.
            </p>
          </div>

          {/* Quick Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="self-start sm:self-auto flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-750 hover:bg-navy-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Preset Quick-Buttons */}
        <div className="mt-4 pt-3 border-t border-navy-800/80">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-semibold text-slate-300">Quick Test Scenarios:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESET_SCENARIOS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-xs px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700/80 transition-all flex items-center space-x-1.5"
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
        
        {/* Row 1: Corridor Name & Road Class */}
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 appearance-none"
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

        {/* Row 2: Weather & Surface Condition */}
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 appearance-none"
              >
                <option value="clear">☀️ Clear & Dry</option>
                <option value="light_rain">🌦️ Light Rain / Drizzle</option>
                <option value="heavy_rain">🌧️ Heavy Downpour / Monsoon</option>
                <option value="dense_fog">🌫️ Dense Fog / Severe Haze</option>
                <option value="snow_ice">❄️ Snow / Freezing Sleet</option>
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
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
              Time Period
            </label>
            <div className="relative">
              <select
                name="timeOfDay"
                value={formData.timeOfDay}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 appearance-none"
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

        {/* Row 3: Lighting & Traffic Density */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Ambient Lighting
            </label>
            <div className="relative">
              <select
                name="lighting"
                value={formData.lighting}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 appearance-none"
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
              Traffic Volume / Density
            </label>
            <div className="relative">
              <select
                name="trafficDensity"
                value={formData.trafficDensity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 appearance-none"
              >
                <option value="low">Low (Free-flow Conditions)</option>
                <option value="moderate">Moderate (Intermittent Platoons)</option>
                <option value="congested">Congested (Heavy Friction)</option>
              </select>
              <Car className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 4: Speed Controls */}
        <div className="p-4 rounded-xl bg-navy-900/90 border border-navy-750 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-orange-400" />
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
                className="w-full h-2 bg-navy-750 rounded-lg appearance-none cursor-pointer accent-orange-500"
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
                className="w-full h-2 bg-navy-750 rounded-lg appearance-none cursor-pointer accent-orange-500"
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
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/25 border border-orange-400/30 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Evaluating Simulated Risk Matrix...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Evaluate Corridor Risk Index (Simulation Engine)</span>
              </>
            )}
          </button>

          {/* Model Transparency Disclaimer */}
          <div className="mt-3 flex items-start space-x-2 text-[11px] text-slate-400 bg-navy-900/60 p-2.5 rounded-lg border border-navy-750">
            <HelpCircle className="w-4 h-4 text-orange-400/80 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-300">Hackathon Stage 1 Transparency:</strong> Dynamic risk score is calculated via validated traffic safety heuristics based on pavement friction, speed delta, and atmospheric factors. An actual machine learning model (e.g. XGBoost) will be trained and connected in Stage 2.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
