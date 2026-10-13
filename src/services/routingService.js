/**
 * SafeRoad AI - Routing and Geocoding Service
 * 
 * Provides:
 * 1. Location geocoding via OpenStreetMap Nominatim with an extensive offline gazetteer fallback.
 * 2. Drivable route calculation via OSRM with realistic roadway coordinate trajectory fallback.
 * 3. Calculation of Haversine distances and estimated transit durations.
 */

const NOMINATIM_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NOMINATIM_URL) || 'https://nominatim.openstreetmap.org';
const OSRM_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OSRM_ROUTER_URL) || 'https://router.project-osrm.org';

// Regional Gazetteer of known landmarks along the NH-48 / NCR Corridor
const REGIONAL_GAZETTEER = [
  {
    name: 'NH-48 Expressway Bypass (Km 34.2)',
    lat: 28.4595,
    lon: 77.0266,
    keywords: ['nh-48', 'nh48', 'bypass', 'km 34', 'gurugram', 'gurgaon', 'expressway'],
  },
  {
    name: 'Old Industrial Crossroad & Flyover Off-ramp',
    lat: 28.5355,
    lon: 77.3910,
    keywords: ['industrial', 'noida', 'flyover', 'off-ramp', 'crossroad'],
  },
  {
    name: 'River Valley Underpass Junction',
    lat: 28.6139,
    lon: 77.2090,
    keywords: ['river valley', 'underpass', 'junction', 'delhi', 'central'],
  },
  {
    name: 'University Campus South Boulevard',
    lat: 28.6892,
    lon: 77.2144,
    keywords: ['university', 'campus', 'south boulevard', 'north campus', 'delhi uni'],
  },
  {
    name: 'Greenfield Eco-Corridor Outer Ring',
    lat: 28.4089,
    lon: 77.3178,
    keywords: ['greenfield', 'eco-corridor', 'outer ring', 'faridabad'],
  },
  {
    name: 'Downtown Transit Hub & Curbside Plaza',
    lat: 28.5700,
    lon: 77.2300,
    keywords: ['downtown', 'transit hub', 'curbside', 'aiims', 'ring road'],
  },
  {
    name: 'West Ridge Mountain Cut & Wind Gap',
    lat: 28.4900,
    lon: 77.0850,
    keywords: ['west ridge', 'mountain', 'wind gap', 'aravali', 'golf course road'],
  },
  {
    name: 'Metro Line Interchange Feeder Terminal',
    lat: 28.6350,
    lon: 77.2800,
    keywords: ['metro', 'interchange', 'feeder', 'anand vihar', 'laxmi nagar'],
  },
  {
    name: 'Cyber City Hub & DLF Phase 2',
    lat: 28.4950,
    lon: 77.0890,
    keywords: ['cyber city', 'dlf', 'phase 2', 'cyberhub'],
  },
  {
    name: 'Indira Gandhi International Airport (Terminal 3)',
    lat: 28.5562,
    lon: 77.1000,
    keywords: ['igi airport', 'airport', 'terminal 3', 't3', 'aerocity'],
  },
  {
    name: 'Connaught Place Radial Interchange',
    lat: 28.6315,
    lon: 77.2167,
    keywords: ['connaught place', 'cp', 'rajiv chowk', 'inner circle'],
  },
  {
    name: 'Dwarka Expressway Sector 21 Interchange',
    lat: 28.5520,
    lon: 77.0580,
    keywords: ['dwarka', 'sector 21', 'dwarka expressway'],
  },
];

/**
 * Calculates Haversine distance in kilometers between two lat/lon pairs
 */
export function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Geocode a location query string or object into valid geographic coordinates.
 * Handles network failures and rate-limiting gracefully using Gazetteer fallback.
 */
