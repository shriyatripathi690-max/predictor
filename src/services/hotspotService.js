/**
 * SafeRoad AI - Road Hazard Hotspot Service
 * 
 * Provides:
 * 1. Categorization of road hazards (intersections, congestion, distractions, pedestrian safety, weather).
 * 2. Integration with verified geolocated blackspots across Indian National Highways.
 * 3. Dynamic aggregation statistics (severity counts, category percentages, average empirical risk scores).
 */

import { getInitializedVerifiedBlackspots } from './blackspotDataService';

export const HAZARD_CATEGORIES = [
  {
    key: 'dangerous_intersections',
    label: 'Dangerous intersections & curves',
    color: '#ef4444',
  },
  {
    key: 'traffic_congestion',
    label: 'Freight bottleneck & congestion',
    color: '#ff9800',
  },
  {
    key: 'distraction_hazards',
    label: 'Speed differentials & high velocity',
    shortLabel: 'Speed hazards',
    color: '#ff6a00',
  },
  {
    key: 'pedestrian_safety',
    label: 'Pedestrian & mixed traffic conflicts',
    shortLabel: 'Pedestrian collisions',
    color: '#38bdf8',
  },
  {
    key: 'weather_hazards',
    label: 'Adverse weather, rain & fog hazards',
    color: '#a855f7',
  },
  {
    key: 'parking_hazards',
    label: 'Shoulder staging & queue spills',
    shortLabel: 'Shoulder hazards',
    color: '#10b981',
  },
];

/**
 * Standard verified blackspot dataset for nationwide road safety analysis.
 * Initialized with genuine coordinates across Indian states from MoRTH / NHAI registry.
 */
export const SAMPLE_HOTSPOTS_DATA = getInitializedVerifiedBlackspots();

/**
 * Calculate dynamic statistics based on currently visible/filtered hotspots
 */
export function calculateHotspotStats(hotspots) {
  const totalVisible = hotspots.length;
  
  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let lowRiskCount = 0;
  let totalFatalities = 0;
  let totalAccidents = 0;

  const categoryCounts = {
    dangerous_intersections: 0,
    traffic_congestion: 0,
    distraction_hazards: 0,
    pedestrian_safety: 0,
    weather_hazards: 0,
    parking_hazards: 0,
  };

  hotspots.forEach((hs) => {
    totalFatalities += Number(hs.fatalities) || 0;
    totalAccidents += Number(hs.accidents) || 0;

    if (hs.riskCategory === 'high' || hs.riskLevel === 'Severe' || hs.riskLevel === 'High') {
      highRiskCount += 1;
    } else if (hs.riskCategory === 'medium' || hs.riskLevel === 'Moderate') {
      mediumRiskCount += 1;
    } else {
      lowRiskCount += 1;
    }

    if (Array.isArray(hs.hazardCategories)) {
      hs.hazardCategories.forEach((cat) => {
        if (categoryCounts[cat] !== undefined) {
          categoryCounts[cat] += 1;
        }
      });
    }
  });

  const categoryPercentages = {};
  const baseCount = Math.max(1, totalVisible);
  Object.keys(categoryCounts).forEach((key) => {
    categoryPercentages[key] = Math.round((categoryCounts[key] / baseCount) * 100);
  });

  const totalScore = hotspots.reduce((sum, h) => sum + (Number(h.riskScore) || 50), 0);
  const avgRiskScore = totalVisible > 0 ? Math.round(totalScore / totalVisible) : 0;
  const avgSeverityIndex = totalAccidents > 0 ? parseFloat(((totalFatalities / totalAccidents) * 100).toFixed(1)) : 0;

  return {
    totalVisible,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    avgRiskScore,
    totalFatalities,
    totalAccidents,
    avgSeverityIndex,
    categoryCounts,
    categoryPercentages,
  };
}

/**
 * Service function to retrieve hotspots with filtering
 */
export async function fetchHotspotsService(activeFilterKeys = null, severityFilter = 'ALL') {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...SAMPLE_HOTSPOTS_DATA];

      if (severityFilter && severityFilter !== 'ALL') {
        filtered = filtered.filter((hs) => {
          if (severityFilter === 'SEVERE') return hs.riskLevel === 'Severe';
          if (severityFilter === 'HIGH') return hs.riskLevel === 'High' || hs.riskLevel === 'Severe';
          if (severityFilter === 'MODERATE') return hs.riskLevel === 'Moderate';
          if (severityFilter === 'LOW') return hs.riskLevel === 'Low';
          return true;
        });
      }

      if (activeFilterKeys && activeFilterKeys.length > 0) {
        filtered = filtered.filter((hs) => {
          if (!hs.hazardCategories || hs.hazardCategories.length === 0) return false;
          return hs.hazardCategories.some((cat) => activeFilterKeys.includes(cat));
        });
      }

      const stats = calculateHotspotStats(filtered);

      resolve({
        success: true,
        data: filtered,
        stats,
        totalDatasetSize: SAMPLE_HOTSPOTS_DATA.length,
        isVerifiedHistoricalRecord: true,
        source: 'MoRTH & NHAI National Highway Blackspot Registry',
      });
    }, 60);
  });
}
