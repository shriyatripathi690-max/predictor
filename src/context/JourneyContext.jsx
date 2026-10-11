import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { SAMPLE_HOTSPOTS_DATA, calculateHotspotStats } from '../services/hotspotService';
import { geocodeLocation, calculateDrivableRoute, getHaversineDistanceKm } from '../services/routingService';
import {
  DEFAULT_MONITORED_CORRIDORS,
  calculateAllMonitoredCorridors,
  getCachedCorridorDistances,
  deduplicateCorridors,
} from '../services/corridorService';
import {
  MORTH_METADATA,
  MORTH_NATIONAL_TRENDS,
  MORTH_STATE_WISE_2022,
  getMorthNationwideSummary,
} from '../services/morthDataService';
import { BLACKSPOT_DATASET_METADATA } from '../services/blackspotDataService';
import { analyzeRouteRisk } from '../utils/routeRiskAnalyzer';
import { calculateSimulatedRisk } from '../utils/riskCalculator';

const JourneyContext = createContext(null);

const STORAGE_KEY_JOURNEY = 'saferoad_active_journey_v2';
const STORAGE_KEY_HOTSPOTS = 'saferoad_hotspots_v3_nationwide';
const STORAGE_KEY_CORRIDORS_LIST = 'saferoad_monitored_corridors_list_v3';
const STORAGE_KEY_DATASET_META = 'saferoad_dataset_meta_v3';

