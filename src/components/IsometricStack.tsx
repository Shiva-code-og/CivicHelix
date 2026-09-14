'use client';

import React from 'react';

interface IsometricStackProps {
  activeLayer?: 'all' | 'citizens' | 'ai' | 'helix';
}

export default function IsometricStack({ activeLayer = 'all' }: IsometricStackProps) {
  return (
    <div className="relative w-full max-w-[420px] aspect-[4/5] flex items-center justify-center select-none group">
      {/* Precision grid marks */}
      <div className="absolute top-2 right-2 text-[10px] font-tech text-[#8c8678]">
        FIG. 03 // ARCHITECTURAL STACK
      </div>

      <svg
        viewBox="0 0 400 480"
        className="w-full h-full drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.02]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Layer 1: Top - Citizens & Multimodal Node Cluster (3 Isometric Hex/Cubes) */}
        <g className="transition-all duration-300 hover:translate-y-[-4px]">
          {/* Node 1 */}
          <path
            d="M200 40 L245 65 L200 90 L155 65 Z"
            fill="#F4F0E8"
            stroke="#121316"
            strokeWidth="1.75"
          />
          <path
            d="M155 65 L155 95 L200 120 L200 90 Z"
            fill="#E8E3D7"
            stroke="#121316"
            strokeWidth="1.75"
          />
          <path
            d="M245 65 L245 95 L200 120 L200 90 Z"
            fill="#DDD7C9"
            stroke="#121316"
            strokeWidth="1.75"
          />
          {/* User Glyph on Top */}
          <circle cx="200" cy="62" r="5" fill="#121316" />
          <path d="M192 74 C192 70 208 70 208 74" stroke="#121316" strokeWidth="1.5" strokeLinecap="round" />

          {/* Node 2 (Left) */}
          <path
            d="M135 85 L175 107 L135 130 L95 107 Z"
            fill="#F4F0E8"
            stroke="#121316"
            strokeWidth="1.75"
          />
          <path
            d="M95 107 L95 137 L135 160 L135 130 Z"
            fill="#E8E3D7"
            stroke="#121316"
            strokeWidth="1.75"
          />
          <path
            d="M175 107 L175 137 L135 160 L135 130 Z"
            fill="#DDD7C9"
            stroke="#121316"
            strokeWidth="1.75"
          />
          <circle cx="135" cy="105" r="4.5" fill="#121316" />
          <path d="M128 116 C128 112 142 112 142 116" stroke="#121316" strokeWidth="1.5" strokeLinecap="round" />

          {/* Node 3 (Right) */}
          <path
            d="M265 85 L305 107 L265 130 L225 107 Z"
            fill="#F4F0E8"
            stroke="#121316"
            strokeWidth="1.75"
          />
          <path
            d="M225 107 L225 137 L265 160 L265 130 Z"
            fill="#E8E3D7"
            stroke="#121316"
            strokeWidth="1.75"
          />
          <path
            d="M305 107 L305 137 L265 160 L265 130 Z"
            fill="#DDD7C9"
            stroke="#121316"
            strokeWidth="1.75"
          />
          <circle cx="265" cy="105" r="4.5" fill="#121316" />
          <path d="M258 116 C258 112 272 112 272 116" stroke="#121316" strokeWidth="1.5" strokeLinecap="round" />

          {/* Label */}
          <text x="315" y="80" className="font-tech text-[10px] fill-[#5e5c56]">
            01. CITIZENS
          </text>
        </g>

        {/* Connecting Vertical Dashed Vectors */}
        <line x1="200" y1="120" x2="200" y2="175" stroke="#121316" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="135" y1="160" x2="160" y2="195" stroke="#121316" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="265" y1="160" x2="240" y2="195" stroke="#121316" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* Layer 2: Middle - AI Engine & Vector Deduplication Lattice */}
        <g className="transition-all duration-300 hover:translate-y-[-2px]">
          {/* Isometric Diamond Plate */}
          <path
            d="M200 170 L310 230 L200 290 L90 230 Z"
            fill="#F4F0E8"
            stroke="#121316"
            strokeWidth="1.75"
          />
          <path
            d="M90 230 L90 245 L200 305 L200 290 Z"
            fill="#E8E3D7"
            stroke="#121316"
            strokeWidth="1.75"
          />
          <path
            d="M310 230 L310 245 L200 305 L200 290 Z"
            fill="#DDD7C9"
            stroke="#121316"
            strokeWidth="1.75"
          />

          {/* Neural / Vector Network Lattice on Top */}
          <g transform="translate(0, -5)">
            {/* Center Hub */}
            <circle cx="200" cy="235" r="7" fill="#5CE1E6" stroke="#121316" strokeWidth="1.75" />
            <circle cx="200" cy="235" r="2.5" fill="#121316" />

            {/* Satellite Nodes */}
            <circle cx="150" cy="215" r="5" fill="#F4F0E8" stroke="#121316" strokeWidth="1.5" />
            <circle cx="250" cy="215" r="5" fill="#F4F0E8" stroke="#121316" strokeWidth="1.5" />
            <circle cx="160" cy="255" r="5" fill="#F4F0E8" stroke="#121316" strokeWidth="1.5" />
            <circle cx="240" cy="255" r="5" fill="#F4F0E8" stroke="#121316" strokeWidth="1.5" />

            {/* Network Connections */}
            <line x1="150" y1="215" x2="200" y2="235" stroke="#121316" strokeWidth="1.5" />
            <line x1="250" y1="215" x2="200" y2="235" stroke="#121316" strokeWidth="1.5" />
            <line x1="160" y1="255" x2="200" y2="235" stroke="#121316" strokeWidth="1.5" />
            <line x1="240" y1="255" x2="200" y2="235" stroke="#121316" strokeWidth="1.5" />
            <line x1="150" y1="215" x2="250" y2="215" stroke="#121316" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="160" y1="255" x2="240" y2="255" stroke="#121316" strokeWidth="1" strokeDasharray="2 2" />
          </g>

          <text x="320" y="235" className="font-tech text-[10px] fill-[#5e5c56]">
            02. AI &amp; PGVECTOR
          </text>
        </g>

        {/* Connecting Vertical Dashed Vectors */}
        <line x1="200" y1="305" x2="200" y2="335" stroke="#121316" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="120" y1="245" x2="120" y2="335" stroke="#121316" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="280" y1="245" x2="280" y2="335" stroke="#121316" strokeWidth="1" strokeDasharray="3 3" />

        {/* Layer 3: Bottom - Triple-Helix Foundation (Universities, CSR, Government) */}
        <g className="transition-all duration-300 hover:translate-y-[-2px]">
          {/* Main Base Platform */}
          <path
            d="M200 330 L340 405 L200 480 L60 405 Z"
            fill="#F4F0E8"
            stroke="#121316"
            strokeWidth="2"
          />
          <path
            d="M60 405 L60 425 L200 500 L200 480 Z"
            fill="#E8E3D7"
            stroke="#121316"
            strokeWidth="2"
          />
          <path
            d="M340 405 L340 425 L200 500 L200 480 Z"
            fill="#DDD7C9"
            stroke="#121316"
            strokeWidth="2"
          />

          {/* Stepped Inner Inset */}
          <path
            d="M200 350 L310 410 L200 470 L90 410 Z"
            fill="#EAE5DA"
            stroke="#121316"
            strokeWidth="1.5"
          />

          {/* Crossed Triple-Helix Symbol on Platform */}
          <path
            d="M170 395 L230 425 M230 395 L170 425"
            stroke="#121316"
            strokeWidth="3"
            strokeLinecap="square"
          />
          <circle cx="200" cy="410" r="5" fill="#5CE1E6" stroke="#121316" strokeWidth="1.5" />

          <text x="350" y="415" className="font-tech text-[10px] fill-[#5e5c56]">
            03. TRIPLE-HELIX
          </text>
        </g>
      </svg>
    </div>
  );
}
