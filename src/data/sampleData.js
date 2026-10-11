/**
 * SafeRoad AI - Sample Mock Data
 * NOTE: All data in this file consists of simulated benchmarks for UI & Hackathon demonstration.
 * No live traffic API or trained ML model backend is connected in this prototype stage.
 */

export const SAMPLE_METRICS = [
  {
    id: 'corridors',
    title: 'Monitored Corridors',
    value: '149.38 km',
    subtext: 'Across 8 monitored arterial corridors',
    change: '100% OSRM road geometry',
    isPositive: true,
    status: 'normal',
  },
  {
    id: 'avg_risk',
    title: 'Avg. Regional Risk Index',
    value: '44 / 100',
    subtext: 'Moderate safety threshold',
    change: '-3.8% vs last week',
    isPositive: true,
    status: 'moderate',
  },
  {
    id: 'critical_zones',
    title: 'Critical Risk Hotspots',
    value: '14 Zones',
    subtext: '5 flagged for speed intervention',
    change: '+2 new flagged',
    isPositive: false,
    status: 'severe',
  },
  {
    id: 'preventable_rate',
    title: 'Est. Incident Mitigation',
    value: '76.8%',
    subtext: 'With simulated advisory compliance',
    change: '+5.4% efficiency',
    isPositive: true,
    status: 'safe',
  },
];

export const SAMPLE_HOTSPOTS = [
  {
    id: 'HS-01',
    name: 'NH-48 Bypass Curve (Km 34.2)',
    type: 'Highway Express',
    riskScore: 86,
    riskLevel: 'Severe',
    riskColor: 'bg-red-500 text-white',
    primaryCause: 'Sharp Banking + High Speed Differentials',
    speedLimit: '80 km/h',
    observedAvgSpeed: '96 km/h',
    weatherImpact: 'Heavy Rain reduces friction by 40%',
    recentIncidentsCount: 14,
    coordinates: '28.4595° N, 77.0266° E',
    recommendedAction: 'Install automated speed radar & illuminated curve chevron signs.',
  },
  {
    id: 'HS-02',
    name: 'Old Industrial Crossroad & Flyover Off-ramp',
    type: 'Urban Arterial',
    riskScore: 74,
    riskLevel: 'High',
    riskColor: 'bg-orange-500 text-white',
    primaryCause: 'Blind Weaving & Heavy Freight Inflow',
    speedLimit: '50 km/h',
    observedAvgSpeed: '58 km/h',
    weatherImpact: 'Waterlogging in lane 3 during monsoons',
    recentIncidentsCount: 9,
    coordinates: '28.5355° N, 77.3910° E',
    recommendedAction: 'Extend deceleration lane by 60m and re-time signal split cycle.',
  },
  {
    id: 'HS-03',
    name: 'River Valley Underpass Junction',
    type: 'Intersection / Tunnel Approach',
    riskScore: 68,
    riskLevel: 'High',
    riskColor: 'bg-orange-500 text-white',
    primaryCause: 'Abrupt Lighting Drop & Standing Water',
    speedLimit: '40 km/h',
    observedAvgSpeed: '46 km/h',
    weatherImpact: 'Low visibility & optical glare at exit',
    recentIncidentsCount: 7,
    coordinates: '28.6139° N, 77.2090° E',
    recommendedAction: 'Deploy high-lux LED gradual entrance illumination and drainage pumps.',
  },
  {
    id: 'HS-04',
    name: 'University Campus South Boulevard',
    type: 'Urban Multi-lane',
    riskScore: 48,
    riskLevel: 'Moderate',
    riskColor: 'bg-amber-500 text-white',
    primaryCause: 'High Pedestrian Crossing Conflicts',
    speedLimit: '40 km/h',
    observedAvgSpeed: '42 km/h',
    weatherImpact: 'Dusk glare creates pedestrian blind spots',
    recentIncidentsCount: 4,
    coordinates: '28.6892° N, 77.2144° E',
    recommendedAction: 'Introduce raised pedestrian zebra crosswalks and flash beacons.',
  },
  {
    id: 'HS-05',
    name: 'Greenfield Eco-Corridor Outer Ring',
    type: 'Controlled Access Highway',
    riskScore: 24,
    riskLevel: 'Low',
    riskColor: 'bg-emerald-500 text-white',
    primaryCause: 'Optimal Grade & Segregated Freight Lanes',
    speedLimit: '90 km/h',
    observedAvgSpeed: '82 km/h',
    weatherImpact: 'Permeable asphalt maintains traction',
    recentIncidentsCount: 1,
    coordinates: '28.4089° N, 77.3178° E',
    recommendedAction: 'Routine sensor maintenance & scheduled surface friction audits.',
  },
];