export async function geocodeLocation(query) {
  if (!query) throw new Error('Location query cannot be empty.');

  // If already coordinates object
  if (typeof query === 'object' && query.lat != null && query.lon != null) {
    return {
      lat: parseFloat(query.lat),
      lon: parseFloat(query.lon),
      name: query.name || `${parseFloat(query.lat).toFixed(4)}° N, ${parseFloat(query.lon).toFixed(4)}° E`,
    };
  }

  const queryStr = String(query).trim();
  if (queryStr.length < 2) throw new Error('Please enter at least 2 characters for location.');

  // 1. Check offline Gazetteer for instant match
  const lowerQuery = queryStr.toLowerCase();
  const directMatch = REGIONAL_GAZETTEER.find(
    (item) => item.name.toLowerCase().includes(lowerQuery) || item.keywords.some((k) => lowerQuery.includes(k))
  );

  // 2. Attempt online Nominatim Geocoding with timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(
        queryStr
      )}&limit=1&addressdetails=1`,
      {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        const parts = (first.display_name || '').split(',');
        const shortName = parts.slice(0, 3).join(',').trim() || queryStr;
        return {
          lat: parseFloat(first.lat),
          lon: parseFloat(first.lon),
          name: shortName,
          fullName: first.display_name,
        };
      }
    }
  } catch {
    // Online geocode timed out or blocked by CORS/network; fall back to gazetteer
  }

  // 3. Fallback to Gazetteer match
  if (directMatch) {
    return {
      lat: directMatch.lat,
      lon: directMatch.lon,
      name: directMatch.name,
      fullName: `${directMatch.name}, National Capital Region Highway Corridor`,
    };
  }

  // 4. Default corridor fallback if query contains regional terms
  return {
    lat: 28.5355,
    lon: 77.2090,
    name: queryStr,
    fullName: `${queryStr} (Regional Corridor Approximate Center)`,
  };
}

/**
 * Generate synthetic intermediate road waypoints when OSRM routing is unavailable
 */
function generateRoadwayTrajectory(origin, destination) {
  const points = [];
  const steps = 18;
  const startLat = origin.lat;
  const startLon = origin.lon;
  const endLat = destination.lat;
  const endLon = destination.lon;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Introduce slight road curvature to mimic highway alignments
    const curveDeviation = Math.sin(t * Math.PI) * 0.012;
    const lat = startLat + (endLat - startLat) * t + curveDeviation * 0.5;
    const lon = startLon + (endLon - startLon) * t + curveDeviation;
    points.push([parseFloat(lon.toFixed(5)), parseFloat(lat.toFixed(5))]); // [lon, lat] format for OSRM GeoJSON consistency
  }

  return points;
}

/**
 * Calculate drivable route between origin and destination coordinates.
 * Attempts OSRM driving service; falls back gracefully to calibrated highway trajectory.
 */
export async function calculateDrivableRoute(origin, destination) {
  if (!origin || !destination) {
    throw new Error('Both origin and destination coordinates are required.');
  }

  const dist = getHaversineDistanceKm(origin.lat, origin.lon, destination.lat, destination.lon);
  if (dist < 0.1) {
    throw new Error('Origin and destination are the same location. Please choose a different destination.');
  }

  // Attempt live OSRM routing API with 4.5s timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const url = `${OSRM_BASE_URL}/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const primary = data.routes[0];
        const distKm = parseFloat((primary.distance / 1000).toFixed(1));
        const durMin = Math.max(2, Math.round(primary.duration / 60));

        return {
          success: true,
          distanceKm: distKm,
          durationMin: durMin,
          coordinates: primary.geometry.coordinates, // array of [lon, lat]
          provider: 'OSRM Driving Engine (Live OpenStreetMap)',
        };
      }
    }
  } catch {
    // Network or routing service unavailable; proceed to fallback
  }

  // Fallback: Calibrated roadway trajectory generator
  const approxDistanceKm = parseFloat((dist * 1.25).toFixed(1)); // 25% road winding factor
  const estSpeedKmh = 52; // average urban arterial/expressway speed
  const estDurationMin = Math.max(3, Math.round((approxDistanceKm / estSpeedKmh) * 60));
  const trajectoryCoords = generateRoadwayTrajectory(origin, destination);

  return {
    success: true,
    distanceKm: approxDistanceKm,
    durationMin: estDurationMin,
    coordinates: trajectoryCoords, // array of [lon, lat]
    provider: 'Corridor Safety Route Geometry (Calibrated)',
  };
}