export function JourneyProvider({ children }) {
  // --- 0. Nationwide Dataset & Provenance Metadata ---
  const [datasetSourceInfo, setDatasetSourceInfo] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATASET_META);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      sourceName: 'Official MoRTH (2022) & NHAI Blackspot Registry',
      reportingPeriod: '2018–2022',
      isOfficialBenchmark: true,
      license: 'Government Open Data License - India (GODL)',
      lastUpdated: '2023-10-31T00:00:00.000Z',
    };
  });

  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');

  // --- 1. Dynamic Hotspot Records (Single Source of Truth) ---
  const [hotspots, setHotspots] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HOTSPOTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to default sample dataset
    }
    return SAMPLE_HOTSPOTS_DATA;
  });

  const [selectedHotspotId, setSelectedHotspotId] = useState(hotspots[0]?.id || 'IN-BS-TN01');

  // Import custom blackspots data with validation
  const importBlackspotsData = useCallback((importedRecords, meta) => {
    if (!Array.isArray(importedRecords) || importedRecords.length === 0) return;
    setHotspots(importedRecords);
    if (importedRecords[0]?.id) {
      setSelectedHotspotId(importedRecords[0].id);
    }
    const newMeta = {
      sourceName: meta?.sourceName || 'User Imported Validated Dataset',
      reportingPeriod: meta?.reportingPeriod || '2019–2022',
      isOfficialBenchmark: false,
      license: 'Custom Upload (Validated)',
      lastUpdated: new Date().toISOString(),
      recordCount: importedRecords.length,
      geographicCoverage: meta?.geographicCoverage || 'Multistate',
    };
    setDatasetSourceInfo(newMeta);
    try {
      localStorage.setItem(STORAGE_KEY_DATASET_META, JSON.stringify(newMeta));
    } catch {}
  }, []);

  // Reset datasets to official MoRTH and NHAI benchmarks
  const resetDatasetsToOfficial = useCallback(() => {
    setHotspots(SAMPLE_HOTSPOTS_DATA);
    setSelectedHotspotId(SAMPLE_HOTSPOTS_DATA[0].id);
    setSelectedStateFilter('ALL');
    const defaultMeta = {
      sourceName: 'Official MoRTH (2022) & NHAI Blackspot Registry',
      reportingPeriod: '2018–2022',
      isOfficialBenchmark: true,
      license: 'Government Open Data License - India (GODL)',
      lastUpdated: new Date().toISOString(),
    };
    setDatasetSourceInfo(defaultMeta);
    try {
      localStorage.removeItem(STORAGE_KEY_HOTSPOTS);
      localStorage.removeItem(STORAGE_KEY_DATASET_META);
    } catch {}
  }, []);

  // --- 2. Active Journey State ---
  const [currentJourney, setCurrentJourney] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JOURNEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.routeData && Array.isArray(parsed.routeData.coordinates)) {
          // Normalize evaluatedSegments if coordinates is an object from prior schema
          if (parsed.riskAnalysis && Array.isArray(parsed.riskAnalysis.evaluatedSegments)) {
            parsed.riskAnalysis.evaluatedSegments = parsed.riskAnalysis.evaluatedSegments.map((seg) => {
              if (seg && !Array.isArray(seg.coordinates) && typeof seg.startIndex === 'number' && typeof seg.endIndex === 'number') {
                const segSlice = parsed.routeData.coordinates.slice(seg.startIndex, seg.endIndex + 1);
                return {
                  ...seg,
                  coordinates: segSlice,
                  pathCoordinates: segSlice,
                  midpoint: seg.coordinates,
                };
              }
              return seg;
            });
          }
          return parsed;
        }
      }
    } catch {
      // No saved journey
    }
    return null;
  });

  const [isPlanningJourney, setIsPlanningJourney] = useState(false);
  const [planningError, setPlanningError] = useState(null);

  // Request counter ref to prevent async race conditions
  const activeJourneyRequestIdRef = useRef(0);

  // --- 3. Monitored Corridors & Real Driving Distance State (Single Source of Truth) ---
  const [monitoredCorridors, setMonitoredCorridors] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CORRIDORS_LIST);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return deduplicateCorridors(parsed);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_MONITORED_CORRIDORS;
  });

  const [corridorMetrics, setCorridorMetrics] = useState(() => {
    const cached = getCachedCorridorDistances();
    if (cached && typeof cached.totalDistanceMeters === 'number') {
      return {
        ...cached,
        status: 'cached',
        isCached: true,
      };
    }
    return {
      status: 'calculating',
      totalDistanceMeters: null,
      totalDistanceKm: null,
      formattedDistance: 'Calculating...',
      corridorCount: DEFAULT_MONITORED_CORRIDORS.length,
      isCached: false,
      cachedAt: null,
      provider: 'OSRM Driving Engine (OpenStreetMap)',
      aggregationMethod: 'Sum of unique corridor driving distances',
      corridors: [],
      error: null,
    };
  });

  const [isCalculatingCorridors, setIsCalculatingCorridors] = useState(false);

  // Persist corridors list
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CORRIDORS_LIST, JSON.stringify(monitoredCorridors));
    } catch {
      // Ignore
    }
  }, [monitoredCorridors]);

  // Recalculate corridor distances when corridors change or on mount
  const calculateCorridors = useCallback(async (corridorsToCalc, forceRefresh = false) => {
    setIsCalculatingCorridors(true);
    try {
      const result = await calculateAllMonitoredCorridors(corridorsToCalc, forceRefresh);
      setCorridorMetrics(result);
    } catch (err) {
      console.error('[JourneyContext] Corridor distance calculation failed:', err);
      setCorridorMetrics((prev) => ({
        ...prev,
        status: 'unavailable',
        formattedDistance: 'Distance unavailable',
        error: err.message || 'Routing service unavailable',
      }));
    } finally {
      setIsCalculatingCorridors(false);
    }
  }, []);

  useEffect(() => {
    calculateCorridors(monitoredCorridors, false);
  }, [monitoredCorridors, calculateCorridors]);

  const refreshCorridorMetrics = useCallback(
    (force = true) => {
      return calculateCorridors(monitoredCorridors, force);
    },
    [monitoredCorridors, calculateCorridors]
  );

  const addMonitoredCorridor = useCallback((newCorridor) => {
    setMonitoredCorridors((prev) => {
      const combined = [...prev, newCorridor];
      return deduplicateCorridors(combined);
    });
  }, []);

  const removeMonitoredCorridor = useCallback((corridorId) => {
    setMonitoredCorridors((prev) => prev.filter((c) => c.id !== corridorId));
  }, []);

  const resetCorridorsToDefault = useCallback(() => {
    setMonitoredCorridors(DEFAULT_MONITORED_CORRIDORS);
    localStorage.removeItem(STORAGE_KEY_CORRIDORS_LIST);
  }, []);

  // Persist hotspots whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HOTSPOTS, JSON.stringify(hotspots));
    } catch {
      // Ignore quota errors
    }
  }, [hotspots]);

  // Persist journey whenever modified
  useEffect(() => {
    try {
      if (currentJourney) {
        localStorage.setItem(STORAGE_KEY_JOURNEY, JSON.stringify(currentJourney));
      } else {
        localStorage.removeItem(STORAGE_KEY_JOURNEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [currentJourney]);

  /**
   * Plan a new journey between origin and destination.
   * Geocodes locations, computes drivable route, analyzes route hazards, and auto-populates form data.
   */
  const planJourney = useCallback(async (originInput, destInput) => {
    const requestId = ++activeJourneyRequestIdRef.current;
    setIsPlanningJourney(true);
    setPlanningError(null);

    try {
      // 1. Geocode both locations into geographic coordinates
      const origin = await geocodeLocation(originInput);
      const destination = await geocodeLocation(destInput);

      // Check if another request was initiated while geocoding
      if (requestId !== activeJourneyRequestIdRef.current) return null;

      // 2. Compute drivable route geometry via OSRM / calibrated road network
      const routeData = await calculateDrivableRoute(origin, destination);
      if (requestId !== activeJourneyRequestIdRef.current) return null;

      // 3. Analyze route risk and identify along-route hotspots
      const riskAnalysis = await analyzeRouteRisk(routeData, origin, destination);
      if (requestId !== activeJourneyRequestIdRef.current) return null;

      // Identify hotspots in our active dataset that lie near the route (< 15 km)
      const routeCoords = routeData.coordinates || [];
      const alongRouteHotspotIds = [];
      hotspots.forEach((hs) => {
        // Sample points on route to check minimum distance
        let minDistance = Infinity;
        for (let i = 0; i < routeCoords.length; i += Math.max(1, Math.floor(routeCoords.length / 25))) {
          const [lon, lat] = routeCoords[i];
          const d = getHaversineDistanceKm(lat, lon, hs.lat, hs.lng);
          if (d < minDistance) minDistance = d;
        }
        if (minDistance <= 15) {
          alongRouteHotspotIds.push(hs.id);
        }
      });

      // Unique Journey ID
      const journeyId = `JRN-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      // Derive default environmental factors from live route risk analysis
      const defaultWeather = riskAnalysis?.evaluatedSegments?.[0]?.weatherSnapshot?.weatherKey || 'heavy_rain';
      const defaultSurface = riskAnalysis?.evaluatedSegments?.[0]?.weatherSnapshot?.surfaceCondition || 'waterlogged';
      const defaultTime = riskAnalysis?.evaluatedSegments?.[0]?.circadianContext?.timeOfDay || 'late_night';
      const defaultLighting = riskAnalysis?.evaluatedSegments?.[0]?.circadianContext?.lighting || 'unlit';

      // Auto-populate form inputs
      const formInputs = {
        journeyId,
        corridorName: `${origin.name} → ${destination.name}`,
        originName: origin.name,
        destinationName: destination.name,
        originCoordinates: `${origin.lat.toFixed(4)}° N, ${origin.lon.toFixed(4)}° E`,
        destCoordinates: `${destination.lat.toFixed(4)}° N, ${destination.lon.toFixed(4)}° E`,
        distanceKm: routeData.distanceKm,
        durationMin: routeData.durationMin,
        roadType: 'expressway',
        weather: defaultWeather,
        surfaceCondition: defaultSurface,
        timeOfDay: defaultTime,
        lighting: defaultLighting,
        trafficDensity: 'moderate',
        speedLimit: 90,
        userSpeed: 96,
        dangerousIntersections: alongRouteHotspotIds.length > 0 ? 'moderate' : 'none',
        pedestrianActivity: 'low',
        accidentHistory: alongRouteHotspotIds.length > 0 ? 'frequent_collisions' : 'standard',
        selectedSegment: 'all',
      };

      const newJourney = {
        id: journeyId,
        createdAt: new Date().toISOString(),
        origin,
        destination,
        routeData,
        riskAnalysis,
        alongRouteHotspotIds,
        formInputs,
        evaluationResult: null, // Reset previous route-specific evaluation
        status: 'ready',
      };

      setCurrentJourney(newJourney);
      setIsPlanningJourney(false);
      return newJourney;
    } catch (err) {
      if (requestId === activeJourneyRequestIdRef.current) {
        setPlanningError(err.message || 'Failed to plan route for the requested corridor.');
        setIsPlanningJourney(false);
      }
      throw err;
    }
  }, [hotspots]);

  /**
   * Update current journey form inputs without recalculating route
   */
  const updateFormInputs = useCallback((inputs) => {
    setCurrentJourney((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        formInputs: {
          ...prev.formInputs,
          ...inputs,
        },
      };
    });
  }, []);

  /**
   * Submit an evaluation for the active journey.
   * Runs the risk evaluation engine, generates an evaluation ID, attaches it to the journey,
   * and updates any matching hotspots in the shared dataset without duplicating.
   */
  const evaluateJourney = useCallback((formData) => {
    if (!currentJourney) {
      // Fallback for manual evaluation without planned journey
      const res = calculateSimulatedRisk(formData);
      return res;
    }

    const evaluationId = `EVAL-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const evaluatedResult = calculateSimulatedRisk({
      ...formData,
      journeyId: currentJourney.id,
      evaluationId,
    });

    // Update current journey with the new evaluation result
    setCurrentJourney((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        evaluationResult: evaluatedResult,
        status: 'evaluated',
      };
    });

    // Consistent Location-Matching Strategy:
    // Update existing hotspot if the evaluated corridor matches an existing hotspot (name match or within 2.5 km),
    // or add a single new hotspot if severe/high and non-existent.
    setHotspots((prevHotspots) => {
      const corridorQuery = (formData.corridorName || '').toLowerCase();
      let matchedIndex = -1;

      // Check name match
      matchedIndex = prevHotspots.findIndex((h) =>
        corridorQuery.includes(h.name.toLowerCase()) || h.name.toLowerCase().includes(corridorQuery)
      );

      // Check proximity match to origin or destination if name didn't match
      if (matchedIndex === -1 && currentJourney.origin) {
        matchedIndex = prevHotspots.findIndex((h) => {
          const dOrigin = getHaversineDistanceKm(currentJourney.origin.lat, currentJourney.origin.lon, h.lat, h.lng);
          const dDest = getHaversineDistanceKm(currentJourney.destination.lat, currentJourney.destination.lon, h.lat, h.lng);
          return dOrigin < 2.5 || dDest < 2.5;
        });
      }

      if (matchedIndex !== -1) {
        // Update existing hotspot in place (NO duplicate created!)
        const updated = [...prevHotspots];
        const existing = updated[matchedIndex];
        updated[matchedIndex] = {
          ...existing,
          riskScore: evaluatedResult.score,
          riskLevel: evaluatedResult.category,
          riskCategory: evaluatedResult.category === 'Severe' || evaluatedResult.category === 'High' ? 'high' : evaluatedResult.category === 'Moderate' ? 'medium' : 'low',
          roadConditions: `${formData.surfaceCondition.replace('_', ' ')} • ${formData.weather.replace('_', ' ')}`,
          weatherImpact: evaluatedResult.alertSummary,
          recommendedAction: evaluatedResult.recommendations?.[0]?.action || existing.recommendedAction,
          lastEvaluated: new Date().toISOString(),
          evaluationId,
        };
        return updated;
      }

      // If no matching hotspot found and risk is severe/high, add one cleanly labeled
      if (evaluatedResult.score >= 65) {
        const nextId = `HS-${String(prevHotspots.length + 1).padStart(2, '0')}`;
        const newHotspot = {
          id: nextId,
          name: formData.corridorName || `Evaluated Corridor Segment (${nextId})`,
          type: formData.roadType === 'expressway' ? 'Highway Express' : 'Urban Arterial',
          lat: currentJourney.origin.lat,
          lng: currentJourney.origin.lon,
          coordinates: `${currentJourney.origin.lat.toFixed(4)}° N, ${currentJourney.origin.lon.toFixed(4)}° E`,
          riskScore: evaluatedResult.score,
          riskLevel: evaluatedResult.category,
          riskCategory: 'high',
          primaryCause: evaluatedResult.factorContributions?.[0]?.description || 'Evaluated compound road risk',
          hazardType: 'Evaluated corridor risk factor',
          hazardCategories: ['dangerous_intersections', 'weather_hazards'],
          roadConditions: `${formData.surfaceCondition} surface`,
          weatherImpact: evaluatedResult.alertSummary,
          speedLimit: `${formData.speedLimit} km/h`,
          observedAvgSpeed: `${formData.userSpeed} km/h`,
          recentIncidentsCount: 5,
          recommendedAction: evaluatedResult.recommendations?.[0]?.action || 'Deploy corridor safety audit.',
          radiusMeters: 450,
          isUserEvaluated: true,
          evaluationId,
        };
        return [...prevHotspots, newHotspot];
      }

      return prevHotspots;
    });

    return evaluatedResult;
  }, [currentJourney]);

  /**
   * Clear active journey and clean state
   */
  const clearJourney = useCallback(() => {
    activeJourneyRequestIdRef.current++;
    setCurrentJourney(null);
    setPlanningError(null);
    setIsPlanningJourney(false);
  }, []);

  /**
   * Reset hotspots to factory defaults
   */
  const resetHotspotsToDefault = useCallback(() => {
    setHotspots(SAMPLE_HOTSPOTS_DATA);
    setSelectedHotspotId(SAMPLE_HOTSPOTS_DATA[0].id);
    localStorage.removeItem(STORAGE_KEY_HOTSPOTS);
  }, []);

  // Compute live dashboard statistics directly from active hotspots
  const hotspotStats = calculateHotspotStats(hotspots);

  const value = {
    hotspots,
    selectedHotspotId,
    setSelectedHotspotId,
    currentJourney,
    isPlanningJourney,
    planningError,
    planJourney,
    updateFormInputs,
    evaluateJourney,
    clearJourney,
    resetHotspotsToDefault,
    hotspotStats,
    // MoRTH Official Nationwide Statistics & Benchmarks
    morthMetadata: MORTH_METADATA,
    morthTrends: MORTH_NATIONAL_TRENDS,
    morthStateStats: MORTH_STATE_WISE_2022,
    morthSummary: getMorthNationwideSummary(),
    blackspotMetadata: BLACKSPOT_DATASET_METADATA,
    datasetSourceInfo,
    selectedStateFilter,
    setSelectedStateFilter,
    importBlackspotsData,
    resetDatasetsToOfficial,
    // Monitored Corridors & Real Driving Distance
    monitoredCorridors,
    corridorMetrics,
    isCalculatingCorridors,
    refreshCorridorMetrics,
    addMonitoredCorridor,
    removeMonitoredCorridor,
    resetCorridorsToDefault,
  };

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
}
