'use client';

import React from 'react';

interface CampusMapGraphicsProps {
  onSelectMarker?: (markerName: string) => void;
}

export const CampusMapGraphics: React.FC<CampusMapGraphicsProps> = ({ onSelectMarker }) => {
  return (
    <div className="relative w-full h-full bg-[#050b18] overflow-hidden rounded-2xl border border-white/5 shadow-inner">
      {/* 1. Cyber grid mesh background */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 229, 255, 0.03)" strokeWidth="1" />
          </pattern>
          <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(15, 23, 42, 0.6)" />
            <stop offset="100%" stopColor="rgba(30, 41, 59, 0.8)" />
          </linearGradient>
          {/* Building Gradients */}
          <linearGradient id="wallGradLeft" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(124, 58, 237, 0.35)" />
            <stop offset="100%" stopColor="rgba(124, 58, 237, 0.05)" />
          </linearGradient>
          <linearGradient id="wallGradRight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 229, 255, 0.35)" />
            <stop offset="100%" stopColor="rgba(0, 229, 255, 0.05)" />
          </linearGradient>
          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(30, 41, 59, 0.9)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0.95)" />
          </linearGradient>
          <linearGradient id="lawnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.08)" />
            <stop offset="100%" stopColor="rgba(4, 120, 87, 0.02)" />
          </linearGradient>
          {/* Glow Filters */}
          <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowPurple" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Fill background with grid pattern */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* 2. Lawns / Green Areas */}
        <polygon points="120,60 300,40 280,180 80,140" fill="url(#lawnGrad)" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="1" />
        <polygon points="460,50 680,60 620,190 440,140" fill="url(#lawnGrad)" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="1" />
        <polygon points="200,220 420,200 480,310 180,310" fill="url(#lawnGrad)" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="1" />

        {/* 3. Roads Layout (Isometric Perspective) */}
        {/* Main Diagonal Highway */}
        <path d="M -50,300 L 850,120" stroke="url(#roadGrad)" strokeWidth="32" fill="none" strokeLinecap="round" />
        <path d="M -50,300 L 850,120" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="2" strokeDasharray="10, 12" fill="none" strokeLinecap="round" />

        {/* Secondary Cross Road */}
        <path d="M 380,40 L 460,380" stroke="url(#roadGrad)" strokeWidth="20" fill="none" strokeLinecap="round" />
        <path d="M 380,40 L 460,380" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="6, 8" fill="none" strokeLinecap="round" />

        {/* Connecting Driveways */}
        <path d="M 220,130 L 395,115" stroke="url(#roadGrad)" strokeWidth="12" fill="none" />
        <path d="M 580,135 L 405,120" stroke="url(#roadGrad)" strokeWidth="12" fill="none" />
        <path d="M 340,240 L 435,225" stroke="url(#roadGrad)" strokeWidth="12" fill="none" />

        {/* 4. Trees (Small circular groupings) */}
        {[
          { cx: 100, cy: 90 }, { cx: 120, cy: 110 }, { cx: 90, cy: 120 },
          { cx: 280, cy: 70 }, { cx: 290, cy: 90 },
          { cx: 500, cy: 80 }, { cx: 480, cy: 100 },
          { cx: 620, cy: 110 }, { cx: 640, cy: 90 },
          { cx: 220, cy: 260 }, { cx: 240, cy: 280 },
          { cx: 470, cy: 270 }, { cx: 490, cy: 290 }
        ].map((t, i) => (
          <g key={i}>
            <circle cx={t.cx} cy={t.cy} r="6" fill="rgba(16, 185, 129, 0.25)" />
            <circle cx={t.cx} cy={t.cy - 2} r="4.5" fill="rgba(16, 185, 129, 0.4)" />
            <circle cx={t.cx + 2} cy={t.cy - 1} r="2" fill="rgba(0, 255, 178, 0.5)" />
          </g>
        ))}

        {/* 5. 3D Isometric Buildings */}

        {/* Building 1: Block A (Top Left) */}
        <g transform="translate(0, 0)">
          {/* Wall Left */}
          <polygon points="170,75 220,100 220,145 170,120" fill="url(#wallGradLeft)" stroke="rgba(124, 58, 237, 0.2)" />
          {/* Wall Right */}
          <polygon points="220,100 270,75 270,120 220,145" fill="url(#wallGradRight)" stroke="rgba(0, 229, 255, 0.2)" />
          {/* Roof */}
          <polygon points="220,100 270,75 220,50 170,75" fill="url(#roofGrad)" stroke="rgba(0, 229, 255, 0.5)" />
          {/* Windows Left (Rows of glowing orange dots) */}
          <g fill="#F59E0B" opacity="0.8">
            <rect x="180" y="90" width="3" height="4" transform="skewY(26)" />
            <rect x="190" y="85" width="3" height="4" transform="skewY(26)" />
            <rect x="200" y="80" width="3" height="4" transform="skewY(26)" />
            <rect x="180" y="105" width="3" height="4" transform="skewY(26)" />
            <rect x="190" y="100" width="3" height="4" transform="skewY(26)" />
            <rect x="200" y="95" width="3" height="4" transform="skewY(26)" />
          </g>
          {/* Windows Right */}
          <g fill="#00E5FF" opacity="0.9">
            <rect x="230" y="200" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="240" y="205" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="250" y="210" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="230" y="215" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="240" y="220" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="250" y="225" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
          </g>
          {/* Glowing Helipad or indicator on Roof */}
          <ellipse cx="220" cy="75" rx="12" ry="6" fill="none" stroke="rgba(124, 58, 237, 0.4)" strokeWidth="1.5" />
          <ellipse cx="220" cy="75" rx="6" ry="3" fill="none" stroke="#00E5FF" strokeWidth="1" />
          <circle cx="220" cy="75" r="1.5" fill="#00FFB2" />
        </g>

        {/* Building 2: Block G (Top Right) */}
        <g transform="translate(360, 10)">
          {/* Wall Left */}
          <polygon points="170,75 220,100 220,145 170,120" fill="url(#wallGradLeft)" stroke="rgba(124, 58, 237, 0.2)" />
          {/* Wall Right */}
          <polygon points="220,100 270,75 270,120 220,145" fill="url(#wallGradRight)" stroke="rgba(0, 229, 255, 0.2)" />
          {/* Roof */}
          <polygon points="220,100 270,75 220,50 170,75" fill="url(#roofGrad)" stroke="rgba(0, 229, 255, 0.5)" />
          {/* Windows Left */}
          <g fill="#F59E0B" opacity="0.8">
            <rect x="180" y="90" width="3" height="4" transform="skewY(26)" />
            <rect x="190" y="85" width="3" height="4" transform="skewY(26)" />
            <rect x="200" y="80" width="3" height="4" transform="skewY(26)" />
            <rect x="180" y="105" width="3" height="4" transform="skewY(26)" />
            <rect x="190" y="100" width="3" height="4" transform="skewY(26)" />
            <rect x="200" y="95" width="3" height="4" transform="skewY(26)" />
          </g>
          {/* Windows Right */}
          <g fill="#00FFB2" opacity="0.9">
            <rect x="230" y="200" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="240" y="205" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="250" y="210" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="230" y="215" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="240" y="220" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="250" y="225" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
          </g>
          {/* Helipad */}
          <ellipse cx="220" cy="75" rx="10" ry="5" fill="none" stroke="rgba(0, 229, 255, 0.4)" strokeWidth="1" />
          <circle cx="220" cy="75" r="1" fill="#7C3AED" />
        </g>

        {/* Building 3: Block B (Bottom Left/Center) */}
        <g transform="translate(120, 110)">
          {/* Wall Left */}
          <polygon points="170,75 220,100 220,145 170,120" fill="url(#wallGradLeft)" stroke="rgba(124, 58, 237, 0.2)" />
          {/* Wall Right */}
          <polygon points="220,100 270,75 270,120 220,145" fill="url(#wallGradRight)" stroke="rgba(0, 229, 255, 0.2)" />
          {/* Roof */}
          <polygon points="220,100 270,75 220,50 170,75" fill="url(#roofGrad)" stroke="rgba(0, 229, 255, 0.5)" />
          {/* Windows Left */}
          <g fill="#F59E0B" opacity="0.8">
            <rect x="180" y="90" width="3" height="4" transform="skewY(26)" />
            <rect x="190" y="85" width="3" height="4" transform="skewY(26)" />
            <rect x="200" y="80" width="3" height="4" transform="skewY(26)" />
            <rect x="180" y="105" width="3" height="4" transform="skewY(26)" />
            <rect x="190" y="100" width="3" height="4" transform="skewY(26)" />
            <rect x="200" y="95" width="3" height="4" transform="skewY(26)" />
          </g>
          {/* Windows Right */}
          <g fill="#00E5FF" opacity="0.9">
            <rect x="230" y="200" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="240" y="205" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="250" y="210" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="230" y="215" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="240" y="220" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
            <rect x="250" y="225" width="3" height="4" transform="skewY(-26) translate(0, -210)" />
          </g>
          {/* Roof indicator */}
          <ellipse cx="220" cy="75" rx="8" ry="4" fill="none" stroke="rgba(0, 255, 178, 0.4)" strokeWidth="1" />
        </g>

        {/* Building 4: Hostel Main Gate Security Post (Bottom Right) */}
        <g transform="translate(350, 180)">
          {/* Canopy Structure */}
          <polygon points="190,65 220,80 220,95 190,80" fill="rgba(30, 41, 59, 0.85)" stroke="rgba(0, 229, 255, 0.3)" />
          <polygon points="220,80 240,70 240,85 220,95" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(0, 229, 255, 0.3)" />
          <polygon points="220,80 240,70 210,55 190,65" fill="rgba(30, 41, 59, 0.95)" stroke="rgba(0, 229, 255, 0.4)" />
          {/* Gate Barrier arm (neon red diagonal line) */}
          <line x1="185" y1="92" x2="205" y2="82" stroke="#EF4444" strokeWidth="2.5" />
          <circle cx="185" cy="92" r="2" fill="#FFFFFF" />
        </g>
      </svg>

      {/* 6. Glowing Pulse Markers and Hover Info Badges (HTML absolute overlays) */}
      
      {/* Marker 1: Block A */}
      <div 
        onClick={() => onSelectMarker?.('Block A (Boys)')}
        className="absolute top-[28%] left-[28%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-110 z-20"
      >
        <div className="relative">
          <span className="absolute -inset-2 rounded-full bg-red-500/30 animate-ping duration-1000" />
          <span className="relative block w-3 h-3 rounded-full bg-red-500 border-2 border-[#030712] shadow-lg shadow-red-500/50" />
        </div>
        {/* Info panel */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-28 p-2.5 rounded-xl glass-panel border-[#EF4444]/30 bg-black/80 backdrop-blur-md opacity-100 md:opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[8px] font-bold shadow-xl shadow-black/60 pointer-events-none select-none z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <div>
            <p className="text-white font-extrabold uppercase">Block A</p>
            <p className="text-slate-400 text-[6.5px] font-semibold">98% Occupied</p>
          </div>
        </div>
      </div>

      {/* Marker 2: Block B */}
      <div 
        onClick={() => onSelectMarker?.('Block B (Girls)')}
        className="absolute top-[68%] left-[42%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-110 z-20"
      >
        <div className="relative">
          <span className="absolute -inset-2 rounded-full bg-[#00FFB2]/30 animate-ping duration-1000" />
          <span className="relative block w-3 h-3 rounded-full bg-[#00FFB2] border-2 border-[#030712] shadow-lg shadow-[#00FFB2]/50" />
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-28 p-2.5 rounded-xl glass-panel border-[#00FFB2]/30 bg-black/80 backdrop-blur-md opacity-100 md:opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[8px] font-bold shadow-xl shadow-black/60 pointer-events-none select-none z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FFB2] animate-pulse shrink-0" />
          <div>
            <p className="text-white font-extrabold uppercase">Block B</p>
            <p className="text-slate-400 text-[6.5px] font-semibold">92% Occupied</p>
          </div>
        </div>
      </div>

      {/* Marker 3: Block G */}
      <div 
        onClick={() => onSelectMarker?.('Block G (Girls)')}
        className="absolute top-[30%] left-[72%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-110 z-20"
      >
        <div className="relative">
          <span className="absolute -inset-2 rounded-full bg-[#00FFB2]/30 animate-ping duration-1000" />
          <span className="relative block w-3 h-3 rounded-full bg-[#00FFB2] border-2 border-[#030712] shadow-lg shadow-[#00FFB2]/50" />
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-28 p-2.5 rounded-xl glass-panel border-[#00FFB2]/30 bg-black/80 backdrop-blur-md opacity-100 md:opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[8px] font-bold shadow-xl shadow-black/60 pointer-events-none select-none z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FFB2] animate-pulse shrink-0" />
          <div>
            <p className="text-white font-extrabold uppercase">Block G</p>
            <p className="text-slate-400 text-[6.5px] font-semibold">92% Occupied</p>
          </div>
        </div>
      </div>

      {/* Marker 4: Hostel Main Gate */}
      <div 
        onClick={() => onSelectMarker?.('Hostel Main Gate')}
        className="absolute top-[65%] left-[70%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-110 z-20"
      >
        <div className="relative">
          <span className="absolute -inset-2 rounded-full bg-[#00E5FF]/30 animate-ping duration-1000" />
          <span className="relative block w-3 h-3 rounded-full bg-[#00E5FF] border-2 border-[#030712] shadow-lg shadow-[#00E5FF]/50" />
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 p-2.5 rounded-xl glass-panel border-[#00E5FF]/30 bg-black/80 backdrop-blur-md opacity-100 md:opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[8px] font-bold shadow-xl shadow-black/60 pointer-events-none select-none z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse shrink-0" />
          <div>
            <p className="text-white font-extrabold uppercase">Hostel Main Gate</p>
            <p className="text-[#00E5FF] text-[6.5px] font-black uppercase mt-0.5">Secure</p>
          </div>
        </div>
      </div>

    </div>
  );
};
export default CampusMapGraphics;

