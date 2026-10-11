import React from 'react';

/**
 * RoadSafetyVisual - Cinematic Glowing 3D Road Vector Illustration
 * Features perspective highway extending toward the horizon with streaming
 * orange/amber light trails, foreshortened road markings, glowing hazard pins,
 * and holographic GIS telemetry nodes. Blends seamlessly into dark charcoal background.
 */
function RoadSafetyVisual() {
  return (
    <div className="relative w-full h-full min-h-[300px] sm:min-h-[360px] lg:min-h-[440px] flex items-center justify-center select-none overflow-hidden rounded-2xl">
      {/* Ambient background glow centered at horizon */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-48 sm:h-64 rounded-full pointer-events-none opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 106, 0, 0.45) 0%, rgba(255, 152, 0, 0.18) 45%, transparent 70%)',
        }}
      />

      {/* Main SVG Vector Canvas */}
      <svg 
        viewBox="0 0 760 520" 
        className="w-full h-full max-h-[480px] drop-shadow-2xl" 
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle edge fading mask to ensure 0 rectangular boundary */}
          <radialGradient id="edgeVignette" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="98%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          
          <mask id="seamlessMask">
            <rect x="0" y="0" width="760" height="520" fill="url(#edgeVignette)" />
          </mask>

          {/* Road Surface Dark Asphalt Gradient */}
          <linearGradient id="roadSurfaceGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#0a0d16" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#0f1322" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#151929" stopOpacity="1" />
          </linearGradient>

          {/* Left Guardrail Glowing Gradient */}
          <linearGradient id="leftRailGrad" x1="80%" y1="0%" x2="20%" y2="100%">
            <stop offset="0%" stopColor="#ff9800" stopOpacity="0.3" />
            <stop offset="35%" stopColor="#ff6a00" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ff8833" stopOpacity="1" />
          </linearGradient>

          {/* Right Guardrail Glowing Gradient */}
          <linearGradient id="rightRailGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffb338" stopOpacity="0.3" />
            <stop offset="40%" stopColor="#ff9800" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffb338" stopOpacity="1" />
          </linearGradient>

          {/* Inbound Amber/Golden High-Speed Trail */}
          <linearGradient id="amberTrail" x1="70%" y1="0%" x2="30%" y2="100%">
            <stop offset="0%" stopColor="#ffd166" stopOpacity="0.1" />
            <stop offset="25%" stopColor="#ffb338" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#ff9800" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff6a00" stopOpacity="0.9" />
          </linearGradient>

          {/* Coral Orange Inbound Trail */}
          <linearGradient id="orangeTrail" x1="65%" y1="0%" x2="35%" y2="100%">
            <stop offset="0%" stopColor="#ff6a00" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#ff6a00" stopOpacity="0.6" />
            <stop offset="75%" stopColor="#ff4500" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ff7700" stopOpacity="0.85" />
          </linearGradient>

          {/* Outbound Taillight Glowing Streak */}
          <linearGradient id="taillightTrail" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
            <stop offset="35%" stopColor="#f43f5e" stopOpacity="0.75" />
            <stop offset="80%" stopColor="#e11d48" stopOpacity="1" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0.8" />
          </linearGradient>

          {/* Safety Telemetry Corridor Beam (Cyan/Sky) */}
          <linearGradient id="telemetryBeam" x1="45%" y1="0%" x2="55%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
            <stop offset="40%" stopColor="#0284c7" stopOpacity="0.5" />
            <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.9" />
          </linearGradient>

          {/* Horizon Nebula Glow */}
          <radialGradient id="horizonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff8833" stopOpacity="0.75" />
            <stop offset="35%" stopColor="#ff6a00" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#ff9800" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ff9800" stopOpacity="0" />
          </radialGradient>

          {/* Glow Filters */}
          <filter id="roadGlowOrange" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur1" />
            <feGaussianBlur stdDeviation="14" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="trailGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="pinGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Masked Group for seamless edge blending */}
        <g mask="url(#seamlessMask)">
          
          {/* 1. Perspective Geospatial Terrain Grid Mesh */}
          <g opacity="0.35" stroke="rgba(255, 106, 0, 0.12)" strokeWidth="0.8">
            {/* Horizon transversal lines with perspective decay */}
            <line x1="40" y1="460" x2="720" y2="460" />
            <line x1="80" y1="405" x2="680" y2="405" />
            <line x1="120" y1="355" x2="640" y2="355" />
            <line x1="160" y1="310" x2="600" y2="310" />
            <line x1="200" y1="270" x2="560" y2="270" />
            <line x1="240" y1="235" x2="530" y2="235" />
            <line x1="280" y1="205" x2="505" y2="205" />
            <line x1="315" y1="180" x2="485" y2="180" />
            <line x1="345" y1="160" x2="470" y2="160" />
            <line x1="370" y1="145" x2="455" y2="145" />

            {/* Longitudinal perspective rays converging toward vanishing point (415, 135) */}
            <line x1="-20" y1="520" x2="415" y2="135" strokeOpacity="0.25" />
            <line x1="50" y1="520" x2="415" y2="135" strokeOpacity="0.4" />
            <line x1="140" y1="520" x2="415" y2="135" strokeOpacity="0.5" />
            <line x1="620" y1="520" x2="415" y2="135" strokeOpacity="0.5" />
            <line x1="710" y1="520" x2="415" y2="135" strokeOpacity="0.4" />
            <line x1="780" y1="520" x2="415" y2="135" strokeOpacity="0.25" />
          </g>

          {/* 2. Atmospheric Horizon Glow */}
          <ellipse cx="415" cy="135" rx="140" ry="38" fill="url(#horizonGlow)" opacity="0.85" />
          <circle cx="415" cy="135" r="4" fill="#ffffff" filter="url(#pinGlow)" opacity="0.9" />

          {/* 3. 3D Curved Highway Surface */}
          <path
            d="M 120,520 C 230,370 340,240 405,135 L 425,135 C 485,240 555,370 640,520 Z"
            fill="url(#roadSurfaceGrad)"
          />

          {/* Road Surface Grid / Subtle Lateral Markings for depth */}
          <g stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1">
            <path d="M 175,470 C 275,470 475,470 585,470" />
            <path d="M 230,415 C 310,415 450,415 530,415" />
            <path d="M 285,360 C 340,360 430,360 480,360" />
            <path d="M 330,305 C 370,305 420,305 448,305" />
            <path d="M 365,255 C 390,255 418,255 432,255" />
            <path d="M 390,210 C 402,210 415,210 422,210" />
          </g>

          {/* 4. Glowing Highway Shoulders & Guardrails */}
          {/* Left Guardrail (Bright Coral-Orange) */}
          <path
            d="M 120,520 C 230,370 340,240 405,135"
            fill="none"
            stroke="url(#leftRailGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#roadGlowOrange)"
          />
          <path
            d="M 120,520 C 230,370 340,240 405,135"
            fill="none"
            stroke="#ff9800"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Right Guardrail (Golden Amber) */}
          <path
            d="M 640,520 C 555,370 485,240 425,135"
            fill="none"
            stroke="url(#rightRailGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#roadGlowOrange)"
          />
          <path
            d="M 640,520 C 555,370 485,240 425,135"
            fill="none"
            stroke="#ffb338"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* 5. Centerline Foreshortened Dashes */}
          <g stroke="#ffc247" strokeLinecap="round" filter="url(#trailGlow)">
            <line x1="380" y1="520" x2="381" y2="465" strokeWidth="4.5" strokeOpacity="0.95" />
            <line x1="384" y1="442" x2="388" y2="396" strokeWidth="3.8" strokeOpacity="0.9" />
            <line x1="392" y1="378" x2="397" y2="340" strokeWidth="3.2" strokeOpacity="0.85" />
            <line x1="400" y1="326" x2="404" y2="294" strokeWidth="2.6" strokeOpacity="0.8" />
            <line x1="407" y1="282" x2="410" y2="256" strokeWidth="2.2" strokeOpacity="0.75" />
            <line x1="412" y1="246" x2="414" y2="224" strokeWidth="1.8" strokeOpacity="0.7" />
            <line x1="415" y1="216" x2="416" y2="198" strokeWidth="1.5" strokeOpacity="0.65" />
            <line x1="416" y1="190" x2="417" y2="175" strokeWidth="1.2" strokeOpacity="0.6" />
            <line x1="416.5" y1="168" x2="416" y2="156" strokeWidth="1.0" strokeOpacity="0.5" />
            <line x1="415.5" y1="150" x2="415" y2="140" strokeWidth="0.8" strokeOpacity="0.4" />
          </g>

          {/* 6. Cinematic Streaming Light Trails */}
          {/* Amber Trail - High Speed Fast Lane */}
          <path
            d="M 280,520 C 310,380 375,245 412,135"
            fill="none"
            stroke="url(#amberTrail)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#trailGlow)"
          />
          <path
            d="M 280,520 C 310,380 375,245 412,135"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.8"
            strokeLinecap="round"
          />

          {/* Coral Orange Trail - Express Lane */}
          <path
            d="M 240,520 C 285,385 365,247 410,135"
            fill="none"
            stroke="url(#orangeTrail)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#trailGlow)"
          />

          {/* Secondary Golden Ribbon */}
          <path
            d="M 320,520 C 335,385 385,246 414,135"
            fill="none"
            stroke="#ffcc00"
            strokeWidth="1.8"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />

          {/* Outbound Taillight Glowing Streak (Right lanes) */}
          <path
            d="M 520,520 C 495,380 460,245 418,135"
            fill="none"
            stroke="url(#taillightTrail)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#trailGlow)"
          />
          <path
            d="M 560,520 C 520,380 470,245 420,135"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeOpacity="0.75"
            strokeLinecap="round"
          />

          {/* Cyan Telemetry Corridor Beam */}
          <path
            d="M 450,520 C 455,380 442,245 416,135"
            fill="none"
            stroke="url(#telemetryBeam)"
            strokeWidth="2"
            strokeOpacity="0.65"
            strokeLinecap="round"
          />

          {/* 7. Holographic Road-Safety Analytics Markers & Data Nodes */}

          {/* MARKER 1: Mid-Curve Hotspot Beacon */}
          <g transform="translate(355, 290)">
            {/* Concentric radar pulse rings */}
            <circle cx="0" cy="0" r="26" fill="none" stroke="#ff6a00" strokeWidth="0.8" opacity="0.25" strokeDasharray="3,3" />
            <circle cx="0" cy="0" r="15" fill="none" stroke="#ff9800" strokeWidth="1" opacity="0.45" />
            <circle cx="0" cy="0" r="6" fill="#ff6a00" opacity="0.4" filter="url(#pinGlow)" />
            <circle cx="0" cy="0" r="3.5" fill="#ffd166" />

            {/* Vertical stem line to HUD card */}
            <line x1="0" y1="0" x2="0" y2="-75" stroke="#ff9800" strokeWidth="1" strokeDasharray="2,3" opacity="0.7" />
            <circle cx="0" cy="-75" r="2" fill="#ff9800" />

            {/* Holographic HUD Card */}
            <g transform="translate(-145, -112)">
              <rect x="0" y="0" width="145" height="36" rx="8" fill="#10131d" fillOpacity="0.9" stroke="#ff6a00" strokeOpacity="0.4" strokeWidth="1" />
              <circle cx="12" cy="18" r="3.5" fill="#10b981" />
              <text x="22" y="15" fill="#f8fafc" fontSize="8.5" fontWeight="700" letterSpacing="0.08em" fontFamily="system-ui, sans-serif">
                RADAR SECTOR #04
              </text>
              <text x="22" y="27" fill="#ffb338" fontSize="8" fontWeight="600" letterSpacing="0.04em" fontFamily="monospace">
                AI RISK: 18% · STABLE
              </text>
            </g>
          </g>

          {/* MARKER 2: Foreground Right Sensor Node */}
          <g transform="translate(515, 395)">
            {/* Radar rings */}
            <circle cx="0" cy="0" r="28" fill="none" stroke="#ff9800" strokeWidth="0.8" opacity="0.3" strokeDasharray="4,3" />
            <circle cx="0" cy="0" r="14" fill="none" stroke="#ffb338" strokeWidth="1.2" opacity="0.5" />
            <circle cx="0" cy="0" r="4.5" fill="#ff6a00" filter="url(#pinGlow)" />
            <circle cx="0" cy="0" r="2.5" fill="#ffffff" />

            {/* Stem line */}
            <line x1="0" y1="0" x2="0" y2="-70" stroke="#ffb338" strokeWidth="1" strokeDasharray="2,3" opacity="0.75" />
            <circle cx="0" cy="-70" r="2" fill="#ffb338" />

            {/* Holographic HUD Card */}
            <g transform="translate(-150, -106)">
              <rect x="0" y="0" width="150" height="36" rx="8" fill="#10131d" fillOpacity="0.9" stroke="#ff9800" strokeOpacity="0.4" strokeWidth="1" />
              <circle cx="12" cy="18" r="3.5" fill="#ff9800" />
              <text x="22" y="15" fill="#f8fafc" fontSize="8.5" fontWeight="700" letterSpacing="0.08em" fontFamily="system-ui, sans-serif">
                GIS CORRIDOR KM 38
              </text>
              <text x="22" y="27" fill="#38bdf8" fontSize="8" fontWeight="600" letterSpacing="0.04em" fontFamily="monospace">
                SPEED FLOW: 92 KM/H
              </text>
            </g>
          </g>

          {/* MARKER 3: Horizon Distant Telemetry Beacon */}
          <g transform="translate(415, 135)">
            <line x1="0" y1="0" x2="0" y2="-55" stroke="#ffb338" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
            <circle cx="0" cy="-55" r="2" fill="#ffd166" />
            
            {/* Minimal top pill */}
            <g transform="translate(-48, -78)">
              <rect x="0" y="0" width="96" height="20" rx="10" fill="#10131d" fillOpacity="0.85" stroke="#ff9800" strokeOpacity="0.3" strokeWidth="0.8" />
              <circle cx="10" cy="10" r="2.5" fill="#10b981" />
              <text x="18" y="13" fill="#e2e8f0" fontSize="7.5" fontWeight="700" letterSpacing="0.06em" fontFamily="monospace">
                LIVE HORIZON
              </text>
            </g>
          </g>

          {/* 8. Subtle Floating Telemetry Particles */}
          <g fill="#ffd166" opacity="0.7">
            <circle cx="330" cy="230" r="1.5" />
            <circle cx="480" cy="270" r="1.8" fill="#ff9800" />
            <circle cx="260" cy="340" r="1.5" />
            <circle cx="580" cy="360" r="1.5" fill="#ff6a00" />
            <circle cx="390" cy="180" r="1.2" />
            <circle cx="440" cy="190" r="1.2" fill="#38bdf8" />
          </g>

        </g>
      </svg>

      {/* Floating Status Badge in Top-Right Corner */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-charcoal-900/85 border border-charcoal-750/90 backdrop-blur-md text-[11px] font-mono text-slate-300 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-slate-200">AI TELEMETRY MESH</span>
        <span className="text-[10px] text-brand-orange pl-1 font-bold">ONLINE</span>
      </div>
    </div>
  );
}

