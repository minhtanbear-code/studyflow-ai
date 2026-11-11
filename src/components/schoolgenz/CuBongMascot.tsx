"use client";

import React from "react";

export function CuBongMascot({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md hover:scale-105 transition-transform duration-300"
      >
        {/* Soft Shadow */}
        <ellipse cx="100" cy="180" rx="60" ry="12" fill="#bfdbfe" opacity="0.6" />

        {/* Feet */}
        <ellipse cx="80" cy="168" rx="14" ry="7" fill="#f59e0b" />
        <ellipse cx="120" cy="168" rx="14" ry="7" fill="#f59e0b" />
        <ellipse cx="76" cy="169" rx="5" ry="5" fill="#d97706" />
        <ellipse cx="84" cy="169" rx="5" ry="5" fill="#d97706" />
        <ellipse cx="116" cy="169" rx="5" ry="5" fill="#d97706" />
        <ellipse cx="124" cy="169" rx="5" ry="5" fill="#d97706" />

        {/* Body Main Gradient */}
        <defs>
          <linearGradient id="bodyGrad" x1="100" y1="40" x2="100" y2="170" gradientUnits="userSpaceOnUse">
            <stop stopColor="#93c5fd" />
            <stop offset="0.5" stopColor="#60a5fa" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="bellyGrad" x1="100" y1="100" x2="100" y2="165" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#e0f2fe" />
          </linearGradient>
          <linearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#60a5fa" />
            <stop offset="1" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="eyeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#1e3a8a" />
            <stop offset="0.6" stopColor="#0f172a" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Body */}
        <ellipse cx="100" cy="115" rx="64" ry="60" fill="url(#bodyGrad)" />

        {/* Fluffy Head Tufts */}
        <path d="M68 62 C50 40, 48 30, 62 48 Z" fill="#60a5fa" />
        <path d="M132 62 C150 40, 152 30, 138 48 Z" fill="#60a5fa" />

        {/* Cute Feathers on Head */}
        <path d="M96 52 C90 42, 85 45, 94 56 Z" fill="#93c5fd" />
        <path d="M104 52 C110 42, 115 45, 106 56 Z" fill="#93c5fd" />

        {/* Left Wing (Waving Up) */}
        <path
          d="M42 110 C20 90, 18 68, 38 78 C48 83, 52 105, 42 110 Z"
          fill="url(#wingGrad)"
        />

        {/* Right Wing */}
        <path
          d="M158 115 C176 128, 172 152, 155 142 C146 137, 148 120, 158 115 Z"
          fill="url(#wingGrad)"
        />

        {/* White Belly */}
        <ellipse cx="100" cy="128" rx="42" ry="34" fill="url(#bellyGrad)" />

        {/* Belly Feather Chevrons */}
        <path d="M90 120 Q100 126 110 120" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M85 132 Q100 138 115 132" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M92 144 Q100 149 108 144" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Eye Sockets (White/Cream) */}
        <ellipse cx="76" cy="94" rx="24" ry="26" fill="#ffffff" />
        <ellipse cx="124" cy="94" rx="24" ry="26" fill="#ffffff" />

        {/* Eye Outer Rings */}
        <circle cx="77" cy="95" r="19" fill="#38bdf8" />
        <circle cx="123" cy="95" r="19" fill="#38bdf8" />

        {/* Pupils (Big Sparkly Anime Eyes) */}
        <circle cx="78" cy="96" r="15" fill="url(#eyeGrad)" />
        <circle cx="122" cy="96" r="15" fill="url(#eyeGrad)" />

        {/* Big Highlights */}
        <circle cx="74" cy="91" r="6" fill="#ffffff" />
        <circle cx="118" cy="91" r="6" fill="#ffffff" />
        <circle cx="83" cy="102" r="2.5" fill="#ffffff" />
        <circle cx="127" cy="102" r="2.5" fill="#ffffff" />

        {/* Blushing Cheeks */}
        <ellipse cx="58" cy="115" rx="9" ry="5" fill="#f43f5e" opacity="0.3" />
        <ellipse cx="142" cy="115" rx="9" ry="5" fill="#f43f5e" opacity="0.3" />

        {/* Cute Beak */}
        <path
          d="M93 102 C93 100, 107 100, 107 102 L100 115 Z"
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <ellipse cx="100" cy="103" rx="6" ry="2" fill="#fbbf24" />
      </svg>
    </div>
  );
}
