import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SAMPLE_HOTSPOTS_DATA, calculateHotspotStats } from '../services/hotspotService.js';
import { geocodeLocation, calculateDrivableRoute, getHaversineDistanceKm } from '../services/routingService.js';
import {
  DEFAULT_MONITORED_CORRIDORS,
  calculateAllMonitoredCorridors,
  getCachedCorridorDistances,
  deduplicateCorridors,
} from '../services/corridorService.js';
import {
  MORTH_METADATA,
  MORTH_NATIONAL_TRENDS,
  MORTH_STATE_WISE_2022,
  getMorthNationwideSummary,
} from '../services/morthDataService.js';
import { BLACKSPOT_DATASET_METADATA } from '../services/blackspotDataService.js';
import { analyzeRouteRisk } from '../utils/routeRiskAnalyzer.js';
import { calculateSimulatedRisk } from '../utils/riskCalculator.js';
import { 
  matchAccidentsToRoute, 
  PREDEFINED_ROUTES 
} from '../services/routeAccidentMatcher.js';

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

  // --- 2. Active Route & Journey State ---
  const defaultInitialRoute = PREDEFINED_ROUTES[0]; // Route A: NH-48 Express Delhi ↔ Gurugram

  const [selectedRouteId, setSelectedRouteId] = useState('route_a');
  const [bufferDistanceKm, setBufferDistanceKm] = useState(5); // Default 5 km buffer
  const [historicalPeriod, setHistoricalPeriod] = useState('all'); // 'all' (2018–2022) | '2020_2022' | '2022'

  const [currentJourney, setCurrentJourney] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JOURNEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.routeData && Array.isArray(parsed.routeData.coordinates)) {
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
    } catch {}

    // Initialize with Route A so the application immediately has active route-specific historical data
    return {
      id: 'JRN-ROUTE-A',
      createdAt: new Date().toISOString(),
      origin: defaultInitialRoute.origin,
      destination: defaultInitialRoute.destination,
      routeData: {
        distanceKm: defaultInitialRoute.distanceKm,
        durationMin: defaultInitialRoute.durationMin,
        coordinates: defaultInitialRoute.coordinates,
      },
      formInputs: {
        corridorName: defaultInitialRoute.name,
        originName: defaultInitialRoute.origin.name,
        destinationName: defaultInitialRoute.destination.name,
        distanceKm: defaultInitialRoute.distanceKm,
        durationMin: defaultInitialRoute.durationMin,
        roadType: 'expressway',
        speedLimit: 80,
        userSpeed: 88,
      },
      status: 'ready',
    };
  });

  const [isPlanningJourney, setIsPlanningJourney] = useState(false);
  const [planningError, setPlanningError] = useState(null);

  const activeJourneyRequestIdRef = useRef(0);

  // Switch between Predefined Routes (Route A, Route B, etc.) or Custom Route
  const selectRouteById = useCallback((routeId) => {
    if (routeId === 'custom') {
      setSelectedRouteId('custom');
      return;
    }

    const found = PREDEFINED_ROUTES.find((r) => r.id === routeId);
    if (!found) return;

    setSelectedRouteId(routeId);
    const newJourney = {
      id: `JRN-${found.id.toUpperCase()}-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      origin: found.origin,
      destination: found.destination,
      routeData: {
        distanceKm: found.distanceKm,
        durationMin: found.durationMin,
        coordinates: found.coordinates,
      },
      formInputs: {
        corridorName: found.name,
        originName: found.origin.name,
        destinationName: found.destination.name,
        distanceKm: found.distanceKm,
        durationMin: found.durationMin,
        roadType: 'expressway',
        speedLimit: 80,
        userSpeed: 88,
      },
      status: 'ready',
    };

    setCurrentJourney(newJourney);
  }, []);

  // --- 3. Route-Specific Historical Accident Metrics (Single Source of Truth) ---
  const routeMetrics = useMemo(() => {
    if (isPlanningJourney) {
      return {
        status: 'calculating',
        totalAccidents: 0,
        fatalAccidents: 0,
        grievousInjuries: 0,
        verifiedBlackspotsCount: 0,
        highRiskBlackspotsCount: 0,
        severityRate: 0,
        riskScore: null,
        riskLevel: 'Calculating...',
        bufferDistanceKm,
        timePeriod: historicalPeriod,
        routeName: 'Calculating Route...',
        routeDistanceKm: 0,
      };
    }

    const coords = currentJourney?.routeData?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
      return {
        status: 'no_route',
        matchedRecords: [],
        totalAccidents: 0,
        fatalAccidents: 0,
        grievousInjuries: 0,
        verifiedBlackspotsCount: 0,
        highRiskBlackspotsCount: 0,
        severityRate: 0,
        riskScore: null,
        riskLevel: 'Insufficient data',
        explanation: 'No route currently active. Select a route above or plan a journey.',
        bufferDistanceKm,
        timePeriod: historicalPeriod,
        routeName: 'No Active Route',
        routeDistanceKm: 0,
      };
    }

    const routeName = currentJourney.formInputs?.corridorName ||
      `${currentJourney.origin?.name || 'Origin'} → ${currentJourney.destination?.name || 'Destination'}`;
    const routeDistanceKm = currentJourney.routeData?.distanceKm || 25;

    return matchAccidentsToRoute(coords, hotspots, {
      bufferDistanceKm,
      timePeriod: historicalPeriod,
      routeDistanceKm,
      routeName,
    });
  }, [currentJourney, hotspots, bufferDistanceKm, historicalPeriod, isPlanningJourney]);

  // --- 4. Monitored Corridors & Real Driving Distance State ---
  const [monitoredCorridors, setMonitoredCorridors] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CORRIDORS_LIST);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return deduplicateCorridors(parsed);
      }
    } catch {}
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
      totalDistanceMeters: 0,
      totalDistanceKm: '0.00',
      formattedDistance: 'Calculating...',
      corridorCount: DEFAULT_MONITORED_CORRIDORS.length,
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
    } catch {}
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
    (force = true) => calculateCorridors(monitoredCorridors, force),
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

  // Persist hotspots
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HOTSPOTS, JSON.stringify(hotspots));
    } catch {}
  }, [hotspots]);

  // Persist journey
  useEffect(() => {
    try {
      if (currentJourney) {
        localStorage.setItem(STORAGE_KEY_JOURNEY, JSON.stringify(currentJourney));
      } else {
        localStorage.removeItem(STORAGE_KEY_JOURNEY);
      }
    } catch {}
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
      const origin = await geocodeLocation(originInput);
      const destination = await geocodeLocation(destInput);

      if (requestId !== activeJourneyRequestIdRef.current) return null;

      const routeData = await calculateDrivableRoute(origin, destination);
      if (requestId !== activeJourneyRequestIdRef.current) return null;

      const riskAnalysis = await analyzeRouteRisk(routeData, origin, destination);
      if (requestId !== activeJourneyRequestIdRef.current) return null;

      const routeCoords = routeData.coordinates || [];
      const alongRouteHotspotIds = [];
      hotspots.forEach((hs) => {
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

      const journeyId = `JRN-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      const defaultWeather = riskAnalysis?.evaluatedSegments?.[0]?.weatherSnapshot?.weatherKey || 'heavy_rain';
      const defaultSurface = riskAnalysis?.evaluatedSegments?.[0]?.weatherSnapshot?.surfaceCondition || 'waterlogged';
      const defaultTime = riskAnalysis?.evaluatedSegments?.[0]?.circadianContext?.timeOfDay || 'late_night';
      const defaultLighting = riskAnalysis?.evaluatedSegments?.[0]?.circadianContext?.lighting || 'unlit';

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
        evaluationResult: null,
        status: 'ready',
      };

      setSelectedRouteId('custom');
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
   * Submit an evaluation for the active journey or standalone inputs.
   * Runs the risk evaluation engine, generates an evaluation ID, attaches it to the journey,
   * and updates any matching hotspots in the shared dataset without duplicating.
   */
  const evaluateJourney = useCallback((formData) => {
    if (!formData) return null;

    const evaluationId = `EVAL-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const evaluatedResult = calculateSimulatedRisk({
      ...formData,
      journeyId: currentJourney?.id,
      evaluationId,
    });

    if (currentJourney) {
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
            roadConditions: `${(formData.surfaceCondition || 'dry').replace('_', ' ')} • ${(formData.weather || 'clear').replace('_', ' ')}`,
            weatherImpact: evaluatedResult.alertSummary,
            recommendedAction: evaluatedResult.recommendations?.[0]?.action || existing.recommendedAction,
            lastEvaluated: new Date().toISOString(),
            evaluationId,
          };
          return updated;
        }

        // If no matching hotspot found and risk is severe/high, add one cleanly labeled
        if (evaluatedResult.score >= 65 && currentJourney.origin) {
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
            roadConditions: `${formData.surfaceCondition || 'dry'} surface`,
            weatherImpact: evaluatedResult.alertSummary,
            speedLimit: `${formData.speedLimit || 80} km/h`,
            observedAvgSpeed: `${formData.userSpeed || 80} km/h`,
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
    }

    return evaluatedResult;
  }, [currentJourney]);

  const clearJourney = useCallback(() => {
    activeJourneyRequestIdRef.current++;
    setCurrentJourney(null);
    setSelectedRouteId('custom');
    setPlanningError(null);
    setIsPlanningJourney(false);
  }, []);

  const resetHotspotsToDefault = useCallback(() => {
    setHotspots(SAMPLE_HOTSPOTS_DATA);
    setSelectedHotspotId(SAMPLE_HOTSPOTS_DATA[0].id);
    localStorage.removeItem(STORAGE_KEY_HOTSPOTS);
  }, []);

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
    // Route-Specific Historical Accident Analytics
    routeMetrics,
    selectedRouteId,
    selectRouteById,
    bufferDistanceKm,
    setBufferDistanceKm,
    historicalPeriod,
    setHistoricalPeriod,
    predefinedRoutes: PREDEFINED_ROUTES,
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
    // Monitored Corridors
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