/**
 * SafeRoad AI - Brand Mission Statement
 * Premium Two-Column Layout:
 * - Left side (45%): High-impact mission headline & purpose statement
 * - Right side (55%): Cinematic glowing 3D road vector visualization
 */
export function MissionStatement({ className = '' }) {
  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border border-charcoal-750/90 bg-gradient-to-br from-charcoal-900/95 via-[#0e111a]/98 to-charcoal-900/90 p-6 sm:p-8 lg:p-10 xl:p-12 shadow-card-dark backdrop-blur-2xl ${className}`}
    >
      {/* Ambient warm radial glow in the upper-left */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-25 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(255, 106, 0, 0.45) 0%, transparent 70%)',
        }}
      />

      {/* Subtle deep amber ambient glow in the lower-right */}
      <div 
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, transparent 70%)',
        }}
      />

      {/* Cartographic micro-grid overlay for subtle depth */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Subtle top edge border accent highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent pointer-events-none" />

      {/* Main Two-Column Layout: Left (45%) & Right (55%) */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10 xl:gap-12">
        
        {/* LEFT COLUMN: 45% Width (Text & Brand Statement) */}
        <div className="w-full lg:w-[45%] flex flex-col justify-between space-y-6 sm:space-y-7 shrink-0">
          
          {/* Upper: Mission Label (Bigger, refined uppercase, elegant letter spacing, coral/amber accent) */}
          <div className="flex items-center space-x-3.5 sm:space-x-4">
            <span 
              className="w-10 sm:w-12 lg:w-14 h-1 sm:h-[4.5px] rounded-full bg-gradient-to-r from-brand-orange via-orange-500 to-amber-400 shrink-0 shadow-sm" 
              aria-hidden="true"
            />
            <span className="text-base sm:text-lg lg:text-[19px] xl:text-[20px] font-extrabold uppercase tracking-[0.24em] text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-amber-300 select-none pb-0.5">
              OUR MISSION
            </span>
          </div>

          {/* Central: High-Impact Responsive Headline without any clipping */}
          <div className="py-1 sm:py-2">
            <h2 className="text-3xl sm:text-4xl md:text-[42px] lg:text-[38px] xl:text-[45px] 2xl:text-[48px] font-black tracking-tight leading-[1.22] sm:leading-[1.24] lg:leading-[1.26]">
              <span className="text-white block pb-1 sm:pb-2">
                Every road tells a story.
              </span>
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-orange-400 to-amber-300 pt-1 pb-3 sm:pb-4 pr-3">
                Every insight matters.
              </span>
            </h2>
          </div>

          {/* Lower: Supporting Paragraph (Readable, balanced contrast & comfortable width) */}
          <div className="pt-5 sm:pt-6 border-t border-charcoal-750/70">
            <p className="text-sm sm:text-base lg:text-[17px] xl:text-[18px] text-slate-200/90 font-normal leading-relaxed sm:leading-[1.7] max-w-xl">
              We transform road-safety data into actionable understanding to help communities work toward safer roads.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: 55% Width (Cinematic 3D Road-Safety Vector Visualization) */}
        <div className="w-full lg:w-[55%] relative flex items-center justify-center">
          <RoadSafetyVisual />
        </div>

      </div>

    </div>
  );
}
