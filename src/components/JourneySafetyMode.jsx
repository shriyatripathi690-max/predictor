import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, 
  MapPin, 
  Search, 
  Play, 
  Square, 
  RotateCcw, 
  AlertCircle, 
  Route, 
  Compass, 
  ShieldAlert, 
  ShieldCheck,
  CheckCircle2, 
  X, 
  Loader2,
  Info,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Thermometer,
  Wind,
  Eye,
  Droplets,
  Activity,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { analyzeRouteRisk, parseHotspotCoords } from '../utils/routeRiskAnalyzer.js';
import { SAMPLE_HOTSPOTS } from '../data/sampleData.js';
import { useJourney } from '../context/JourneyContext.jsx';

export function JourneySafetyMode() {
  const { currentJourney, planJourney, clearJourney } = useJourney();

  // --- 1. Location State ---
  const [currentLocation, setCurrentLocation] = useState(currentJourney?.origin || null); // { lat, lon, name }
  const [locationStatus, setLocationStatus] = useState(currentJourney?.origin ? 'success' : 'idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [locationError, setLocationError] = useState(null);

  // --- 2. Destination Search State ---
  const [searchQuery, setSearchQuery] = useState(currentJourney?.destination?.name || '');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(currentJourney?.destination || null); // { lat, lon, name }
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- 3. Route State ---
  const [routeData, setRouteData] = useState(currentJourney?.routeData || null); // { distanceKm, durationMin, coordinates: [[lon, lat], ...] }
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // --- 4. Journey Controls & Monitoring State ---
  const [journeyStatus, setJourneyStatus] = useState(currentJourney ? 'ready' : 'idle'); // 'idle' | 'ready' | 'active' | 'stopped'
  const [journeyStartTime, setJourneyStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // --- 5. Stage 2 Intelligence & Early Warning State ---
  const [riskAnalysisData, setRiskAnalysisData] = useState(currentJourney?.riskAnalysis || null);
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false);

  // Sync when currentJourney updates from external actions (e.g. reload or reset)
  useEffect(() => {
    if (currentJourney) {
      if (currentJourney.origin) {
        setCurrentLocation(currentJourney.origin);
        setLocationStatus('success');
      }
      if (currentJourney.destination) {
        setSelectedDestination(currentJourney.destination);
        setSearchQuery(currentJourney.destination.name || '');
      }
      if (currentJourney.routeData) {
        setRouteData(currentJourney.routeData);
        setJourneyStatus('ready');
      }
      if (currentJourney.riskAnalysis) {
        setRiskAnalysisData(currentJourney.riskAnalysis);
      }
    }
  }, [currentJourney]);
  const [riskAnalysisError, setRiskAnalysisError] = useState(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState('all');

  // --- 6. Notifications & Audio Telemetry ---
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  // Refs for tracking, watchId, and debounce
  const searchTimeoutRef = useRef(null);
  const watchIdRef = useRef(null);
  const notifiedAlertIdsRef = useRef(new Set());

  // Web Audio Synthesizer: Non-distracting safety advisory chime
  const playSafetyTone = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio playback silently suppressed if blocked by browser policy
    }
  };

  // Browser Notification dispatcher with deduplication
  const dispatchSafetyAlert = (alert) => {
    if (audioEnabled) {
      playSafetyTone();
    }
    if (!notificationsEnabled) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (notifiedAlertIdsRef.current.has(alert.id)) return;

    notifiedAlertIdsRef.current.add(alert.id);
    try {
      new Notification(`SafeRoad: ${alert.title}`, {
        body: alert.actionableAdvice || alert.explanation,
        icon: '/favicon.ico',
        tag: alert.id,
      });
    } catch {
      // Ignored if background notification restricted
    }
  };

  // Journey elapsed timer effect
  useEffect(() => {
    let interval = null;
    if (journeyStatus === 'active') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [journeyStatus]);

  // Clean up geolocation watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Format seconds to mm:ss or hh:mm:ss
  const formatElapsedTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m ${s < 10 ? '0' : ''}${s}s`;
    }
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // --- Stage 2 Risk Analysis Trigger ---
  const executeRiskAnalysis = async (route, origin, dest) => {
    if (!route || !route.coordinates) return;
    setIsAnalyzingRisk(true);
    setRiskAnalysisError(null);

    try {
      const result = await analyzeRouteRisk(route, origin, dest);
      setRiskAnalysisData(result);

      // Check for high-severity alerts and dispatch notification
      if (result && result.alerts) {
        result.alerts.forEach((alert) => {
          if (alert.severity === 'Critical' || alert.severity === 'High') {
            dispatchSafetyAlert(alert);
          }
        });
      }
    } catch (err) {
      setRiskAnalysisError('Failed to compute route risk analysis: ' + (err.message || 'Unknown network error'));
    } finally {
      setIsAnalyzingRisk(false);
    }
  };

  // --- 1. Geolocation Request Handler ---
  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('loading');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const lat = parseFloat(latitude.toFixed(5));
        const lon = parseFloat(longitude.toFixed(5));

        // Reverse geocode via OpenStreetMap Nominatim
        let resolvedName = `GPS Location (${lat}, ${lon})`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`,
            { headers: { 'Accept': 'application/json' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(',');
              resolvedName = parts.slice(0, 3).join(',').trim();
            }
          }
        } catch {
          // Fallback to coordinates
        }

        const loc = { lat, lon, name: resolvedName };
        setCurrentLocation(loc);
        setLocationStatus('success');

        // If destination already exists, prompt user or recalculate
        if (selectedDestination) {
          setRouteData(null);
          setRiskAnalysisData(null);
          setJourneyStatus('idle');
        }
      },
      (error) => {
        setLocationStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please allow location access in your browser or device settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location position is unavailable. Please check your network or GPS signal.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please click Retry.');
            break;
          default:
            setLocationError('An unexpected error occurred while retrieving your location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // --- 2. Destination Search Input Handler ---
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchError(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&limit=5&addressdetails=1`,
          { headers: { 'Accept': 'application/json' } }
        );
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setSearchSuggestions(data);
        setShowSuggestions(true);
        if (data.length === 0) {
          setSearchError('No matching locations found.');
        }
      } catch {
        setSearchError('Geocoding service unavailable. Please check your connection.');
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  // Select destination
  const handleSelectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const name = item.display_name.split(',').slice(0, 3).join(',').trim();

    setSelectedDestination({ lat, lon, name, fullName: item.display_name });
    setSearchQuery(name);
    setShowSuggestions(false);
    setRouteData(null);
    setRiskAnalysisData(null);
    setRouteError(null);
    setJourneyStatus('idle');
  };

  // Clear Destination
  const handleClearDestination = () => {
    setSelectedDestination(null);
    setSearchQuery('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setRouteData(null);
    setRiskAnalysisData(null);
    setRouteError(null);
    clearJourney(); // Reset from shared context & localStorage
    if (journeyStatus === 'active') {
      handleStopJourney();
    } else {
      setJourneyStatus('idle');
    }
  };

  // --- 3. Route Calculation via OSRM & Stage 2 Risk Trigger ---
  const handleCalculateRoute = async () => {
    if (!currentLocation || !selectedDestination) return;

    const latDiff = Math.abs(currentLocation.lat - selectedDestination.lat);
    const lonDiff = Math.abs(currentLocation.lon - selectedDestination.lon);
    if (latDiff < 0.0005 && lonDiff < 0.0005) {
      setRouteError('Origin and destination are the same location. Please choose a different destination.');
      setRouteData(null);
      setRiskAnalysisData(null);
      setJourneyStatus('idle');
      return;
    }

    setIsCalculatingRoute(true);
    setRouteError(null);

    try {
      const planned = await planJourney(currentLocation, selectedDestination);
      if (planned) {
        setRouteData(planned.routeData);
        setRiskAnalysisData(planned.riskAnalysis);
        setJourneyStatus('ready');

        // Check for high-severity alerts and dispatch notification
        if (planned.riskAnalysis?.alerts) {
          planned.riskAnalysis.alerts.forEach((alert) => {
            if (alert.severity === 'Critical' || alert.severity === 'High') {
              dispatchSafetyAlert(alert);
            }
          });
        }
      }
    } catch (err) {
      setRouteError(err.message || 'Routing service unavailable. Please verify network access or try again.');
      setRouteData(null);
      setRiskAnalysisData(null);
      setJourneyStatus('idle');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // --- Quick Demonstration Corridor Loader ---
  const handleLoadDemoCorridor = async () => {
    // NH-48 Bypass (Gurugram) to River Valley Junction (Delhi)
    const demoOrigin = {
      lat: 28.4595,
      lon: 77.0266,
      name: 'NH-48 Expressway Bypass (Km 34.2)',
    };
    const demoDest = {
      lat: 28.6139,
      lon: 77.2090,
      name: 'River Valley Underpass Corridor',
    };

    setCurrentLocation(demoOrigin);
    setLocationStatus('success');
    setSelectedDestination(demoDest);
    setSearchQuery(demoDest.name);
    setRouteError(null);
    setIsCalculatingRoute(true);

    try {
      const planned = await planJourney(demoOrigin, demoDest);
      if (planned) {
        setRouteData(planned.routeData);
        setRiskAnalysisData(planned.riskAnalysis);
        setJourneyStatus('ready');

        if (planned.riskAnalysis?.alerts) {
          planned.riskAnalysis.alerts.forEach((alert) => {
            if (alert.severity === 'Critical' || alert.severity === 'High') {
              dispatchSafetyAlert(alert);
            }
          });
        }
      }
    } catch (err) {
      setRouteError('Demo route computation failed: ' + (err.message || 'Network error'));
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // --- 4. Journey Monitoring Controls ---
  const handleStartJourney = () => {
    if (!routeData) return;
    setJourneyStatus('active');
    setJourneyStartTime(new Date());
    setElapsedSeconds(0);

    // Initialize continuous location monitoring via Geolocation watchPosition
    if (navigator.geolocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const lat = parseFloat(latitude.toFixed(5));
          const lon = parseFloat(longitude.toFixed(5));
          setCurrentLocation((prev) => (prev ? { ...prev, lat, lon } : { lat, lon, name: 'Current GPS Telemetry' }));
        },
        (err) => {
          console.warn('Geolocation monitoring watch warning:', err);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        }
      );
    }

    if (audioEnabled) {
      playSafetyTone();
    }
  };

  const handleStopJourney = () => {
    setJourneyStatus('stopped');
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const handleResetJourney = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setJourneyStatus(routeData ? 'ready' : 'idle');
    setElapsedSeconds(0);
    setJourneyStartTime(null);
  };

  // --- 5. Notification Permission Handler ---
  const handleToggleNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser desktop notifications are not supported by this browser.');
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled((prev) => !prev);
    } else if (Notification.permission === 'default') {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          setNotificationsEnabled(true);
          new Notification('SafeRoad Journey Safety Mode', {
            body: 'Desktop safety alerts active. You will receive prioritized road hazard advisories.',
            icon: '/favicon.ico',
          });
        } else {
          setNotificationsEnabled(false);
        }
      } catch {
        setNotificationsEnabled(false);
      }
    } else {
      alert('Notifications are blocked in browser site permissions. Please allow them in your address bar settings.');
    }
  };

  // --- 6. Render SVG Cartographic Route Map ---
  const renderMapCanvas = () => {
    if (!routeData || !routeData.coordinates || routeData.coordinates.length === 0) {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center text-slate-400 p-6">
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(255, 106, 0, 0.25) 1px, transparent 1px), linear-gradient(to right, rgba(40, 45, 62, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(40, 45, 62, 0.5) 1px, transparent 1px)`,
              backgroundSize: '32px 32px, 64px 64px, 64px 64px',
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center max-w-sm space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-charcoal-850 border border-charcoal-750 flex items-center justify-center text-brand-orange shadow-lg">
              <Route className="w-7 h-7 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Route Canvas Ready</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Enable your current location and select a destination above to calculate your driving path and launch the AI Early Warning Center.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadDemoCorridor}
              className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-brand-orange border border-charcoal-700 hover:border-brand-orange/40 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Demo Corridor (NH-48 to River Valley)</span>
            </button>
          </div>
        </div>
      );
    }

    const coords = routeData.coordinates;
    const lons = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);

    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const padLon = (maxLon - minLon) * 0.15 || 0.01;
    const padLat = (maxLat - minLat) * 0.15 || 0.01;

    const bounds = {
      minLon: minLon - padLon,
      maxLon: maxLon + padLon,
      minLat: minLat - padLat,
      maxLat: maxLat + padLat,
    };

    const width = 800;
    const height = 450;

    // Convert coordinates to normalized SVG pixel points
    const pointsString = coords
      .map(([lon, lat]) => {
        const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
        const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const startPoint = coords[0];
    const endPoint = coords[coords.length - 1];

    const startX = ((startPoint[0] - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
    const startY = height - ((startPoint[1] - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;

    const endX = ((endPoint[0] - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
    const endY = height - ((endPoint[1] - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;

    // Filter parsed hotspots that fall inside current map bounds
    const hotspotsInBounds = SAMPLE_HOTSPOTS.map((hs) => {
      const parsed = parseHotspotCoords(hs.coordinates);
      return { ...hs, parsed };
    }).filter(
      (hs) =>
        hs.parsed &&
        hs.parsed.lat >= bounds.minLat &&
        hs.parsed.lat <= bounds.maxLat &&
        hs.parsed.lon >= bounds.minLon &&
        hs.parsed.lon <= bounds.maxLon
    );

    return (
      <div className="relative w-full h-full overflow-hidden bg-[#0c0e14]">
        {/* Background Grid */}
        <div 
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 106, 0, 0.2) 1px, transparent 1px), linear-gradient(to right, rgba(40, 45, 62, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(40, 45, 62, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px, 72px 72px, 72px 72px',
          }}
        />

        {/* SVG Route Visualization */}
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full object-contain pointer-events-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="40%" stopColor="#ff9800" />
              <stop offset="100%" stopColor="#ff6a00" />
            </linearGradient>
            <filter id="routeHalo" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Outer Glow Line */}
          <polyline
            fill="none"
            stroke="#ff6a00"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
            points={pointsString}
            filter="url(#routeHalo)"
          />

          {/* Main Route Line */}
          <polyline
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />

          {/* Render Historical Blackspots that intersect the route bounding box */}
          {hotspotsInBounds.map((hs) => {
            const hx = ((hs.parsed.lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
            const hy = height - ((hs.parsed.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
            return (
              <g key={hs.id} transform={`translate(${hx}, ${hy})`}>
                <circle r="14" fill="#ef4444" opacity="0.25" className="animate-ping" />
                <circle r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                <text x="9" y="4" fill="#fca5a5" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  {hs.id}
                </text>
              </g>
            );
          })}

          {/* Origin Marker */}
          <g transform={`translate(${startX}, ${startY})`}>
            <circle r="12" fill="#10b981" opacity="0.25" className="animate-ping" />
            <circle r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* Destination Marker */}
          <g transform={`translate(${endX}, ${endY})`}>
            <circle r="14" fill="#ff6a00" opacity="0.3" className="animate-ping" />
            <circle r="8" fill="#ff6a00" stroke="#ffffff" strokeWidth="2.5" />
          </g>
        </svg>

        {/* Floating Route Origin/Destination Overlay */}
        <div className="absolute top-4 left-4 z-20 flex flex-col space-y-1.5 pointer-events-none">
          <div className="bg-charcoal-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-charcoal-750 flex items-center space-x-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-200 font-semibold truncate max-w-[200px]">
              {currentLocation?.name || 'Origin'}
            </span>
          </div>

          <div className="bg-charcoal-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-charcoal-750 flex items-center space-x-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-orange"></span>
            <span className="text-slate-200 font-semibold truncate max-w-[200px]">
              {selectedDestination?.name || 'Destination'}
            </span>
          </div>
        </div>

        {/* Live Distance and Duration HUD overlay */}
        <div className="absolute bottom-4 right-4 z-20 bg-charcoal-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-charcoal-750 flex items-center space-x-4 text-xs shadow-xl">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Driving Distance
            </span>
            <span className="text-sm font-black text-white font-mono">
              {routeData.distanceKm} km
            </span>
          </div>
          <div className="w-px h-6 bg-charcoal-750"></div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Estimated Time
            </span>
            <span className="text-sm font-black text-brand-orange font-mono">
              {routeData.durationMin > 60 
                ? `${Math.floor(routeData.durationMin / 60)}h ${routeData.durationMin % 60}m` 
                : `${routeData.durationMin} mins`}
            </span>
          </div>
        </div>

        {/* Map Attribution Footnote */}
        <div className="absolute bottom-2 left-4 text-[10px] font-mono text-slate-400 opacity-80 pointer-events-none">
          Road routing powered by OSRM • © OpenStreetMap contributors
        </div>
      </div>
    );
  };

  return (
    <div className="charcoal-card rounded-2xl border border-charcoal-750/90 shadow-card-dark p-5 sm:p-7 backdrop-blur-xl space-y-6">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-750/80 pb-5">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="p-1.5 rounded-lg bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
              <Compass className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Journey Safety Mode
            </h2>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-charcoal-800 text-brand-orange border border-charcoal-700">
              Stage 2 Intelligence Active
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Real-time corridor risk analysis, Open-Meteo atmospheric telemetry, historical crash hotspot proximity, and the AI Early Warning Center.
          </p>
        </div>

        {/* Journey Status Pill */}
        <div className="shrink-0 flex items-center space-x-2">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
            journeyStatus === 'active'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : journeyStatus === 'ready'
              ? 'bg-brand-orange/15 border-brand-orange/40 text-brand-orange'
              : journeyStatus === 'stopped'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
              : 'bg-charcoal-900 border-charcoal-750 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              journeyStatus === 'active'
                ? 'bg-emerald-400 animate-pulse'
                : journeyStatus === 'ready'
                ? 'bg-brand-orange'
                : journeyStatus === 'stopped'
                ? 'bg-amber-400'
                : 'bg-slate-500'
            }`}></span>
            <span className="capitalize">
              {journeyStatus === 'active' 
                ? 'Journey Active & Monitored' 
                : journeyStatus === 'ready' 
                ? 'Route & Risk Evaluated' 
                : journeyStatus === 'stopped' 
                ? 'Journey Concluded' 
                : 'Awaiting Setup'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Location & Destination Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Origin / Current Location Card */}
        <div className="bg-charcoal-900/90 rounded-2xl p-5 border border-charcoal-750/90 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Current Location (Origin)</span>
              </span>
              
              {locationStatus === 'success' && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Verified
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Request browser location permissions to establish your journey starting point.
            </p>

            {/* Location Status Display */}
            {locationStatus === 'success' && currentLocation && (
              <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-1.5 text-xs">
                <div className="flex items-start justify-between">
                  <span className="text-slate-200 font-bold truncate">
                    {currentLocation.name}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2">
                  <span>Lat: {currentLocation.lat}</span>
                  <span>•</span>
                  <span>Lon: {currentLocation.lon}</span>
                </div>
              </div>
            )}

            {locationStatus === 'error' && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-brand-red mt-0.5" />
                <p className="leading-relaxed">{locationError}</p>
              </div>
            )}
          </div>

          {/* Enable / Retry Button */}
          <button
            type="button"
            onClick={handleEnableLocation}
            disabled={locationStatus === 'loading'}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border cursor-pointer bg-charcoal-800 hover:bg-charcoal-750 text-white border-charcoal-700 hover:border-emerald-500/50"
          >
            {locationStatus === 'loading' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Requesting GPS Access...</span>
              </>
            ) : locationStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Update / Refresh Location</span>
              </>
            ) : locationStatus === 'error' ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Retry Location Permission</span>
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enable My Location</span>
              </>
            )}
          </button>
        </div>

        {/* Destination Search Card */}
        <div className="bg-charcoal-900/90 rounded-2xl p-5 border border-charcoal-750/90 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                <span>2. Journey Destination</span>
              </span>

              {selectedDestination && (
                <button
                  type="button"
                  onClick={handleClearDestination}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Search destination via OpenStreetMap geocoding, or test with the demonstration link below.
            </p>

            {/* Search Input Field */}
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    if (searchSuggestions.length > 0) setShowSuggestions(true);
                  }}
                  placeholder="e.g. Connaught Place, River Valley, Terminal 3..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-all"
                />
                {isSearching && (
                  <Loader2 className="w-4 h-4 text-brand-orange animate-spin absolute right-3 pointer-events-none" />
                )}
                {!isSearching && searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearDestination}
                    className="absolute right-3 p-0.5 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-charcoal-850 border border-charcoal-700 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-charcoal-750/70">
                  {searchSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-charcoal-800 transition flex items-start space-x-2.5 text-xs text-slate-200"
                    >
                      <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0 mt-0.5" />
                      <div className="truncate">
                        <p className="font-semibold text-white truncate">
                          {item.display_name.split(',')[0]}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {item.display_name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {searchError && (
              <p className="text-[11px] text-amber-400 mt-2 font-medium">
                {searchError}
              </p>
            )}

            {selectedDestination && (
              <div className="mt-3 p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                  Selected Destination
                </span>
                <p className="font-bold text-white truncate">{selectedDestination.name}</p>
                <p className="text-[10px] font-mono text-slate-400">
                  Lat: {selectedDestination.lat.toFixed(5)} • Lon: {selectedDestination.lon.toFixed(5)}
                </p>
              </div>
            )}
          </div>

          {/* Calculate Route Trigger */}
          <button
            type="button"
            onClick={handleCalculateRoute}
            disabled={!currentLocation || !selectedDestination || isCalculatingRoute}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-brand-orange hover:bg-brand-orangeLight text-white border-brand-orange/40 shadow-glow-orange"
          >
            {isCalculatingRoute ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Computing OSRM Road Path...</span>
              </>
            ) : (
              <>
                <Route className="w-3.5 h-3.5" />
                <span>Plan Route & Analyze Risk</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Route Error Notification */}
      {routeError && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
          <span>{routeError}</span>
        </div>
      )}

      {/* 3. Interactive Route Display Canvas */}
      <div className="rounded-2xl border border-charcoal-750/90 overflow-hidden min-h-[380px] h-[380px] bg-charcoal-950 shadow-inner relative">
        {renderMapCanvas()}
      </div>

      {/* Cross-Module Workflow Navigation Bridge */}
      {routeData && (
        <div className="p-4 rounded-2xl bg-charcoal-850/95 border border-brand-orange/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3.5 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-brand-orange/15 text-brand-orange border border-brand-orange/30 shrink-0">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Route Synchronized with Risk Predictor & Hotspot Map
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Shared Model Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {routeData.distanceKm} km planned corridor is auto-populated into the Risk Evaluation Form and plotted on the GIS Map.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('predictor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-orange-600 text-white font-bold text-xs shadow-glow-orange flex items-center justify-center space-x-1.5 transition hover:brightness-110 cursor-pointer"
            >
              <span>Evaluate in Predictor Form</span>
              <span>&rarr;</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('hotspots');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition hover:bg-charcoal-750 cursor-pointer"
            >
              <span>View on Hotspot Map</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Journey Controls Toolbar & Active Dashboard */}
      <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-900/90 border border-charcoal-750/90 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-brand-orange" />
              <span>3. Journey Session & Telemetry Controls</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Launch live journey monitoring. Active session polls GPS telemetry and continuous atmospheric hazard updates.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            {journeyStatus !== 'active' ? (
              <button
                type="button"
                onClick={handleStartJourney}
                disabled={!routeData}
                className="py-2.5 px-5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Journey Safety Mode</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopJourney}
                className="py-2.5 px-5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white shadow-lg cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Journey</span>
              </button>
            )}

            {(journeyStatus === 'active' || journeyStatus === 'stopped') && (
              <button
                type="button"
                onClick={handleResetJourney}
                className="p-2.5 rounded-xl border border-charcoal-700 bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white text-xs transition cursor-pointer"
                title="Reset Journey Session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Active Journey HUD Telemetry Banner */}
        {journeyStatus === 'active' && (
          <div className="mt-3 p-4 rounded-xl bg-charcoal-850/90 border border-emerald-500/30 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Journey Elapsed
              </span>
              <span className="text-sm font-black text-emerald-400 font-mono mt-0.5 block">
                {formatElapsedTime(elapsedSeconds)}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                GPS Telemetry
              </span>
              <span className="font-semibold text-slate-200 mt-0.5 block truncate">
                {currentLocation ? `${currentLocation.lat}, ${currentLocation.lon}` : 'Polling...'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Corridor Distance
              </span>
              <span className="font-semibold text-slate-200 mt-0.5 block">
                {routeData?.distanceKm} km
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Started At
              </span>
              <span className="font-semibold text-brand-orange mt-0.5 block">
                {journeyStartTime ? journeyStartTime.toLocaleTimeString() : 'Active'}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          5. STAGE 2: AI EARLY WARNING CENTER & ROUTE RISK ANALYSIS
          ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-charcoal-900/90 border border-charcoal-750/90 space-y-6">
        
        {/* Early Warning Center Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-charcoal-750/70 pb-4">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Early Warning Center (Stage 2 Intelligence)
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
                  Live Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Multi-factor risk estimation, atmospheric telemetry, historical crash records, and proactive advisories.
              </p>
            </div>
          </div>

          {/* Quick Controls: Audio Chime & Push Alerts */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Audio chime toggle */}
            <button
              type="button"
              onClick={() => setAudioEnabled((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                audioEnabled
                  ? 'bg-charcoal-800 border-charcoal-700 text-slate-200 hover:text-white'
                  : 'bg-charcoal-850 border-charcoal-800 text-slate-500'
              }`}
              title="Toggle safety audio advisory chime"
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Audio Chime On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span>Audio Muted</span>
                </>
              )}
            </button>

            {/* Desktop notification toggle */}
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                notificationsEnabled
                  ? 'bg-brand-orange/15 border-brand-orange/40 text-brand-orange'
                  : notificationPermission === 'denied'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-charcoal-800 border-charcoal-700 text-slate-300 hover:text-white'
              }`}
              title="Enable or disable desktop push alerts"
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Desktop Alerts Active</span>
                </>
              ) : notificationPermission === 'denied' ? (
                <>
                  <BellOff className="w-3.5 h-3.5 text-red-400" />
                  <span>Alerts Blocked (Browser)</span>
                </>
              ) : (
                <>
                  <BellOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Enable Push Alerts</span>
                </>
              )}
            </button>

            {/* Re-analyze button */}
            {routeData && (
              <button
                type="button"
                onClick={() => executeRiskAnalysis(routeData, currentLocation, selectedDestination)}
                disabled={isAnalyzingRisk}
                className="px-3 py-1.5 rounded-xl border border-charcoal-700 bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                title="Re-evaluate route hazards and refresh weather"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isAnalyzingRisk ? 'animate-spin text-brand-orange' : ''}`} />
                <span>Refresh Intelligence</span>
              </button>
            )}
          </div>
        </div>

        {/* Risk Analysis Loading State */}
        {isAnalyzingRisk && (
          <div className="p-4 rounded-xl bg-charcoal-850/80 border border-charcoal-750 flex items-center justify-center space-x-3 text-xs text-slate-300">
            <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
            <span>Retrieving Open-Meteo atmospheric telemetry and evaluating corridor risk factors...</span>
          </div>
        )}

        {/* Risk Analysis Error */}
        {riskAnalysisError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
            <span>{riskAnalysisError}</span>
          </div>
        )}

        {/* Empty State before Route Calculation */}
        {!routeData && (
          <div className="p-6 rounded-xl bg-charcoal-850/50 border border-charcoal-750/70 text-center space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto stroke-[1.5]" />
            <p className="text-xs font-semibold text-slate-300">
              No Active Journey Corridor Selected
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
              Enable your origin and select a destination above (or load the demonstration corridor) to initiate route segmentation and ground-truth early warnings.
            </p>
          </div>
        )}

        {/* Active Early Warning Center Content */}
        {routeData && riskAnalysisData && (
          <div className="space-y-6">
            
            {/* 1. Overall Route Composite Risk Index */}
            <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-850 border border-charcoal-750/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Composite Corridor Risk Index
                  </span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-2xl font-black text-white font-mono">
                      {riskAnalysisData.overallRisk.score}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${riskAnalysisData.overallRisk.badgeColor}`}>
                      {riskAnalysisData.overallRisk.category} Risk
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right text-[11px] font-mono text-slate-400">
                  <span>Evaluated at: {riskAnalysisData.overallRisk.analyzedAt}</span>
                  <span className="block text-[10px] text-slate-500">
                    Engine: {riskAnalysisData.overallRisk.modelStatus.engineLabel}
                  </span>
                </div>
              </div>

              {/* Visual Score Meter Bar */}
              <div className="w-full bg-charcoal-900 rounded-full h-2.5 overflow-hidden border border-charcoal-750">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(5, riskAnalysisData.overallRisk.score))}%`,
                    backgroundColor: riskAnalysisData.overallRisk.gaugeColor,
                  }}
                />
              </div>

              {/* Transparency & Integrity Disclaimer */}
              <div className="p-2.5 rounded-lg bg-charcoal-900/60 border border-charcoal-750/60 text-[11px] text-slate-400 flex items-start space-x-2">
                <Info className="w-3.5 h-3.5 text-brand-orange shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Safety Intelligence Notice:</strong> This index reflects Highway Safety Manual (AASHTO) safety heuristics cross-referenced with live Open-Meteo atmospheric telemetry and historical collision registries. This is a statistical hazard estimate, not a guarantee of future incident occurrence.
                </span>
              </div>
            </div>

            {/* 2. Prioritized Alert Cards Feed */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-brand-orange" />
                <span>Active Safety Advisories & Telemetry Feed</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {riskAnalysisData.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border text-xs space-y-2.5 flex flex-col justify-between ${alert.severityColor}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                          {alert.category}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-charcoal-900/80 border border-charcoal-750">
                          {alert.severity}
                        </span>
                      </div>

                      <h5 className="font-bold text-white text-sm">
                        {alert.title}
                      </h5>

                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {alert.explanation}
                      </p>

                      {/* Weather Telemetry Pills if applicable */}
                      {alert.telemetry && (
                        <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-charcoal-750/60 text-[10px] font-mono text-slate-300">
                          <span className="flex items-center space-x-1">
                            <Thermometer className="w-3 h-3 text-brand-orange" />
                            <span>Temp: {alert.telemetry.temperature}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Droplets className="w-3 h-3 text-blue-400" />
                            <span>Rain: {alert.telemetry.precipitation}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Wind className="w-3 h-3 text-teal-400" />
                            <span>Wind: {alert.telemetry.wind}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="w-3 h-3 text-amber-400" />
                            <span>Sight: {alert.telemetry.visibility}</span>
                          </span>
                        </div>
                      )}

                      {/* Integrity disclaimer if applicable */}
                      {alert.integrityNotice && (
                        <p className="text-[10px] text-slate-400 italic mt-2">
                          * {alert.integrityNotice}
                        </p>
                      )}
                    </div>

                    {/* Actionable Advice & Data Attribution */}
                    <div className="pt-2 border-t border-charcoal-750/70 space-y-1">
                      <div className="text-[11px] font-medium text-slate-200 flex items-start space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{alert.actionableAdvice}</span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between pt-1">
                        <span>Source: {alert.dataSource}</span>
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Corridor Route Segments Breakdown */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Segmented Corridor Breakdown</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  {riskAnalysisData.evaluatedSegments.length} Discrete Road Segments
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {riskAnalysisData.evaluatedSegments.map((segment) => (
                  <div
                    key={segment.id}
                    onClick={() => setSelectedSegmentId(segment.id === selectedSegmentId ? 'all' : segment.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer space-y-3 ${
                      selectedSegmentId === segment.id
                        ? 'bg-charcoal-800 border-brand-orange/60 shadow-glow-orange'
                        : 'bg-charcoal-850/80 border-charcoal-750/80 hover:bg-charcoal-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {segment.title}
                        </span>
                        <h5 className="font-bold text-white text-xs mt-0.5 truncate max-w-[180px]">
                          {segment.subtitle}
                        </h5>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${segment.badgeColor}`}>
                        {segment.riskCategory} ({segment.riskScore})
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Length:</span>
                        <span className="text-slate-200 font-mono font-semibold">{segment.distanceKm} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Corridor Profile:</span>
                        <span className="text-slate-200 capitalize">{segment.roadType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nearest Hotspot:</span>
                        <span className="text-slate-200 truncate max-w-[130px]">
                          {segment.nearestHotspot ? `${segment.nearestHotspot.id} (${segment.nearestHotspotDistanceKm} km)` : 'None (< 50 km)'}
                        </span>
                      </div>
                    </div>

                    {/* Explanatory note */}
                    <div className="pt-2 border-t border-charcoal-750/60 text-[10px] text-slate-400">
                      <span>Click to view Explainable AI (XAI) factors</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Explainable AI (XAI) Factor Contributions */}
            <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-850/90 border border-charcoal-750 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand-orange" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Explainable AI (XAI) — Factor Weight Breakdown
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Target: {selectedSegmentId === 'all' ? 'Overall Corridor Model' : `Segment: ${selectedSegmentId}`}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                The chart below shows how environmental, geometric, and temporal factors contribute points to the heuristic risk index based on AASHTO Highway Safety Manual standards.
              </p>

              {/* Factors Table / List */}
              {(() => {
                const targetSeg = selectedSegmentId === 'all' 
                  ? riskAnalysisData.evaluatedSegments[0] 
                  : riskAnalysisData.evaluatedSegments.find((s) => s.id === selectedSegmentId) || riskAnalysisData.evaluatedSegments[0];

                return (
                  <div className="divide-y divide-charcoal-750/70 border border-charcoal-750/80 rounded-xl overflow-hidden bg-charcoal-900/60">
                    {targetSeg.factorContributions.map((fc, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-charcoal-850/50 transition">
                        <div className="space-y-0.5 max-w-md">
                          <span className="font-semibold text-slate-200 block">
                            {fc.factor}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {fc.description}
                          </span>
                        </div>
                        <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded-md border ${
                          fc.severity === 'high'
                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                            : fc.severity === 'medium'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {fc.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="text-[10px] text-slate-500 italic pt-1">
                * Factor weights represent Highway Safety Manual empirical correlations. Higher factor weight indicates statistically elevated corridor hazard, not causal certainty.
              </div>
            </div>

            {/* Background Monitoring Limitation Notice */}
            <div className="p-3 rounded-xl bg-charcoal-850/60 border border-charcoal-750 flex items-start space-x-2 text-[11px] text-slate-400">
              <Clock className="w-3.5 h-3.5 text-brand-orange shrink-0 mt-0.5" />
              <span>
                <strong>Browser Execution Limitation:</strong> Modern browsers throttle background execution and GPS polling when this tab is minimized or the device screen enters lock mode. Keep this dashboard foregrounded for continuous telemetry updates while driving.
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
