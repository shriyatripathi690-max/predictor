import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  Info, 
  Check, 
  Crosshair, 
  RotateCcw, 
  Maximize2, 
  ZoomIn, 
  ZoomOut,
  Eye,
  EyeOff,
  Activity,
  AlertTriangle,
  Compass,
  X,
  Route,
  ArrowRight,
  Search,
  Layers,
  Database
} from 'lucide-react';
import { 
  HAZARD_CATEGORIES, 
  calculateHotspotStats 
} from '../services/hotspotService';
import { 
  MORTH_STATE_WISE_2022
} from '../services/morthDataService';
import { useJourney } from '../context/JourneyContext';

const INDIA_CENTROID = [22.9734, 78.6569];
const INDIA_DEFAULT_ZOOM = 5;

export function AccidentHotspotsMap({ onSelectHotspot }) {
  const { 
    hotspots: contextHotspots,
    selectedHotspotId: contextSelectedHotspotId,
    setSelectedHotspotId: setContextSelectedHotspotId,
    currentJourney,
    clearJourney,
    resetHotspotsToDefault,
    corridorMetrics,
    selectedStateFilter: globalStateFilter,
    setSelectedStateFilter: setGlobalStateFilter,
    datasetSourceInfo
  } = useJourney();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const circlesLayerRef = useRef(null);
  const clustersLayerRef = useRef(null);
  const corridorsLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const lastFittedJourneyIdRef = useRef(null);

  // --- Filtering & View States ---
  const [selectedHotspotId, setSelectedHotspotId] = useState(
    contextSelectedHotspotId || contextHotspots[0]?.id || 'IN-BS-TN01'
  );
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedState, setSelectedState] = useState(globalStateFilter || 'ALL');
  const [selectedHighway, setSelectedHighway] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentZoom, setCurrentZoom] = useState(INDIA_DEFAULT_ZOOM);
  const [forceIndividualPins, setForceIndividualPins] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);
  const [showRouteHud, setShowRouteHud] = useState(true);

  // Collapsible Map Panels States (Defaults: expanded on desktop, compact floating pill on mobile)
  const [isNationwideExpanded, setIsNationwideExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isVerifiedExpanded, setIsVerifiedExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isLegendExpanded, setIsLegendExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Sync state filter with context
  useEffect(() => {
    if (globalStateFilter && globalStateFilter !== selectedState) {
      setSelectedState(globalStateFilter);
    }
  }, [globalStateFilter]);

  const handleStateChange = (newState) => {
    setSelectedState(newState);
    if (setGlobalStateFilter) {
      setGlobalStateFilter(newState);
    }
    // Pan and zoom to state centroid if valid state selected
    if (newState !== 'ALL' && mapInstanceRef.current) {
      const stateObj = MORTH_STATE_WISE_2022.find(
        (s) => s.state.toLowerCase() === newState.toLowerCase() || s.code.toLowerCase() === newState.toLowerCase()
      );
      if (stateObj?.centroid) {
        mapInstanceRef.current.flyTo(stateObj.centroid, 8, { duration: 1.2 });
      }
    } else if (newState === 'ALL' && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(INDIA_CENTROID, INDIA_DEFAULT_ZOOM, { duration: 1.2 });
    }
  };

  // Active Hazard Layer Checkboxes (6 Categories)
  const [activeLayers, setActiveLayers] = useState({
    dangerous_intersections: true,
    traffic_congestion: true,
    distraction_hazards: true,
    pedestrian_safety: true,
    weather_hazards: true,
    parking_hazards: true,
  });

  const toggleLayer = (layerKey) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  // Count of active hazard categories (out of 6)
  const activeCategoriesCount = useMemo(() => {
    return Object.values(activeLayers).filter(Boolean).length;
  }, [activeLayers]);

  // Mutual exclusion on mobile (< 640px) to prevent bottom panels collision
  const toggleVerified = useCallback(() => {
    setIsVerifiedExpanded((prev) => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && window.innerWidth < 640) {
        setIsLegendExpanded(false);
      }
      return next;
    });
  }, []);

  const toggleLegend = useCallback(() => {
    setIsLegendExpanded((prev) => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && window.innerWidth < 640) {
        setIsVerifiedExpanded(false);
      }
      return next;
    });
  }, []);

  const toggleNationwide = useCallback(() => {
    setIsNationwideExpanded((prev) => !prev);
  }, []);

  const areAllPanelsCollapsed = !isNationwideExpanded && !isVerifiedExpanded && !isLegendExpanded;

  const handleToggleAllPanels = useCallback(() => {
    if (areAllPanelsCollapsed) {
      setIsNationwideExpanded(true);
      setIsVerifiedExpanded(true);
      setIsLegendExpanded(true);
    } else {
      setIsNationwideExpanded(false);
      setIsVerifiedExpanded(false);
      setIsLegendExpanded(false);
    }
  }, [areAllPanelsCollapsed]);

  // Reset all filters and view back to India
  const resetAllFilters = () => {
    setActiveLayers({
      dangerous_intersections: true,
      traffic_congestion: true,
      distraction_hazards: true,
      pedestrian_safety: true,
      weather_hazards: true,
      parking_hazards: true,
    });
    setSeverityFilter('ALL');
    setSelectedState('ALL');
    setSelectedHighway('ALL');
    setSearchQuery('');
    if (setGlobalStateFilter) {
      setGlobalStateFilter('ALL');
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(INDIA_CENTROID, INDIA_DEFAULT_ZOOM, { duration: 1.2 });
    }
  };

  const isFiltered = useMemo(() => {
    if (severityFilter !== 'ALL') return true;
    if (selectedState !== 'ALL') return true;
    if (selectedHighway !== 'ALL') return true;
    if (searchQuery.trim() !== '') return true;
    return Object.values(activeLayers).some((val) => !val);
  }, [severityFilter, selectedState, selectedHighway, searchQuery, activeLayers]);

  // Unique highways present in current dataset
  const availableHighways = useMemo(() => {
    const set = new Set();
    contextHotspots.forEach((h) => {
      if (h.highway) set.add(h.highway.trim());
    });
    return Array.from(set).sort();
  }, [contextHotspots]);

  // States with counts of verified geolocated blackspots
  const stateSummaryList = useMemo(() => {
    const counts = {};
    contextHotspots.forEach((h) => {
      const st = h.state || 'Unknown';
      counts[st] = (counts[st] || 0) + 1;
    });

    return MORTH_STATE_WISE_2022.map((s) => ({
      ...s,
      blackspotCount: counts[s.state] || 0,
    })).sort((a, b) => b.blackspotCount - a.blackspotCount || b.totalAccidents - a.totalAccidents);
  }, [contextHotspots]);

  // Derive visible hotspots synchronously from shared context hotspots
  const visibleHotspots = useMemo(() => {
    let result = [...contextHotspots];

    // 1. State Filter
    if (selectedState && selectedState !== 'ALL') {
      result = result.filter(
        (hs) => (hs.state || '').toLowerCase() === selectedState.toLowerCase()
      );
    }

    // 2. Highway Filter
    if (selectedHighway && selectedHighway !== 'ALL') {
      result = result.filter((hs) => (hs.highway || '').includes(selectedHighway));
    }

    // 3. Search Query Filter (name, district, state, highway, or ID)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (hs) =>
          (hs.name || '').toLowerCase().includes(q) ||
          (hs.district || '').toLowerCase().includes(q) ||
          (hs.state || '').toLowerCase().includes(q) ||
          (hs.highway || '').toLowerCase().includes(q) ||
          (hs.id || '').toLowerCase().includes(q) ||
          (hs.primaryCause || '').toLowerCase().includes(q)
      );
    }

    // 4. Severity Filter
    if (severityFilter && severityFilter !== 'ALL') {
      result = result.filter((hs) => {
        if (severityFilter === 'SEVERE') return hs.riskLevel === 'Severe';
        if (severityFilter === 'HIGH') return hs.riskLevel === 'High' || hs.riskLevel === 'Severe';
        if (severityFilter === 'MODERATE') return hs.riskLevel === 'Moderate';
        if (severityFilter === 'LOW') return hs.riskLevel === 'Low';
        return true;
      });
    }

    // 5. Active Hazard Category Checkboxes
    const activeKeys = Object.keys(activeLayers).filter((k) => activeLayers[k]);
    if (activeKeys.length > 0) {
      result = result.filter((hs) => {
        if (!hs.hazardCategories || hs.hazardCategories.length === 0) return true;
        return hs.hazardCategories.some((cat) => activeKeys.includes(cat));
      });
    } else {
      return [];
    }

    return result;
  }, [contextHotspots, selectedState, selectedHighway, searchQuery, severityFilter, activeLayers]);

  // Active selected hotspot derived purely during render
  const selectedHotspot = useMemo(() => {
    const found = contextHotspots.find((h) => h.id === selectedHotspotId);
    if (found) return found;
    return visibleHotspots.length > 0 ? visibleHotspots[0] : null;
  }, [contextHotspots, visibleHotspots, selectedHotspotId]);

  // State Macro Statistics if a state is selected
  const selectedStateMorthStats = useMemo(() => {
    if (selectedState === 'ALL') return null;
    return MORTH_STATE_WISE_2022.find(
      (s) => s.state.toLowerCase() === selectedState.toLowerCase()
    ) || null;
  }, [selectedState]);

  // Dynamic statistics calculated directly from currently visible hotspots
  const stats = useMemo(() => {
    return calculateHotspotStats(visibleHotspots);
  }, [visibleHotspots]);

  // Synchronize selection with context
  const handleSelectHotspot = useCallback((hotspot) => {
    if (!hotspot) return;
    setSelectedHotspotId(hotspot.id);
    if (setContextSelectedHotspotId) {
      setContextSelectedHotspotId(hotspot.id);
    }
  }, [setContextSelectedHotspotId]);

  // --- 1. Initialize Leaflet Map Centered on India ---
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent duplicate initialization

    const map = L.map(mapContainerRef.current, {
      center: INDIA_CENTROID,
      zoom: INDIA_DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
      minZoom: 4,
      maxZoom: 19,
    });

    // Standard OpenStreetMap tile layer (Permitted & reliable)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors | MoRTH &amp; NHAI Verified Data',
      maxZoom: 19,
    }).addTo(map);

    // Initial size invalidation
    const invalidateTimer = setTimeout(() => {
      if (mapInstanceRef.current && mapInstanceRef.current._container) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    // Layer groups for markers, circles, clusters, corridors, and planned route polyline
    const circlesLayer = L.layerGroup().addTo(map);
    const corridorsLayer = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);
    const clustersLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;
    circlesLayerRef.current = circlesLayer;
    clustersLayerRef.current = clustersLayer;
    corridorsLayerRef.current = corridorsLayer;
    routeLayerRef.current = routeLayer;

    // Track map zoom for dynamic clustering vs individual pin transition
    map.on('zoomend', () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
    });

    // Handle map resize when layout changes
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current && mapInstanceRef.current._container) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      clearTimeout(invalidateTimer);
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // --- 2. Update Leaflet Markers, Hazard Circles & Regional Clusters on Data/Zoom Change ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const circlesLayer = circlesLayerRef.current;
    const clustersLayer = clustersLayerRef.current;

    if (!map || !markersLayer || !circlesLayer || !clustersLayer) return;

    markersLayer.clearLayers();
    circlesLayer.clearLayers();
    clustersLayer.clearLayers();

    // Mode A: High Zoom (>= 7) OR user forced individual pins OR single state filtered
    const showIndividualPins = currentZoom >= 7 || forceIndividualPins || selectedState !== 'ALL';

    if (!showIndividualPins) {
      // Zoom < 7: Render State-Level Density Clusters across India
      stateSummaryList.forEach((st) => {
        if (!st.centroid) return;

        const hasBlackspots = st.blackspotCount > 0;
        const badgeColor = st.severityIndex > 40 ? '#ef4444' : st.severityIndex > 28 ? '#ff6a00' : '#10b981';

        const clusterIconHtml = `
          <div class="cursor-pointer group select-none" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <span style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: ${badgeColor}; opacity: 0.25; filter: blur(3px);" class="${hasBlackspots ? 'animate-pulse' : ''}"></span>
              <div style="position: relative; z-index: 10; background: #12151e; border: 2px solid ${badgeColor}; border-radius: 9999px; min-width: 38px; height: 38px; padding: 0 6px; display: flex; align-items: center; justify-content: center; gap: 3px; box-shadow: 0 4px 14px rgba(0,0,0,0.85);">
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; color: #ffffff;">${st.code}</span>
                ${hasBlackspots ? `<span style="background: ${badgeColor}; color: #fff; font-size: 9px; font-weight: 900; padding: 1px 4px; border-radius: 9999px; margin-left: 1px;">${st.blackspotCount}</span>` : ''}
              </div>
            </div>
            <div style="margin-top: 2px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 1px 4px; font-size: 8.5px; color: #cbd5e1; font-weight: 600; white-space: nowrap; pointer-events: none;">
              ${st.state}
            </div>
          </div>
        `;

        const clusterIcon = L.divIcon({
          html: clusterIconHtml,
          className: 'custom-leaflet-cluster-badge',
          iconSize: [60, 52],
          iconAnchor: [30, 26],
          popupAnchor: [0, -22],
        });

        const clusterMarker = L.marker(st.centroid, { icon: clusterIcon });

        const clusterPopupHtml = `
          <div style="min-width: 210px; font-family: 'Plus Jakarta Sans', Inter, sans-serif; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px; margin-bottom: 6px;">
              <strong style="color: #ffffff; font-size: 13px;">${st.state} (${st.code})</strong>
              <span style="font-size: 10px; font-weight: 800; color: ${badgeColor}; font-family: monospace;">MoRTH Rank #${st.rankAccidents}</span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin-bottom: 8px;">
              <div>• Total Reported Accidents: <strong style="color: #fff;">${st.totalAccidents.toLocaleString()}</strong></div>
              <div>• Total Fatalities: <strong style="color: #ef4444;">${st.fatalities.toLocaleString()}</strong></div>
              <div>• Severity Index: <strong style="color: ${badgeColor};">${st.severityIndex}%</strong></div>
              <div>• Verified NH Blackspots: <strong style="color: #38bdf8;">${st.blackspotCount} Nodes</strong></div>
            </div>
            <button id="zoom-state-btn-${st.code}" style="width: 100%; background: #ff6a00; border: none; border-radius: 6px; color: #fff; font-size: 10px; font-weight: 700; padding: 5px 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span>Zoom to State Hotspots</span>
              <span>&rarr;</span>
            </button>
          </div>
        `;

        clusterMarker.bindPopup(clusterPopupHtml);

        clusterMarker.on('popupopen', () => {
          const btn = document.getElementById(`zoom-state-btn-${st.code}`);
          if (btn) {
            btn.onclick = () => {
              handleStateChange(st.state);
            };
          }
        });

        clusterMarker.on('click', () => {
          // If clicked without popup, prompt smooth zoom
          map.flyTo(st.centroid, 8, { duration: 1.2 });
        });

        clusterMarker.addTo(clustersLayer);
      });
    }

    // Mode B: Individual Verified Blackspot Pins (shown at zoom >= 7 or forced)
    const alongRouteIds = currentJourney?.alongRouteHotspotIds || [];

    visibleHotspots.forEach((hotspot) => {
      const isSelected = selectedHotspot?.id === hotspot.id;
      const isAlongRoute = alongRouteIds.includes(hotspot.id);
      const isSevere = hotspot.riskLevel === 'Severe';
      const isHigh = hotspot.riskCategory === 'high' || hotspot.riskLevel === 'High' || isSevere;
      const isMedium = hotspot.riskCategory === 'medium' || hotspot.riskLevel === 'Moderate';

      const markerColor = isSevere ? '#ef4444' : isHigh ? '#ff6a00' : isMedium ? '#ff9800' : '#10b981';
      const circleFillColor = isSevere ? 'rgba(239, 68, 68, 0.22)' : isHigh ? 'rgba(255, 106, 0, 0.2)' : isMedium ? 'rgba(255, 152, 0, 0.18)' : 'rgba(16, 185, 129, 0.16)';
      const circleStrokeColor = isSevere ? '#ef4444' : isHigh ? '#ff6a00' : isMedium ? '#ff9800' : '#10b981';

      // 1. Draw Translucent Hazard Propagation Radius Circle
      const hazardCircle = L.circle([hotspot.lat, hotspot.lng], {
        radius: hotspot.radiusMeters || 450,
        color: isAlongRoute ? '#06b6d4' : circleStrokeColor,
        weight: isSelected ? 2.5 : isAlongRoute ? 2 : 1.2,
        dashArray: isSelected ? '4, 4' : undefined,
        fillColor: isAlongRoute ? 'rgba(6, 182, 212, 0.28)' : circleFillColor,
        fillOpacity: isSelected ? 0.45 : 0.22,
      });

      hazardCircle.on('click', () => {
        handleSelectHotspot(hotspot);
      });
      hazardCircle.addTo(circlesLayer);

      // 2. Custom Glowing DivIcon
      const iconHtml = `
        <div class="relative group cursor-pointer" style="width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;">
          ${isAlongRoute ? `
            <div style="position: absolute; width: 50px; height: 50px; border-radius: 9999px; background: rgba(6, 182, 212, 0.35); filter: blur(4px);" class="animate-ping"></div>
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; border: 1.5px dashed #06b6d4; opacity: 0.9;"></div>
          ` : `
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: ${markerColor}; opacity: ${isSelected ? '0.45' : '0.25'}; filter: blur(4px);" class="animate-pulse"></div>
          `}
          
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; border: 1.5px solid ${isAlongRoute ? '#06b6d4' : markerColor}; opacity: ${isSelected ? '0.95' : '0.5'}; transform: scale(${isSelected ? '1.2' : '1'}); transition: all 0.2s;"></div>

          <div style="position: relative; z-index: 10; background: #12151e; border: 1.5px solid ${isAlongRoute ? '#06b6d4' : markerColor}; border-radius: 9999px; padding: 2px 7px; display: flex; align-items: center; gap: 3px; box-shadow: 0 4px 15px rgba(0,0,0,0.8), 0 0 10px ${markerColor}60; transform: scale(${isSelected ? '1.15' : '1'}); transition: transform 0.15s ease;">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background: ${markerColor};"></span>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">${hotspot.id}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-marker',
        iconSize: [52, 52],
        iconAnchor: [26, 26],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([hotspot.lat, hotspot.lng], {
        icon: customIcon,
        riseOnHover: true,
      });

      // 3. Custom Rich Leaflet Popup with Provenance & Empirical Metrics
      const popupContent = document.createElement('div');
      popupContent.className = 'hotspot-popup-card';
      popupContent.innerHTML = `
        <div style="min-width: 250px; font-family: 'Plus Jakarta Sans', Inter, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; margin-bottom: 8px;">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; background: #1f2330; padding: 2px 6px; border-radius: 4px; color: #cbd5e1; border: 1px solid #343b50;">NODE: ${hotspot.id}</span>
            <span style="font-size: 11px; font-weight: 800; color: ${markerColor}; text-transform: uppercase;">${hotspot.riskLevel} (${hotspot.riskScore}/100)</span>
          </div>

          ${isAlongRoute ? `
            <div style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 6px; padding: 4px 8px; margin-bottom: 8px; font-size: 10px; color: #67e8f9; font-weight: 700; display: flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #06b6d4;"></span>
              <span>Lies Directly Along Planned Route Corridor</span>
            </div>
          ` : ''}

          <h4 style="font-size: 13px; font-weight: 700; color: #ffffff; margin: 0 0 2px 0; line-height: 1.3;">${hotspot.name}</h4>
          <p style="font-size: 11px; color: #94a3b8; margin: 0 0 8px 0;">${hotspot.district ? `${hotspot.district}, ` : ''}${hotspot.state} • ${hotspot.highway || hotspot.roadType}</p>
          
          <!-- Empirical Record Details -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; background: rgba(12, 14, 20, 0.75); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 6px; margin-bottom: 8px; font-size: 10.5px;">
            <div>
              <span style="color: #94a3b8; font-size: 9.5px;">Accidents (3Y):</span>
              <div style="color: #fff; font-weight: bold; font-family: monospace;">${hotspot.accidents || hotspot.recentIncidentsCount}</div>
            </div>
            <div>
              <span style="color: #94a3b8; font-size: 9.5px;">Fatalities:</span>
              <div style="color: #ef4444; font-weight: bold; font-family: monospace;">${hotspot.fatalities || 0}</div>
            </div>
          </div>

          <div style="background: rgba(12, 14, 20, 0.75); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 6px 8px; margin-bottom: 8px; font-size: 10.5px;">
            <div style="color: #cbd5e1; font-weight: 600; margin-bottom: 2px;">Primary Hazard:</div>
            <div style="color: #e2e8f0;">${hotspot.primaryCause}</div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; margin-bottom: 8px;">
            <span>Speed: <strong style="color: #fff;">${hotspot.speedLimit}</strong></span>
            <span>Observed: <strong style="color: #ff6a00;">${hotspot.observedAvgSpeed}</strong></span>
          </div>

          <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px;">
            <button id="inspect-btn-${hotspot.id}" style="width: 100%; background: #ff6a00; border: none; border-radius: 6px; color: #fff; font-size: 10px; font-weight: 700; padding: 5px 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: background 0.15s;">
              <span>Inspect Full Analytics</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        handleSelectHotspot(hotspot);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`inspect-btn-${hotspot.id}`);
        if (btn) {
          btn.onclick = () => {
            handleSelectHotspot(hotspot);
            if (onSelectHotspot) {
              onSelectHotspot(hotspot);
            }
          };
        }
      });

      marker.addTo(markersLayer);
    });
  }, [
    visibleHotspots, 
    selectedHotspot, 
    currentJourney, 
    currentZoom, 
    forceIndividualPins, 
    selectedState, 
    stateSummaryList, 
    handleSelectHotspot, 
    onSelectHotspot
  ]);

  // --- 3. Render Planned Route Polyline, Origin/Destination Markers & Risk Segments ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !routeLayer) return;

    routeLayer.clearLayers();

    if (!currentJourney || !currentJourney.routeData || !currentJourney.routeData.coordinates) {
      return;
    }

    const coords = currentJourney.routeData.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return;

    const latLngs = coords.map(([lon, lat]) => [lat, lon]);

    // 1. Cyan Glow Polyline
    const outerGlowPolyline = L.polyline(latLngs, {
      color: '#06b6d4',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round',
    });
    outerGlowPolyline.addTo(routeLayer);

    const innerCorePolyline = L.polyline(latLngs, {
      color: '#22d3ee',
      weight: 3.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    });
    innerCorePolyline.addTo(routeLayer);

    // 2. Risk segments along route
    try {
      const segments = currentJourney.riskAnalysis?.evaluatedSegments;
      if (Array.isArray(segments) && segments.length > 0) {
        segments.forEach((seg) => {
          if (!seg) return;

          let segCoords = null;
          if (Array.isArray(seg.coordinates) && seg.coordinates.length >= 2) {
            segCoords = seg.coordinates;
          } else if (Array.isArray(seg.pathCoordinates) && seg.pathCoordinates.length >= 2) {
            segCoords = seg.pathCoordinates;
          } else if (typeof seg.startIndex === 'number' && typeof seg.endIndex === 'number') {
            segCoords = coords.slice(seg.startIndex, seg.endIndex + 1);
          }

          if (!Array.isArray(segCoords) || segCoords.length < 2) return;

          const segLatLngs = segCoords
            .filter((pt) => Array.isArray(pt) && pt.length >= 2 && !isNaN(pt[0]) && !isNaN(pt[1]))
            .map(([lon, lat]) => [lat, lon]);

          if (segLatLngs.length < 2) return;

          const segColor = seg.riskCategory === 'Severe'
            ? '#ef4444'
            : seg.riskCategory === 'High'
            ? '#ff6a00'
            : seg.riskCategory === 'Moderate'
            ? '#f59e0b'
            : '#10b981';

          const segmentLine = L.polyline(segLatLngs, {
            color: segColor,
            weight: 5,
            opacity: 0.9,
            dashArray: seg.riskCategory === 'Severe' ? '6, 6' : undefined,
            lineCap: 'round',
          });

          segmentLine.bindTooltip(
            `<strong>${seg.title || seg.name || 'Corridor Segment'}</strong><br/>Risk Score: ${seg.riskScore || seg.compositeScore || 50}/100 (${seg.riskCategory || 'Assessing'})`,
            { sticky: true, className: 'leaflet-segment-tooltip' }
          );

          segmentLine.addTo(routeLayer);
        });
      }
    } catch (segErr) {
      console.warn('Non-fatal route segment styling warning:', segErr);
    }

    // 3. Origin Marker 'A'
    if (currentJourney.origin && currentJourney.origin.lat != null && currentJourney.origin.lon != null) {
      const originIcon = L.divIcon({
        html: `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
            <span style="position: absolute; width: 38px; height: 38px; border-radius: 9999px; background: rgba(16, 185, 129, 0.45); filter: blur(4px);" class="animate-pulse"></span>
            <div style="background: #022c22; border: 2px solid #10b981; border-radius: 9999px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(16, 185, 129, 0.7); color: #ffffff; font-weight: 800; font-size: 12px; font-family: monospace;">
              A
            </div>
          </div>
        `,
        className: 'custom-leaflet-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const originMarker = L.marker([currentJourney.origin.lat, currentJourney.origin.lon], {
        icon: originIcon,
        zIndexOffset: 1000,
      });
      originMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 11px;">
          <span style="color: #10b981; font-weight: bold; font-size: 10px; text-transform: uppercase;">Journey Origin</span>
          <h4 style="margin: 2px 0; color: #fff; font-weight: bold;">${currentJourney.origin.name || 'Origin Node'}</h4>
          <p style="margin: 0; color: #94a3b8; font-family: monospace;">${Number(currentJourney.origin.lat).toFixed(4)}° N, ${Number(currentJourney.origin.lon).toFixed(4)}° E</p>
        </div>
      `);
      originMarker.addTo(routeLayer);
    }

    // 4. Destination Marker 'B'
    if (currentJourney.destination && currentJourney.destination.lat != null && currentJourney.destination.lon != null) {
      const destIcon = L.divIcon({
        html: `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
            <span style="position: absolute; width: 38px; height: 38px; border-radius: 9999px; background: rgba(255, 106, 0, 0.45); filter: blur(4px);" class="animate-pulse"></span>
            <div style="background: #431407; border: 2px solid #ff6a00; border-radius: 9999px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(255, 106, 0, 0.7); color: #ffffff; font-weight: 800; font-size: 12px; font-family: monospace;">
              B
            </div>
          </div>
        `,
        className: 'custom-leaflet-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const destMarker = L.marker([currentJourney.destination.lat, currentJourney.destination.lon], {
        icon: destIcon,
        zIndexOffset: 1000,
      });
      destMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 11px;">
          <span style="color: #ff6a00; font-weight: bold; font-size: 10px; text-transform: uppercase;">Journey Destination</span>
          <h4 style="margin: 2px 0; color: #fff; font-weight: bold;">${currentJourney.destination.name || 'Destination Node'}</h4>
          <p style="margin: 0; color: #94a3b8; font-family: monospace;">${Number(currentJourney.destination.lat).toFixed(4)}° N, ${Number(currentJourney.destination.lon).toFixed(4)}° E</p>
        </div>
      `);
      destMarker.addTo(routeLayer);
    }

    // Automatically zoom and pan map to fit complete route
    if (lastFittedJourneyIdRef.current !== currentJourney.id && latLngs.length > 0) {
      lastFittedJourneyIdRef.current = currentJourney.id;
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, {
        padding: [70, 70],
        maxZoom: 14,
        animate: true,
        duration: 1.2,
      });
    }
  }, [currentJourney]);

  // --- 4. Render Monitored Corridors Network Polylines on Map ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    const corridorsLayer = corridorsLayerRef.current;
    if (!map || !corridorsLayer) return;

    corridorsLayer.clearLayers();

    const activeCorridors = corridorMetrics?.corridors;
    if (!Array.isArray(activeCorridors) || activeCorridors.length === 0) return;

    activeCorridors.forEach((c) => {
      if (!Array.isArray(c.coordinates) || c.coordinates.length < 2) return;
      const latLngs = c.coordinates.map(([lon, lat]) => [lat, lon]);

      const corridorPolyline = L.polyline(latLngs, {
        color: '#0284c7',
        weight: 3,
        opacity: currentJourney?.routeData ? 0.35 : 0.65,
        dashArray: '6, 8',
        lineCap: 'round',
        lineJoin: 'round',
      });

      corridorPolyline.bindTooltip(
        `<strong>${c.id}: ${c.name}</strong><br/>Exact Driving Distance: <strong>${c.formattedKm || `${(c.distanceMeters / 1000).toFixed(2)} km`}</strong><br/><span style="color: #94a3b8; font-size: 10px;">OSRM Road Network</span>`,
        { sticky: true, className: 'leaflet-segment-tooltip' }
      );

      corridorPolyline.addTo(corridorsLayer);
    });
  }, [corridorMetrics?.corridors, currentJourney?.routeData]);

  // Center Map on Selected Hotspot
  const handleCenterOnHotspot = useCallback((hotspot) => {
    if (!mapInstanceRef.current || !hotspot) return;
    mapInstanceRef.current.flyTo([hotspot.lat, hotspot.lng], 14, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
    handleSelectHotspot(hotspot);
  }, [handleSelectHotspot]);

  // Fit Bounds to Entire Planned Route
  const handleFitRouteBounds = useCallback(() => {
    if (!mapInstanceRef.current || !Array.isArray(currentJourney?.routeData?.coordinates)) return;
    const coords = currentJourney.routeData.coordinates;
    const latLngs = coords
      .filter((pt) => Array.isArray(pt) && pt.length >= 2 && !isNaN(pt[0]) && !isNaN(pt[1]))
      .map(([lon, lat]) => [lat, lon]);
    if (latLngs.length === 0) return;
    const bounds = L.latLngBounds(latLngs);
    mapInstanceRef.current.fitBounds(bounds, {
      padding: [70, 70],
      maxZoom: 14,
      animate: true,
      duration: 1.0,
    });
  }, [currentJourney]);

  // Fit Bounds to All Visible Hotspots
  const handleFitAllHotspots = useCallback(() => {
    if (!mapInstanceRef.current) return;
    if (visibleHotspots.length === 0) {
      mapInstanceRef.current.flyTo(INDIA_CENTROID, INDIA_DEFAULT_ZOOM, { duration: 1.2 });
      return;
    }
    const bounds = L.latLngBounds(visibleHotspots.map((h) => [h.lat, h.lng]));
    mapInstanceRef.current.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 14,
      animate: true,
      duration: 1,
    });
  }, [visibleHotspots]);

  // Reset Map View to India Centroid
  const handleResetToIndia = useCallback(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(INDIA_CENTROID, INDIA_DEFAULT_ZOOM, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
    setSelectedState('ALL');
    if (setGlobalStateFilter) setGlobalStateFilter('ALL');
  }, [setGlobalStateFilter]);

  // Browser Geolocation (Locate Me)
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationNotice({
        type: 'error',
        message: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setLocationNotice({
      type: 'info',
      message: 'Requesting browser location permission...',
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const map = mapInstanceRef.current;
        if (!map) return;

        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
        }

        const userIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center" style="width: 32px; height: 32px;">
              <span class="absolute w-8 h-8 rounded-full bg-cyan-500/30 animate-ping"></span>
              <span class="absolute w-5 h-5 rounded-full bg-cyan-500/60"></span>
              <span class="relative w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-white shadow-lg"></span>
            </div>
          `,
          className: 'custom-leaflet-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const userMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
        userMarker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; padding: 4px;">
            <strong style="color: #38bdf8;">Your Current Location</strong>
            <p style="margin: 4px 0 0; color: #94a3b8; font-family: monospace;">${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E</p>
          </div>
        `).openPopup();

        userMarkerRef.current = userMarker;
        map.flyTo([latitude, longitude], 13, { duration: 1.5 });

        setLocationNotice({
          type: 'success',
          message: 'Location centered on your current coordinates.',
        });
        setTimeout(() => setLocationNotice(null), 4000);
      },
      (error) => {
        let msg = 'Unable to access your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. All-India grid remains active.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        setLocationNotice({ type: 'warning', message: msg });
        setTimeout(() => setLocationNotice(null), 5000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  return (
    <div className="charcoal-card rounded-2xl border border-charcoal-750/90 shadow-card-dark overflow-hidden backdrop-blur-xl">
      
      {/* Top Map Toolbar: Search, Filters & View Controls */}
      <div className="px-5 py-3.5 border-b border-charcoal-750/80 bg-charcoal-900/90 flex flex-col gap-3">
        
        {/* Row 1: Title, Route Connection & Fast Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-orange/15 text-brand-orange border border-brand-orange/30 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Nationwide Hotspot Intelligence &amp; GIS Blackspot Map
                </h3>
                {currentJourney ? (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>Route Connected</span>
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>All-India GIS Active</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {currentJourney 
                  ? `Displaying route polyline: ${currentJourney.origin?.name} → ${currentJourney.destination?.name}` 
                  : 'MoRTH state census & verified NHAI geolocated blackspots across Indian national corridors.'}
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex items-center space-x-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state, highway, city, or ID..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-orange transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Reset All-India View Button */}
            <button
              onClick={handleResetToIndia}
              title="Reset map view to entire India"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-charcoal-800 text-slate-300 hover:text-white hover:bg-charcoal-750 border border-charcoal-700 text-xs transition cursor-pointer shrink-0"
            >
              <Compass className="w-3.5 h-3.5 text-brand-orange" />
              <span className="hidden sm:inline">All-India View</span>
            </button>
          </div>

        </div>

        {/* Row 2: State Filter, Highway Filter, Severity Filter & Toggle Pins */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-charcoal-800/60">
          
          <div className="flex flex-wrap items-center gap-2">
            
            {/* State Filter Dropdown */}
            <div className="flex items-center space-x-1.5 bg-charcoal-850 px-2.5 py-1 rounded-xl border border-charcoal-750">
              <span className="text-[10px] text-slate-400 font-mono uppercase">State:</span>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL" className="bg-charcoal-900 text-white">All India (36 States/UTs)</option>
                {stateSummaryList.map((st) => (
                  <option key={st.state} value={st.state} className="bg-charcoal-900 text-white">
                    {st.state} {st.blackspotCount > 0 ? `(${st.blackspotCount} blackspots)` : `(Macro census)`}
                  </option>
                ))}
              </select>
            </div>

            {/* Highway Filter Dropdown */}
            <div className="flex items-center space-x-1.5 bg-charcoal-850 px-2.5 py-1 rounded-xl border border-charcoal-750">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Corridor:</span>
              <select
                value={selectedHighway}
                onChange={(e) => setSelectedHighway(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1 max-w-[150px] truncate"
              >
                <option value="ALL" className="bg-charcoal-900 text-white">All Highways</option>
                {availableHighways.map((hw) => (
                  <option key={hw} value={hw} className="bg-charcoal-900 text-white">{hw}</option>
                ))}
              </select>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex items-center space-x-1 bg-charcoal-850 p-1 rounded-xl border border-charcoal-750">
              {['ALL', 'SEVERE', 'HIGH', 'MODERATE', 'LOW'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSeverityFilter(lvl)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                    severityFilter === lvl
                      ? 'bg-brand-orange text-white shadow-glow-orange'
                      : 'text-slate-400 hover:text-white hover:bg-charcoal-750'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

          </div>

          <div className="flex items-center space-x-2">
            
            {/* Fit Route Button (if journey exists) */}
            {currentJourney && (
              <button
                onClick={handleFitRouteBounds}
                title="Fit map view to complete planned route"
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-semibold transition cursor-pointer"
              >
                <Route className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fit Route</span>
              </button>
            )}

            {/* Pin Density Toggle Button */}
            <button
              onClick={() => setForceIndividualPins(!forceIndividualPins)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                forceIndividualPins
                  ? 'bg-brand-orange/20 text-brand-orange border-brand-orange/40'
                  : 'bg-charcoal-850 text-slate-300 border-charcoal-750 hover:bg-charcoal-800'
              }`}
              title={forceIndividualPins ? 'Switch to zoom-based clustering' : 'Force show all individual pins'}
            >
              <Layers className="w-3 h-3" />
              <span className="text-[11px]">{forceIndividualPins ? 'All Pins Shown' : 'Zoom Clustered'}</span>
            </button>

            {/* Focus Map / Toggle Panels Mode */}
            <button
              type="button"
              onClick={handleToggleAllPanels}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                areAllPanelsCollapsed
                  ? 'bg-brand-orange/20 text-brand-orange border-brand-orange/40'
                  : 'bg-charcoal-850 text-slate-300 border-charcoal-750 hover:bg-charcoal-800'
              }`}
              title={areAllPanelsCollapsed ? 'Restore all map overlay panels' : 'Focus map view (collapse all overlays)'}
              aria-label={areAllPanelsCollapsed ? 'Restore all map overlay panels' : 'Focus map view (collapse all overlays)'}
            >
              {areAllPanelsCollapsed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{areAllPanelsCollapsed ? 'Panels Hidden' : 'Focus Map'}</span>
            </button>

            {/* Reset Filters Button */}
            {isFiltered && (
              <button
                onClick={resetAllFilters}
                title="Reset all filters to default"
                className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-charcoal-800 text-slate-300 hover:text-white hover:bg-charcoal-750 border border-charcoal-700 text-xs transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-brand-orange" />
                <span className="text-[11px] font-medium hidden sm:inline">Reset</span>
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Main Map + Inspection Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Map Viewport (8 Columns on Large Screens) */}
        <div className="lg:col-span-8 relative bg-[#0c0e14] overflow-hidden border-b lg:border-b-0 lg:border-r border-charcoal-750/80 min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] flex flex-col">
          
          {/* Leaflet Map DOM Container */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-full flex-1 z-0" 
            style={{ minHeight: '500px' }}
          />

          {/* Geolocation Notice Banner */}
          {locationNotice && (
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3.5 py-2 rounded-xl text-xs font-medium backdrop-blur-md border shadow-2xl flex items-center space-x-2 transition-all ${
              locationNotice.type === 'error' || locationNotice.type === 'warning'
                ? 'bg-amber-950/90 border-amber-600/50 text-amber-200'
                : 'bg-charcoal-900/90 border-emerald-500/50 text-emerald-200'
            }`}>
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{locationNotice.message}</span>
              <button onClick={() => setLocationNotice(null)} className="ml-1 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Overlay 1: Top-Left Location Header & Hazard Category Filter Checkboxes */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 pointer-events-auto transition-all duration-200">
            {isNationwideExpanded ? (
              <div className="w-[calc(100vw-5rem)] max-w-sm bg-charcoal-900/95 backdrop-blur-xl border border-charcoal-750/90 p-3.5 sm:p-4 rounded-2xl shadow-card-dark max-h-[70vh] overflow-y-auto">
                {/* Location Title & Subtitle + Collapse Control */}
                <div className="mb-3 border-b border-charcoal-800 pb-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center space-x-2">
                        <span>Nationwide Blackspot Intelligence</span>
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
                        MoRTH Official • NHAI Blackspots
                      </p>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className="text-[10px] font-mono text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full border border-brand-orange/20 font-bold whitespace-nowrap">
                        {selectedState === 'ALL' ? 'India GIS Grid' : selectedState}
                      </span>
                      <button
                        type="button"
                        onClick={toggleNationwide}
                        aria-label="Collapse Nationwide Blackspot Intelligence panel"
                        aria-expanded={true}
                        title="Collapse panel"
                        className="p-1 rounded-lg bg-charcoal-800/80 hover:bg-charcoal-750 text-slate-400 hover:text-white border border-charcoal-700/60 transition cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Checkbox Filter Options (6 Functional Categories) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  {HAZARD_CATEGORIES.map((cat) => {
                    const isActive = activeLayers[cat.key];
                    return (
                      <label
                        key={cat.key}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleLayer(cat.key);
                        }}
                        className="flex items-center space-x-2 cursor-pointer group select-none"
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all ${
                          isActive 
                            ? 'bg-brand-orange text-white shadow-glow-orange' 
                            : 'border border-slate-600 bg-charcoal-950'
                        }`}>
                          {isActive && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className={`text-[11px] transition-colors truncate ${
                          isActive ? 'text-slate-100 font-medium' : 'text-slate-400 group-hover:text-slate-300'
                        }`} title={cat.label}>
                          {cat.shortLabel || cat.label}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Zoom hint badge */}
                <div className="mt-2.5 pt-2 border-t border-charcoal-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Zoom: {currentZoom}x {currentZoom < 7 ? '(State Badges)' : '(Individual Pins)'}</span>
                  {isFiltered && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="text-brand-orange hover:text-orange-300 font-semibold flex items-center space-x-1 transition"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={toggleNationwide}
                aria-label="Expand Nationwide Blackspot Intelligence panel"
                aria-expanded={false}
                title="Expand Nationwide Blackspot Intelligence"
                className="group flex items-center space-x-2 px-3 py-2 rounded-xl bg-charcoal-900/95 hover:bg-charcoal-850 backdrop-blur-xl border border-charcoal-750/90 shadow-card-dark text-slate-200 hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-orange"
              >
                <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse shrink-0" />
                <span className="text-xs font-bold text-white tracking-tight">Nationwide Blackspots</span>
                <span className="text-[10px] font-mono text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded-md border border-brand-orange/20 font-bold whitespace-nowrap">
                  {selectedState === 'ALL' ? `${activeCategoriesCount}/6` : selectedState}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform group-hover:translate-y-0.5 shrink-0" />
              </button>
            )}
          </div>

          {/* Overlay 2: Floating Custom Map Control Buttons (Top-Right of Map) */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 flex flex-col space-y-1.5 pointer-events-auto">
            {/* Focus Map Mode / Toggle All Overlays */}
            <button
              type="button"
              onClick={handleToggleAllPanels}
              title={areAllPanelsCollapsed ? 'Restore All Overlay Panels' : 'Focus Map (Collapse All Overlays)'}
              aria-label={areAllPanelsCollapsed ? 'Restore All Overlay Panels' : 'Focus Map (Collapse All Overlays)'}
              className={`w-8 h-8 rounded-xl backdrop-blur-md flex items-center justify-center shadow-lg transition cursor-pointer border ${
                areAllPanelsCollapsed
                  ? 'bg-brand-orange text-white border-brand-orange shadow-glow-orange'
                  : 'bg-charcoal-900/90 hover:bg-charcoal-800 text-slate-300 hover:text-white border-charcoal-750'
              }`}
            >
              {areAllPanelsCollapsed ? (
                <EyeOff className="w-4 h-4 text-white" />
              ) : (
                <Eye className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* Zoom In */}
            <button
              onClick={() => mapInstanceRef.current?.zoomIn()}
              title="Zoom In"
              className="w-8 h-8 rounded-xl bg-charcoal-900/90 hover:bg-charcoal-800 text-slate-300 hover:text-white border border-charcoal-750 flex items-center justify-center shadow-lg transition cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Zoom Out */}
            <button
              onClick={() => mapInstanceRef.current?.zoomOut()}
              title="Zoom Out"
              className="w-8 h-8 rounded-xl bg-charcoal-900/90 hover:bg-charcoal-800 text-slate-300 hover:text-white border border-charcoal-750 flex items-center justify-center shadow-lg transition cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Fit All Visible Hotspots */}
            <button
              onClick={handleFitAllHotspots}
              title="Fit map to visible blackspots"
              className="w-8 h-8 rounded-xl bg-charcoal-900/90 hover:bg-charcoal-800 text-slate-300 hover:text-white border border-charcoal-750 flex items-center justify-center shadow-lg transition cursor-pointer"
            >
              <Maximize2 className="w-4 h-4 text-brand-orange" />
            </button>

            {/* Reset to All India */}
            <button
              onClick={handleResetToIndia}
              title="Reset view to entire India"
              className="w-8 h-8 rounded-xl bg-charcoal-900/90 hover:bg-charcoal-800 text-slate-300 hover:text-white border border-charcoal-750 flex items-center justify-center shadow-lg transition cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-400" />
            </button>

            {/* Locate Me (Browser Geolocation) */}
            <button
              onClick={handleLocateMe}
              title="Locate my position on map"
              className="w-8 h-8 rounded-xl bg-charcoal-900/90 hover:bg-charcoal-800 text-slate-300 hover:text-white border border-charcoal-750 flex items-center justify-center shadow-lg transition cursor-pointer"
            >
              <Crosshair className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Overlay 2.5: Floating Planned Journey Route HUD */}
          {currentJourney ? (
            showRouteHud && (
              <div className="absolute top-24 right-4 z-20 w-72 sm:w-80 bg-charcoal-900/95 backdrop-blur-2xl p-4 rounded-2xl shadow-card-dark border border-cyan-500/40 pointer-events-auto">
                <div className="flex items-center justify-between pb-2 border-b border-charcoal-750">
                  <div className="flex items-center space-x-1.5">
                    <Route className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Planned Route Summary</span>
                  </div>
                  <button 
                    onClick={() => setShowRouteHud(false)} 
                    className="text-slate-400 hover:text-white"
                    title="Minimize Route HUD"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-2.5 space-y-2 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Corridor Path</div>
                    <div className="font-bold text-white truncate" title={`${currentJourney.origin.name} → ${currentJourney.destination.name}`}>
                      {currentJourney.origin.name} → {currentJourney.destination.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-charcoal-950/70 border border-charcoal-800">
                      <div className="text-[9.5px] text-slate-400">Total Distance</div>
                      <div className="font-mono font-bold text-cyan-300">{currentJourney.routeData.distanceKm} km</div>
                    </div>
                    <div className="p-2 rounded-lg bg-charcoal-950/70 border border-charcoal-800">
                      <div className="text-[9.5px] text-slate-400">Est. Duration</div>
                      <div className="font-mono font-bold text-slate-200">~{currentJourney.routeData.durationMin} mins</div>
                    </div>
                  </div>

                  {/* Overall Risk Score */}
                  <div className="p-2 rounded-lg bg-charcoal-950/70 border border-charcoal-800 flex items-center justify-between">
                    <div>
                      <div className="text-[9.5px] text-slate-400">Route Risk Level</div>
                      <div className="font-bold text-brand-orange text-xs">
                        {currentJourney.evaluationResult?.category || currentJourney.riskAnalysis?.overallRisk?.category || currentJourney.riskAnalysis?.compositeRiskCategory || 'Moderate'} Risk
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-sm text-white">
                        {currentJourney.evaluationResult?.score || currentJourney.riskAnalysis?.overallRisk?.score || currentJourney.riskAnalysis?.compositeRiskScore || 54}/100
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">
                        {currentJourney.evaluationResult ? 'FORM EVALUATED' : 'LIVE TELEMETRY'}
                      </div>
                    </div>
                  </div>

                  {/* Along Route Hotspots Count */}
                  <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
                    <span>Along-route blackspots:</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {currentJourney.alongRouteHotspotIds?.length || 0} nodes
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-charcoal-800 flex items-center justify-between gap-2">
                    <a
                      href="#predictor"
                      className="flex-1 py-1.5 px-2 text-center rounded-lg bg-brand-orange text-white text-[11px] font-bold hover:bg-brand-orangeLight transition"
                    >
                      {currentJourney.evaluationResult ? 'View Evaluation' : 'Evaluate in Form'}
                    </a>
                    <button
                      onClick={clearJourney}
                      className="py-1.5 px-2 text-slate-400 hover:text-red-400 text-[11px] rounded-lg bg-charcoal-800 hover:bg-charcoal-750 transition"
                      title="Clear active route"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="absolute top-24 right-4 z-20 pointer-events-auto bg-charcoal-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-charcoal-750 shadow-xl flex items-center space-x-2 text-xs">
              <Route className="w-3.5 h-3.5 text-brand-orange" />
              <span className="text-slate-300 text-[11px]">No active route.</span>
              <a href="#journey" className="text-brand-orange hover:text-orange-300 font-bold text-[11px] flex items-center space-x-1">
                <span>Plan Journey</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Honest MoRTH Census Notice when selected state has no coordinate blackspots */}
          {selectedStateMorthStats && visibleHotspots.length === 0 && (
            <div className="absolute top-20 left-4 right-4 z-25 bg-charcoal-900/95 border border-amber-500/40 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl pointer-events-auto max-w-xl mx-auto">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h5 className="font-bold text-white">
                    Official MoRTH Census Data for {selectedStateMorthStats.state}
                  </h5>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    Reported accidents: <strong className="text-white">{selectedStateMorthStats.totalAccidents.toLocaleString()}</strong> • 
                    Fatalities: <strong className="text-red-400">{selectedStateMorthStats.fatalities.toLocaleString()}</strong> • 
                    MoRTH Severity Index: <strong className="text-amber-400">{selectedStateMorthStats.severityIndex}%</strong>.
                  </p>
                  <p className="text-slate-400 mt-1 text-[11px]">
                    NHAI has not yet published coordinate-level FIR blackspot records for this state. Missing coordinates are not treated as evidence of zero risk.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Overlay 3: Bottom-Left Map Legend & Geo-Grid Coordinates */}
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-20 pointer-events-auto transition-all duration-200">
            {isLegendExpanded ? (
              <div className="bg-charcoal-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-charcoal-750 shadow-xl max-w-[calc(100vw-2rem)] sm:max-w-xs transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Risk &amp; Route Legend
                  </span>
                  <button
                    type="button"
                    onClick={toggleLegend}
                    aria-label="Collapse Risk & Route Legend panel"
                    aria-expanded={true}
                    title="Collapse legend"
                    className="p-1 rounded-md bg-charcoal-800/80 hover:bg-charcoal-750 text-slate-400 hover:text-white border border-charcoal-700/60 transition cursor-pointer ml-2 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center space-x-3 text-[11px] flex-wrap gap-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-glow-red"></span>
                    <span className="text-slate-300">Severe</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-glow-orange"></span>
                    <span className="text-slate-300">High</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-glow-cyan"></span>
                    <span className="text-cyan-300 font-semibold">Planned Route</span>
                  </div>
                </div>
                {/* Geo-Grid Coordinates Badge */}
                <div className="mt-2 pt-1.5 border-t border-charcoal-800 flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 truncate max-w-[260px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="truncate">GRID: {selectedHotspot ? selectedHotspot.coordinates : '22.9734° N, 78.6569° E (India Centroid)'}</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={toggleLegend}
                aria-label="Expand Risk & Route Legend panel"
                aria-expanded={false}
                title="Expand Risk & Route Legend"
                className="group flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-charcoal-900/95 hover:bg-charcoal-850 backdrop-blur-md border border-charcoal-750/90 shadow-xl text-slate-200 hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-orange"
              >
                <div className="flex items-center -space-x-1 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-red-500 border border-charcoal-900"></span>
                  <span className="w-2 h-2 rounded-full bg-orange-500 border border-charcoal-900"></span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 border border-charcoal-900"></span>
                </div>
                <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white">Legend</span>
                <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform group-hover:-translate-y-0.5 shrink-0" />
              </button>
            )}
          </div>

          {/* Overlay 4: Bottom-Right Compact Dynamic Analytics HUD Panel */}
          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-20 pointer-events-auto transition-all duration-200">
            {isVerifiedExpanded ? (
              <div className="w-[calc(100vw-2rem)] max-w-[300px] sm:max-w-none sm:w-80 charcoal-card-elevated p-3.5 sm:p-4 rounded-2xl shadow-card-dark border border-white/10 backdrop-blur-2xl max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
                {/* Header: Visible Count & Breakdown + Collapse Button */}
                <div className="flex items-start justify-between pb-2.5 border-b border-charcoal-750/80 mb-3 gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white tracking-tight flex items-center space-x-1.5">
                      <Activity className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                      <span className="truncate">Verified Blackspots: {stats.totalVisible}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {stats.highRiskCount} High • {stats.mediumRiskCount} Med • {stats.lowRiskCount} Low
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-charcoal-800 text-brand-orange border border-charcoal-700 whitespace-nowrap">
                      MoRTH BENCHMARK
                    </span>
                    <button
                      type="button"
                      onClick={toggleVerified}
                      aria-label="Collapse Verified Blackspots panel"
                      aria-expanded={true}
                      title="Collapse panel"
                      className="p-1 rounded-lg bg-charcoal-800/80 hover:bg-charcoal-750 text-slate-400 hover:text-white border border-charcoal-700/60 transition cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Category Distribution Bars */}
                <div className="space-y-2.5 text-xs">
                  {/* Dangerous Intersections */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">Dangerous intersections</span>
                      <span className="font-mono font-bold text-red-400">{stats.categoryPercentages.dangerous_intersections || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-charcoal-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, stats.categoryPercentages.dangerous_intersections || 0)}%` }}
                      />
                    </div>
                  </div>

                  {/* Speed Hazards / Distractions */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">Speed differential hazards</span>
                      <span className="font-mono font-bold text-brand-orange">{stats.categoryPercentages.distraction_hazards || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-charcoal-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-600 to-brand-orange rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, stats.categoryPercentages.distraction_hazards || 0)}%` }}
                      />
                    </div>
                  </div>

                  {/* Traffic Congestion */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">Freight &amp; bottlenecks</span>
                      <span className="font-mono font-bold text-amber-400">{stats.categoryPercentages.traffic_congestion || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-charcoal-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, stats.categoryPercentages.traffic_congestion || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footnote: Transparent benchmark info */}
                <div className="mt-3 pt-2 border-t border-charcoal-750/70 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate max-w-[190px]">Formula: 0.4*Fat + 0.3*Acc + 0.2*Sev</span>
                  <span className="font-mono text-[9.5px] text-emerald-400">EMPIRICAL</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={toggleVerified}
                aria-label="Expand Verified Blackspots panel"
                aria-expanded={false}
                title="Expand Verified Blackspots Analytics"
                className="group flex items-center space-x-2 px-3 py-2 rounded-xl bg-charcoal-900/95 hover:bg-charcoal-850 backdrop-blur-xl border border-charcoal-750/90 shadow-card-dark text-slate-200 hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-orange"
              >
                <Activity className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                <span className="text-xs font-bold text-white tracking-tight">Verified: {stats.totalVisible}</span>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  ({stats.highRiskCount}H • {stats.mediumRiskCount}M)
                </span>
                <span className="font-mono text-[8.5px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-charcoal-800 text-brand-orange border border-charcoal-700">
                  MoRTH
                </span>
                <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform group-hover:-translate-y-0.5 shrink-0" />
              </button>
            )}
          </div>

          {/* Empty State Banner if all filtered out */}
          {visibleHotspots.length === 0 && !selectedStateMorthStats && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-charcoal-950/80 backdrop-blur-md p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
              <h4 className="text-base font-bold text-white">No Blackspots Match Active Filters</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                You have unchecked all hazard layers or applied a search/state filter with zero matching coordinate records.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-4 py-2 rounded-xl bg-brand-orange text-white font-bold text-xs shadow-glow-orange flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}

        </div>

        {/* Right Hotspot Inspection Panel (4 Columns on Large Screens) */}
        <div className="lg:col-span-4 p-5 sm:p-6 bg-charcoal-900/95 flex flex-col justify-between overflow-y-auto">
          
          {selectedHotspot ? (
            <div className="space-y-4">
              
              {/* Hotspot Header */}
              <div className="border-b border-charcoal-750/80 pb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md bg-charcoal-800 text-slate-300 border border-charcoal-700">
                      NODE: {selectedHotspot.id}
                    </span>
                    <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                      VERIFIED
                    </span>
                  </div>
                  
                  {/* Recenter Map Button */}
                  <button
                    onClick={() => handleCenterOnHotspot(selectedHotspot)}
                    title="Center map on this hotspot"
                    className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1 bg-charcoal-850 px-2 py-0.5 rounded border border-charcoal-750 transition cursor-pointer"
                  >
                    <Compass className="w-3 h-3 text-brand-orange" />
                    <span>Center</span>
                  </button>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    selectedHotspot.riskLevel === 'Severe'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : selectedHotspot.riskLevel === 'High'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                      : selectedHotspot.riskLevel === 'Moderate'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {selectedHotspot.riskLevel} ({selectedHotspot.riskScore}/100)
                  </span>
                </div>
                
                <h4 className="text-base font-bold text-white mt-1">
                  {selectedHotspot.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedHotspot.district ? `${selectedHotspot.district}, ` : ''}{selectedHotspot.state} • {selectedHotspot.highway || selectedHotspot.roadType}
                </p>

                {/* Along Route Badge */}
                {currentJourney?.alongRouteHotspotIds?.includes(selectedHotspot.id) && (
                  <div className="mt-2 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center space-x-1.5 text-xs text-cyan-300">
                    <Route className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-semibold">Corridor Alert: Lies directly within your planned route buffer.</span>
                  </div>
                )}
              </div>

              {/* Geo & Speed Details */}
              <div className="space-y-2 text-xs">
                
                <div className="p-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750/70 flex justify-between items-center">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="text-white font-mono font-semibold">{selectedHotspot.coordinates}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750/70 flex justify-between items-center">
                  <span className="text-slate-400">Speed Limit / Observed:</span>
                  <span className="text-white font-mono font-semibold">
                    {selectedHotspot.speedLimit} / <span className="text-brand-orange font-bold">{selectedHotspot.observedAvgSpeed}</span>
                  </span>
                </div>

                {/* Historical Accident Numbers */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750/70 text-center">
                    <div className="text-[10px] text-slate-400 uppercase">Collisions</div>
                    <div className="text-sm font-mono font-bold text-white mt-0.5">
                      {selectedHotspot.accidents || selectedHotspot.recentIncidentsCount}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750/70 text-center">
                    <div className="text-[10px] text-slate-400 uppercase">Fatalities</div>
                    <div className="text-sm font-mono font-bold text-red-400 mt-0.5">
                      {selectedHotspot.fatalities || 0}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750/70 text-center">
                    <div className="text-[10px] text-slate-400 uppercase">MoRTH Sev.</div>
                    <div className="text-sm font-mono font-bold text-brand-orange mt-0.5">
                      {selectedHotspot.severityIndex ? `${selectedHotspot.severityIndex}%` : 'N/A'}
                    </div>
                  </div>
                </div>

              </div>

              {/* Primary Hazard Factor & Conditions */}
              <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750/70 text-xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Primary Hazard Mechanism:
                </p>
                <p className="text-slate-200 font-medium leading-relaxed">
                  {selectedHotspot.primaryCause}
                </p>
                {selectedHotspot.hazardType && (
                  <p className="text-[11px] text-slate-300 mt-1 font-mono">
                    Hazard Classification: {selectedHotspot.hazardType}
                  </p>
                )}
                {selectedHotspot.weatherImpact && (
                  <p className="text-[11px] text-amber-400/90 mt-1 font-medium">
                    Environmental Factor: {selectedHotspot.weatherImpact}
                  </p>
                )}
              </div>

              {/* Prescriptive Engineering Action / Remedial Status */}
              <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750/70 text-xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Engineering Remediation Status:
                </p>
                <p className="text-slate-300 leading-relaxed">
                  {selectedHotspot.remedialStatus || selectedHotspot.recommendedAction}
                </p>
              </div>

              {/* Data Provenance & Verification Metadata */}
              <div className="p-2.5 rounded-xl bg-charcoal-950/70 border border-charcoal-800 text-[10.5px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Source Authority:</span>
                  <span className="text-slate-200 font-semibold truncate max-w-[170px]">{selectedHotspot.source || 'MoRTH / NHAI Registry'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Reporting Period:</span>
                  <span className="text-slate-200 font-mono">{selectedHotspot.reportingPeriod || '2018–2022'}</span>
                </div>
              </div>

              {/* Action Button: Feed Hotspot into Risk Predictor Workflow */}
              <button
                type="button"
                onClick={() => {
                  if (onSelectHotspot) onSelectHotspot(selectedHotspot);
                }}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-glow-orange cursor-pointer"
              >
                <span>Load Into Evaluation Form</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full">
              <MapPin className="w-8 h-8 text-slate-600 mb-2" />
              <p>Click any blackspot marker or state badge on the GIS grid to inspect verified records.</p>
            </div>
          )}

          {/* Bottom Controls / Reset Hotspots */}
          <div className="mt-4 pt-3 border-t border-charcoal-750 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center space-x-1.5 truncate max-w-[210px]">
              <Database className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span className="truncate">{datasetSourceInfo?.sourceName || 'Official MoRTH & NHAI'}</span>
            </div>

            <button
              onClick={resetHotspotsToDefault}
              title="Reset all hotspots to standard official benchmark"
              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer shrink-0"
            >
              Reset Benchmark
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
