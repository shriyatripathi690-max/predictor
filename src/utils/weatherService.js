/**
 * SafeRoad AI - Open-Meteo Weather Telemetry Service
 * Genuine real-time atmospheric data provider without synthetic fabrication.
 */

const OPEN_METEO_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPEN_METEO_API_URL) || 'https://api.open-meteo.com/v1/forecast';

// In-memory 5-minute cache to respect Open-Meteo rate limits
const weatherCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Interpret WMO weather interpretation codes
 * Reference: World Meteorological Organization WMO 4501
 */
export function interpretWmoCode(code) {
  switch (code) {
    case 0:
      return { 
        condition: 'Clear Sky', 
        weatherKey: 'clear', 
        surfaceCondition: 'dry',
        isAdverse: false, 
        severity: 'low',
        description: 'Optimal visibility and dry pavement adhesion.' 
      };
    case 1:
    case 2:
      return { 
        condition: 'Partly Cloudy', 
        weatherKey: 'clear', 
        surfaceCondition: 'dry',
        isAdverse: false, 
        severity: 'low',
        description: 'Good driving visibility; normal tire grip.' 
      };
    case 3:
      return { 
        condition: 'Overcast', 
        weatherKey: 'clear', 
        surfaceCondition: 'dry',
        isAdverse: false, 
        severity: 'low',
        description: 'Diffused natural ambient illumination with dry pavement.' 
      };
    case 45:
    case 48:
      return { 
        condition: 'Dense Fog / Depositing Mist', 
        weatherKey: 'dense_fog', 
        surfaceCondition: 'wet',
        isAdverse: true, 
        severity: 'high',
        description: 'Severe sight-distance compression below safe stopping distance. Use low-beams only.' 
      };
    case 51:
    case 53:
    case 55:
      return { 
        condition: 'Drizzle / Light Precipitation', 
        weatherKey: 'light_rain', 
        surfaceCondition: 'wet',
        isAdverse: true, 
        severity: 'medium',
        description: 'Initial surface grease emulsification creates slick friction layer.' 
      };
    case 61:
    case 63:
      return { 
        condition: 'Moderate Rain', 
        weatherKey: 'light_rain', 
        surfaceCondition: 'wet',
        isAdverse: true, 
        severity: 'medium',
        description: 'Wet pavement elongates braking distances by 35-50%.' 
      };
    case 65:
    case 81:
    case 82:
      return { 
        condition: 'Heavy Rain / Downpour', 
        weatherKey: 'heavy_rain', 
        surfaceCondition: 'waterlogged',
        isAdverse: true, 
        severity: 'high',
        description: 'High hydroplaning risk above 65 km/h. Standing water reduces steerability.' 
      };
    case 66:
    case 67:
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return { 
        condition: 'Snow / Freezing Rain / Sleet', 
        weatherKey: 'snow_ice', 
        surfaceCondition: 'icy',
        isAdverse: true, 
        severity: 'severe',
        description: 'Near-zero micro-texture traction. Stopping distances increase 3x to 5x.' 
      };
    case 95:
    case 96:
    case 99:
      return { 
        condition: 'Severe Thunderstorm', 
        weatherKey: 'heavy_rain', 
        surfaceCondition: 'waterlogged',
        isAdverse: true, 
        severity: 'severe',
        description: 'High wind shear, flash ponding, and severe optical glare from lightning.' 
      };
    default:
      return { 
        condition: 'Normal Conditions', 
        weatherKey: 'clear', 
        surfaceCondition: 'dry',
        isAdverse: false, 
        severity: 'low',
        description: 'Standard ambient roadway atmospheric state.' 
      };
  }
}

/**
 * Fetch real-time weather observations from Open-Meteo
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 * @returns {Promise<Object>} Structured real weather data
 */
export async function fetchLiveWeather(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
    return {
      success: false,
      error: 'Invalid latitude or longitude coordinates provided.',
      provider: 'Open-Meteo API',
    };
  }

  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const now = Date.now();

  if (weatherCache.has(cacheKey)) {
    const cached = weatherCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return { ...cached.data, isCached: true };
    }
  }

  try {
    const url = `${OPEN_METEO_BASE_URL}?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,visibility&timezone=auto`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}`);
    }

    const json = await res.json();
    if (!json.current) {
      throw new Error('Current weather block missing from Open-Meteo response');
    }

    const cur = json.current;
    const interpretation = interpretWmoCode(cur.weather_code);

    const payload = {
      success: true,
      temperatureC: cur.temperature_2m,
      apparentTempC: cur.apparent_temperature,
      humidityPercent: cur.relative_humidity_2m,
      precipitationMm: cur.precipitation || 0,
      rainMm: cur.rain || 0,
      windSpeedKmh: cur.wind_speed_10m,
      visibilityM: cur.visibility != null ? cur.visibility : null,
      weatherCode: cur.weather_code,
      condition: interpretation.condition,
      weatherKey: interpretation.weatherKey,
      surfaceCondition: interpretation.surfaceCondition,
      isAdverse: interpretation.isAdverse,
      severity: interpretation.severity,
      description: interpretation.description,
      observedTime: cur.time,
      freshnessLabel: 'Live (Updated just now)',
      fetchedAt: new Date().toLocaleTimeString(),
      provider: 'Open-Meteo Global Weather Service',
      isCached: false,
    };

    weatherCache.set(cacheKey, { timestamp: now, data: payload });
    return payload;
  } catch (err) {
    return {
      success: false,
      error: `Atmospheric telemetry unavailable (${err.message || 'Network failure'}). Check connectivity.`,
      provider: 'Open-Meteo API',
      isCached: false,
    };
  }
}
