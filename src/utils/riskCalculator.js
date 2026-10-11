/**
 * SafeRoad AI - Client-side Heuristic Risk Evaluation Engine
 * 
 * DISCLAIMER FOR HACKATHON EVALUATORS & USERS:
 * This is a transparent client-side mock simulation model for Stage 1 UI validation.
 * It uses weighted safety heuristics based on standard traffic engineering factors
 * (AASHTO / Highway Safety Manual principles) before actual ML weights (RandomForest/XGBoost)
 * are connected in Stage 2.
 */

export function calculateSimulatedRisk(inputs) {
  const {
    roadType = 'urban_arterial',
    weather = 'clear',
    timeOfDay = 'daylight',
    lighting = 'daylight',
    surfaceCondition = 'dry',
    trafficDensity = 'moderate',
    speedLimit = 60,
    userSpeed = 60,
  } = inputs;

  let baseScore = 20;
  const factorContributions = [];

  // 1. Road Geometry Factor
  const roadWeights = {
    expressway: 18,
    urban_arterial: 25,
    rural_two_lane: 34,
    intersection: 38,
  };
  const roadAdd = roadWeights[roadType] || 25;
  baseScore += roadAdd;
  factorContributions.push({
    factor: 'Road Class & Geometry',
    impact: `+${roadAdd} pts`,
    description: getRoadClassDescription(roadType),
    severity: roadAdd > 30 ? 'high' : 'medium',
  });

  // 2. Weather Factor
  const weatherWeights = {
    clear: 0,
    light_rain: 12,
    heavy_rain: 24,
    dense_fog: 28,
    snow_ice: 32,
  };
  const weatherAdd = weatherWeights[weather] || 0;
  baseScore += weatherAdd;
  if (weatherAdd > 0) {
    factorContributions.push({
      factor: 'Adverse Atmospheric Conditions',
      impact: `+${weatherAdd} pts`,
      description: getWeatherDescription(weather),
      severity: weatherAdd > 20 ? 'high' : 'medium',
    });
  }

  // 3. Surface Traction Factor
  const surfaceWeights = {
    dry: 0,
    wet: 14,
    waterlogged: 26,
    uneven_potholes: 24,
    icy: 35,
  };
  const surfaceAdd = surfaceWeights[surfaceCondition] || 0;
  baseScore += surfaceAdd;
  if (surfaceAdd > 0) {
    factorContributions.push({
      factor: 'Pavement Friction & Surface Defect',
      impact: `+${surfaceAdd} pts`,
      description: getSurfaceDescription(surfaceCondition),
      severity: surfaceAdd > 20 ? 'high' : 'medium',
    });
  }

  // 4. Lighting & Time Factor
  let lightAdd = 0;
  if (lighting === 'unlit') lightAdd += 22;
  else if (lighting === 'streetlights_poor') lightAdd += 14;
  else if (lighting === 'streetlights_good') lightAdd += 4;

  if (timeOfDay === 'late_night' || timeOfDay === 'dawn') lightAdd += 8;
  else if (timeOfDay === 'rush_evening') lightAdd += 6;

  baseScore += lightAdd;
  if (lightAdd > 0) {
    factorContributions.push({
      factor: 'Ambient Illumination & Circadian Risk',
      impact: `+${lightAdd} pts`,
      description: `${lighting.replace('_', ' ')} during ${timeOfDay.replace('_', ' ')}`,
      severity: lightAdd > 18 ? 'high' : 'medium',
    });
  }

  // 5. Speed Differential Factor
  const diff = Number(userSpeed) - Number(speedLimit);
  let speedAdd = 0;
  if (diff > 25) speedAdd = 28;
  else if (diff > 15) speedAdd = 20;
  else if (diff > 5) speedAdd = 12;
  else if (diff >= -5) speedAdd = 2; // at limit
  else speedAdd = -5; // well below limit (cautious driving)

  baseScore += speedAdd;
  factorContributions.push({
    factor: 'Speed Compliance & Delta',
    impact: speedAdd >= 0 ? `+${speedAdd} pts` : `${speedAdd} pts`,
    description: diff > 0 ? `Operating +${diff} km/h above corridor speed limit` : `Operating within corridor safety velocity`,
    severity: speedAdd > 15 ? 'high' : speedAdd > 5 ? 'medium' : 'low',
  });

  // 6. Traffic Density Factor
  const densityWeights = {
    low: -4,
    moderate: 4,
    congested: 12,
  };
  const densityAdd = densityWeights[trafficDensity] || 0;
  baseScore += densityAdd;

  // 7. Dangerous Intersections Factor (User-Configurable Road Hazard)
  const intersectionWeights = {
    none: 0,
    moderate: 12,
    critical: 22,
  };
  const intersectionAdd = intersectionWeights[inputs.dangerousIntersections] || 0;
  if (intersectionAdd > 0) {
    baseScore += intersectionAdd;
    factorContributions.push({
      factor: 'Geometric Conflict & Intersection Topology',
      impact: `+${intersectionAdd} pts`,
      description: inputs.dangerousIntersections === 'critical' 
        ? 'High-speed multi-leg skew intersection with severe blind-spot conflicts' 
        : 'Signalized arterial junction with frequent queue spillback and turning conflicts',
      severity: intersectionAdd >= 20 ? 'high' : 'medium',
    });
  }

  // 8. Pedestrian Activity & Vulnerable Road User Exposure
  const pedestrianWeights = {
    low: 0,
    moderate: 10,
    high_conflict: 18,
  };
  const pedAdd = pedestrianWeights[inputs.pedestrianActivity] || 0;
  if (pedAdd > 0) {
    baseScore += pedAdd;
    factorContributions.push({
      factor: 'Vulnerable Road User Exposure',
      impact: `+${pedAdd} pts`,
      description: inputs.pedestrianActivity === 'high_conflict'
        ? 'Dense pedestrian foot-traffic mixing with vehicular flows without grade separation'
        : 'Moderate curbside transit ingress and intermittent pedestrian crossings',
      severity: pedAdd >= 15 ? 'high' : 'medium',
    });
  }

  // 9. Historical Corridor Accident Propensity
  const historyWeights = {
    standard: 0,
    frequent_collisions: 14,
    severe_blackspot: 24,
  };
  const historyAdd = historyWeights[inputs.accidentHistory] || 0;
  if (historyAdd > 0) {
    baseScore += historyAdd;
    factorContributions.push({
      factor: 'Historical Incident Cluster & Blackspot Record',
      impact: `+${historyAdd} pts`,
      description: inputs.accidentHistory === 'severe_blackspot'
        ? 'Verified regional blackspot with high recurring fatal/severe collisions'
        : 'Elevated quarterly incident frequency during adverse weather and shift peaks',
      severity: historyAdd >= 20 ? 'high' : 'medium',
    });
  }

  // Clamp score strictly between 8 and 98
  const finalScore = Math.min(98, Math.max(8, Math.round(baseScore)));

  // Risk Classification
  let category = 'Low';
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let gaugeColor = '#10B981';
  let alertSummary = 'Normal driving conditions. Standard vigilance advised.';

  if (finalScore >= 78) {
    category = 'Severe';
    badgeColor = 'bg-red-500/20 text-red-400 border-red-500/40';
    gaugeColor = '#EF4444';
    alertSummary = 'CRITICAL RISK DETECTED: Multiple compounding hazard conditions present. Immediate defensive actions required.';
  } else if (finalScore >= 58) {
    category = 'High';
    badgeColor = 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    gaugeColor = '#F97316';
    alertSummary = 'Elevated collision probability. Significant friction reduction or visibility limitations.';
  } else if (finalScore >= 36) {
    category = 'Moderate';
    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    gaugeColor = '#F59E0B';
    alertSummary = 'Caution required. Moderate traffic or partial surface challenges.';
  }

  // Prescriptive Safety Recommendations
  const recommendations = generateRecommendations(inputs, finalScore);

  return {
    score: finalScore,
    category,
    badgeColor,
    gaugeColor,
    alertSummary,
    factorContributions,
    recommendations,
    calculationTimestamp: new Date().toLocaleTimeString(),
    evaluationId: inputs.evaluationId || `EVAL-${Date.now().toString(36).toUpperCase()}`,
    journeyId: inputs.journeyId || null,
    evaluatedAt: new Date().toISOString(),
  };
}

