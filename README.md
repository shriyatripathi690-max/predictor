# SafeRoad AI — Road Accident Risk Prediction & Safety Analytics Dashboard

> **Hackathon Prototype — Stage 1 Frontend**  
> An AI-powered decision support and risk prediction interface for roadway safety management.

---

## 🚦 Overview

This project is the Stage 1 frontend prototype for a hackathon. It provides a modern, responsive user interface to visualize roadway accident risks, simulate hazard conditions, inspect accident blackspots on an interactive GIS map, and review historical collision analytics.

> **Note on Data & Models:**  
> All data displayed in Stage 1 is **clearly labelled sample benchmark data**. No live traffic API or trained machine learning model is connected yet. Risk calculations are performed transparently using traffic engineering heuristic weights. Real ML inference (e.g. XGBoost/RandomForest) is slated for Stage 2.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS (Dark Navy theme with subtle safety hazard accents)
- **Charts:** Recharts
- **Icons:** Lucide React

---

## 📁 Project Architecture & Components

```
predictor/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx               # Brand header, navigation links, and simulated alert notification badge
│   │   ├── SafetyAlertsBanner.jsx   # Top dismissible simulated alert advisory stream
│   │   ├── MetricCard.jsx           # Reusable KPI metric card with sample benchmark labels and trends
│   │   ├── RiskAnalysisForm.jsx     # Interactive roadway risk evaluation form with 1-click test scenarios
│   │   ├── RiskResultCard.jsx       # Dynamic risk score meter (0-100), hazard factors, and prescriptive actions
│   │   ├── AccidentHotspotsMap.jsx  # Interactive GIS grid placeholder with selectable accident pins & inspector
│   │   ├── HistoricalTrends.jsx     # Interactive charts for 12-month trends, circadian risk curves, and root causes
│   │   └── Footer.jsx               # Project metadata, hackathon disclosure, and technology badges
│   ├── data/
│   │   └── sampleData.js            # Simulated datasets (metrics, hotspots, historical trends, presets)
│   ├── utils/
│   │   └── riskCalculator.js        # Deterministic client-side heuristic risk scoring engine for Stage 1
│   ├── App.jsx                      # Main dashboard layout coordinating state and interactions
│   ├── index.css                    # Tailwind CSS base styles and dark navy theme variables
│   └── main.jsx                     # React DOM entry point
├── index.html                       # HTML root document with SEO metadata
├── tailwind.config.js               # Custom navy colors and hazard palette configuration
└── package.json                     # Project scripts and dependencies
```

---

## 🚀 How to Run Locally

### 1. Open Terminal in the Project Directory
Make sure your terminal is inside `c:\Users\aksha\OneDrive\Desktop\predictor`.

### 2. Start the Development Server
On Windows PowerShell, run:
```powershell
npm.cmd run dev
```
*(Or in Command Prompt: `npm run dev`)*

### 3. Open in Browser
Open your browser and navigate to:
```
http://localhost:5173/
```

---

## ✅ What to Verify

1. **Dashboard KPI Cards:** Review the 4 metric cards (Monitored Corridors, Regional Risk Index, Critical Hotspots, Est. Incident Mitigation).
2. **Quick Test Scenarios:** Click buttons like **"Monsoon Highway (Night)"** or **"Winter Foggy Bypass (Dawn)"** to automatically fill the form.
3. **Interactive Predictor:** Adjust speed sliders, weather, or road types, and click **"Evaluate Corridor Risk Index"** to see the score meter update dynamically.
4. **Hotspot GIS Map:** Click on any hotspot marker (e.g. `HS-01`, `HS-02`) to view its coordinates, speed limit delta, and recommended remediation, or click **"Analyze in Predictor Form"**.
5. **Historical Analytics:** Switch between **12-Month Trend**, **Circadian Profile**, and **Root Factors** to view interactive chart data.
