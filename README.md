# SafeRoad AI: Road Accident Risk Prediction & Safety Analytics Dashboard

> **Road Safety Intelligence & Decision Support Platform**  
> An engineering platform evaluating historical road collision patterns, verified highway blackspots, and empirical risk heuristics based on official MoRTH benchmarks.

---

## 🚦 Platform Overview

SafeRoad AI is a modern roadway safety intelligence web application. It provides interactive GIS mapping of nationwide highway blackspots, route corridor spatial matching, dynamic scenario hazard evaluations, and comprehensive historical accident analytics derived from official Ministry of Road Transport and Highways (MoRTH, Government of India) reports.

> **Data & Empirical Methodology Notice:**  
> Historical crash statistics and blackspot coordinates are derived from official MoRTH multi-year reports (2018–2022) and NHAI registries. Corridor risk scores are calculated transparently using Highway Safety Manual (AASHTO) safety engineering heuristic indices. All evaluations are informational statistical estimates and do not guarantee future road conditions.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite
- **Styling:** Vanilla CSS + Tailwind CSS (Accessible Dark Charcoal theme with safety hazard indicators)
- **Mapping & GIS:** Leaflet + OpenStreetMap + OSRM routing
- **Charts & Visualizations:** Recharts
- **Icons:** Lucide React (Clean SVG icon system, zero emojis)
- **Data Parsing:** PapaParse for client-side CSV validation

---

## 📁 Project Architecture & Components

```
predictor/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx               # Brand header, module navigation, and dataset import trigger
│   │   ├── Sidebar.jsx              # Compact desktop quick-access navigation rail
│   │   ├── SafetyAlertsBanner.jsx   # Informational advisory alerts stream
│   │   ├── RouteAnalyticsBar.jsx    # Corridor selector, buffer distance (2-15 km), and period filter
│   │   ├── MetricCard.jsx           # Reusable KPI card with status indicators and trend deltas
│   │   ├── RiskAnalysisForm.jsx     # Interactive roadway hazard evaluation form with quick scenarios
│   │   ├── RiskResultCard.jsx       # Risk score gauge (0-100), factor contributions, and safety advisories
│   │   ├── MissionStatement.jsx     # Platform purpose statement with high-contrast road vector visual
│   │   ├── AccidentHotspotsMap.jsx  # Interactive Leaflet GIS map with NHAI blackspots and state benchmarks
│   │   ├── JourneySafetyMode.jsx    # Custom route planner with OSRM geometry and corridor telemetry
│   │   ├── HistoricalTrends.jsx     # Official MoRTH multi-year trends, state comparisons, and circadian curves
│   │   ├── MonitoredCorridorsModal.jsx # Predefined highway corridor trajectory breakdown
│   │   ├── DatasetImportModal.jsx   # Custom CSV dataset upload, schema validation, and benchmark management
│   │   ├── PrivacyPolicyModal.jsx   # Dedicated accessible Privacy Policy and data handling disclosure
│   │   ├── TermsConditionsModal.jsx # Dedicated Terms and Conditions with road safety disclaimers
│   │   ├── Footer.jsx               # Platform navigation, legal links, attributions, and copyright
│   │   └── ErrorBoundary.jsx        # Component-level error recovery wrappers
│   ├── context/
│   │   └── JourneyContext.jsx       # State synchronization across routing, metrics, and spatial matcher
│   ├── services/
│   │   ├── blackspotDataService.js  # Curated NHAI blackspot registry with geospatial coordinates
│   │   ├── corridorService.js       # Predefined highway trajectories
│   │   ├── dataValidator.js         # CSV schema validator and sample template generator
│   │   ├── hotspotService.js        # Blackspot clustering and query utilities
│   │   ├── morthDataService.js      # Official MoRTH 2018–2022 national and state crash datasets
│   │   ├── routeAccidentMatcher.js  # Haversine spatial buffer matcher linking routes to historical crashes
│   │   └── routingService.js        # OSRM public API integration with offline fallback
│   ├── utils/
│   │   ├── riskCalculator.js        # AASHTO Highway Safety Manual deterministic heuristic scoring engine
│   │   ├── routeRiskAnalyzer.js     # Multi-segment corridor risk analysis
│   │   └── weatherService.js        # Open-Meteo atmospheric integration
│   ├── data/
│   │   └── sampleData.js            # Preset simulation scenarios and default corridor definitions
│   ├── App.jsx                      # Primary layout orchestrating dashboard workflows and modals
│   ├── index.css                    # Design system tokens, Leaflet dark theme, and slider styles
│   └── main.jsx                     # React DOM root entry point
├── public/
│   ├── favicon.svg                  # Brand SVG shield favicon matching SafeRoad logo
│   └── road_hazard_aerial.jpg       # Aerial road network illustration
├── index.html                       # HTML root document with OpenGraph and Twitter metadata
├── tailwind.config.js               # Tailored charcoal and hazard color tokens
└── package.json                     # Project scripts and dependencies
```

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to `http://localhost:5173/` in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🔒 Privacy & Legal Compliance

SafeRoad AI is built with client-side privacy architecture:
- **No User Tracking:** No tracking cookies, advertising pixels, or third-party behavioral analytics.
- **Client-Side Geolocation:** User coordinates are used solely to center maps on demand and are never stored on external servers.
- **Dedicated Legal Pages:** Accessible Privacy Policy and Terms and Conditions modals are available via the footer or URL hash (`#privacy`, `#terms`).