function getRoadClassDescription(type) {
  switch (type) {
    case 'expressway': return 'High nominal speeds and multi-lane lane-change conflicts.';
    case 'intersection': return 'Multiple crossing angles and high vulnerable road user exposure.';
    case 'rural_two_lane': return 'Undivided bidirectional traffic with lack of physical separation.';
    case 'urban_arterial': return 'Commercial side-friction, pedestrian activity, and frequent ingress.';
    default: return 'Standard roadway geometry.';
  }
}

function getWeatherDescription(weather) {
  switch (weather) {
    case 'heavy_rain': return 'Reduced tire adhesion, high hydroplaning risk, impaired wiper clearance.';
    case 'dense_fog': return 'Severe sight-distance compression below safe stopping distance.';
    case 'snow_ice': return 'Severe loss of micro-texture friction; stopping distances tripled.';
    case 'light_rain': return 'Initial road surface oil film slippage before clearing.';
    default: return 'Clear weather with optimal atmospheric sight lines.';
  }
}

function getSurfaceDescription(surface) {
  switch (surface) {
    case 'waterlogged': return 'Severe hydrodynamic lift hazard above 65 km/h.';
    case 'uneven_potholes': return 'Structural road defects causing abrupt vehicle swerving.';
    case 'wet': return 'Stopping distance elongated by approximately 35-50%.';
    case 'icy': return 'Near-zero friction coefficient.';
    default: return 'Normal dry asphalt grip.';
  }
}