export const SAMPLE_HISTORICAL_MONTHLY = [
  { month: 'Jan', totalIncidents: 42, severeIncidents: 12, preventable: 31 },
  { month: 'Feb', totalIncidents: 38, severeIncidents: 9, preventable: 28 },
  { month: 'Mar', totalIncidents: 31, severeIncidents: 7, preventable: 24 },
  { month: 'Apr', totalIncidents: 29, severeIncidents: 6, preventable: 22 },
  { month: 'May', totalIncidents: 34, severeIncidents: 8, preventable: 25 },
  { month: 'Jun', totalIncidents: 49, severeIncidents: 15, preventable: 38 }, // Monsoon start
  { month: 'Jul', totalIncidents: 63, severeIncidents: 22, preventable: 49 }, // Heavy monsoon
  { month: 'Aug', totalIncidents: 58, severeIncidents: 19, preventable: 44 },
  { month: 'Sep', totalIncidents: 41, severeIncidents: 11, preventable: 32 },
  { month: 'Oct', totalIncidents: 36, severeIncidents: 10, preventable: 27 },
  { month: 'Nov', totalIncidents: 48, severeIncidents: 16, preventable: 37 }, // Winter fog
  { month: 'Dec', totalIncidents: 54, severeIncidents: 18, preventable: 42 }, // Dense fog
];

export const SAMPLE_HOURLY_RISK = [
  { time: '00:00 - 04:00', riskIndex: 68, label: 'Late Night (Fatigue & High Speed)' },
  { time: '04:00 - 08:00', riskIndex: 52, label: 'Early Morning Fog & Commute' },
  { time: '08:00 - 12:00', riskIndex: 61, label: 'Morning Peak Congestion' },
  { time: '12:00 - 16:00', riskIndex: 38, label: 'Midday Moderate Flow' },
  { time: '16:00 - 20:00', riskIndex: 74, label: 'Evening Peak + Dusk Glare' },
  { time: '20:00 - 24:00', riskIndex: 59, label: 'Night Freight Mixing' },
];

export const SAMPLE_CAUSES_BREAKDOWN = [
  { name: 'Excessive Speed & Tailgating', percentage: 36, color: '#EF4444' },
  { name: 'Adverse Weather / Wet Surface', percentage: 27, color: '#F97316' },
  { name: 'Poor Visibility / Glare / Unlit', percentage: 19, color: '#F59E0B' },
  { name: 'Infrastructure / Blind Curve', percentage: 11, color: '#3B82F6' },
  { name: 'Distraction & Other', percentage: 7, color: '#10B981' },
];

export const SAMPLE_PRESET_SCENARIOS = [
  {
    id: 'monsoon-night',
    name: 'Monsoon Highway (Night)',
    description: 'Highway, heavy rain, wet asphalt, midnight darkness, high traffic speed.',
    data: {
      corridorName: 'NH-48 West Expressway (Km 42)',
      roadType: 'expressway',
      weather: 'heavy_rain',
      timeOfDay: 'late_night',
      lighting: 'unlit',
      surfaceCondition: 'waterlogged',
      trafficDensity: 'moderate',
      speedLimit: 100,
      userSpeed: 105,
    },
  },
  {
    id: 'dense-fog-dawn',
    name: 'Winter Foggy Bypass (Dawn)',
    description: 'Rural 2-lane corridor, dense fog, early morning, degraded road surface.',
    data: {
      corridorName: 'State Highway 19 River Bypass',
      roadType: 'rural_two_lane',
      weather: 'dense_fog',
      timeOfDay: 'dawn',
      lighting: 'streetlights_poor',
      surfaceCondition: 'uneven_potholes',
      trafficDensity: 'low',
      speedLimit: 60,
      userSpeed: 68,
    },
  },
  {
    id: 'urban-rush-clear',
    name: 'Urban Rush Hour (Clear)',
    description: 'City arterial, clear sunny day, heavy congestion, lower speeds.',
    data: {
      corridorName: 'Central Business District Ring Road',
      roadType: 'urban_arterial',
      weather: 'clear',
      timeOfDay: 'rush_evening',
      lighting: 'daylight',
      surfaceCondition: 'dry',
      trafficDensity: 'congested',
      speedLimit: 50,
      userSpeed: 42,
    },
  },
];

export const SAMPLE_SYSTEM_ALERTS = [
  {
    id: 'ALT-1',
    level: 'critical',
    title: 'Severe Hydroplaning Hazard Alert',
    message: 'High standing water index simulated along NH-48 Km 32-38. Advisory limit 50 km/h.',
    time: '5 mins ago',
  },
  {
    id: 'ALT-2',
    level: 'warning',
    title: 'Visibility Threshold Dropping',
    message: 'Dense fog visibility simulated <120m for Northern Expressway sector 4.',
    time: '24 mins ago',
  },
  {
    id: 'ALT-3',
    level: 'info',
    title: 'Predictive Heuristic Engine Active',
    message: 'Predictive risk heuristics active across monitored corridors with real-time inference telemetry.',
    time: 'System',
  },
];