function generateRecommendations(inputs, score) {
  const list = [];
  const { 
    weather, 
    surfaceCondition, 
    speedLimit, 
    userSpeed, 
    lighting, 
    dangerousIntersections, 
    pedestrianActivity, 
    accidentHistory 
  } = inputs;

  if (Number(userSpeed) > Number(speedLimit)) {
    list.push({
      priority: 'Urgent',
      action: `Reduce vehicle velocity to below designated ${speedLimit} km/h speed threshold.`,
      icon: 'gauge',
    });
  }

  if (weather === 'heavy_rain' || surfaceCondition === 'waterlogged' || surfaceCondition === 'wet') {
    list.push({
      priority: 'Safety Critical',
      action: 'Increase following distance from standard 2 seconds to at least 4-5 seconds to counter wet braking latency.',
      icon: 'droplets',
    });
    list.push({
      priority: 'Precaution',
      action: 'Avoid abrupt high-G steering maneuvers through standing puddles to prevent catastrophic hydroplaning.',
      icon: 'shield-alert',
    });
  }

  if (weather === 'dense_fog' || lighting === 'unlit' || lighting === 'streetlights_poor') {
    list.push({
      priority: 'Visibility',
      action: 'Engage low-beam headlights and dedicated fog lamps. Never utilize high beams in dense particulate fog.',
      icon: 'eye',
    });
  }

  if (dangerousIntersections === 'critical' || dangerousIntersections === 'moderate') {
    list.push({
      priority: 'Safety Critical',
      action: 'Approach multi-leg conflict junctions with foot covering brake; scan for non-compliant left-turn vehicles.',
      icon: 'navigation',
    });
  }

  if (pedestrianActivity === 'high_conflict' || pedestrianActivity === 'moderate') {
    list.push({
      priority: 'Precaution',
      action: 'Yield to unsignalized pedestrian crossing corridors; maintain scan for curbside pedestrian swarms.',
      icon: 'user-check',
    });
  }

  if (accidentHistory === 'severe_blackspot') {
    list.push({
      priority: 'Historical Advisory',
      action: 'Corridor logged as recurring high-fatality blackspot in regional registry; automated chevron guidance advised.',
      icon: 'alert-triangle',
    });
  }

  if (score >= 65) {
    list.push({
      priority: 'Infrastructure Advisory',
      action: 'Flag corridor segment to municipal traffic management for temporary variable message sign (VMS) deployment.',
      icon: 'radio',
    });
  } else {
    list.push({
      priority: 'Routine',
      action: 'Maintain standard lane discipline and maintain continuous blind-spot awareness.',
      icon: 'check',
    });
  }

  return list;
}

