"use client";

import React from "react";

import { CheckCircle2, HelpCircle, Info, Ruler, Sparkles } from "lucide-react";

export function HowToMeasureGuide() {
  return (
    <div className="space-y-6">
      {/* Introduction banner */}
      <div className="flex items-start gap-3 rounded-none border border-pink-200/70 bg-pink-50/50 p-4 text-xs text-gray-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
        <div>
          <strong className="font-semibold text-gray-950">
            For 100% Precision:
          </strong>{" "}
          Wear a lightly lined, non-padded bra (or no bra at all). Stand upright
          in front of a mirror with shoulders relaxed and breathe normally. Keep
          the measuring tape level and parallel to the floor at all times.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Step 1: Band */}
        <div className="rounded-none border border-gray-200 bg-white p-5 shadow-xs transition hover:border-pink-300">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-gray-900 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-white uppercase">
              Step 1
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--accent-plum)]">
              <Ruler className="h-3.5 w-3.5 text-[var(--accent)]" />
              Underbust Band
            </span>
          </div>

          <h3 className="mt-3 font-serif text-lg font-bold text-gray-900">
            Measure Underbust (Band Size)
          </h3>

          {/* Artistic Fashion Illustration */}
          <div className="my-4 flex h-48 items-center justify-center overflow-hidden rounded-none border border-pink-100 bg-gradient-to-b from-[#fffafb] via-[#fff5f8] to-[#fdf0f4] p-2">
            <svg
              className="h-full w-full max-w-[260px]"
              viewBox="0 0 200 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Soft feminine blush gradient */}
                <radialGradient
                  id="blushGlow"
                  cx="50%"
                  cy="55%"
                  r="45%"
                  fx="50%"
                  fy="50%"
                >
                  <stop offset="0%" stopColor="#f472b6" stopOpacity="0.22" />
                  <stop offset="60%" stopColor="#fbcfe8" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>

                {/* Measuring tape metallic sheen */}
                <linearGradient
                  id="tapeYellow"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="50%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#facc15" />
                </linearGradient>

                {/* Subtle shadow under breasts */}
                <linearGradient
                  id="creaseShadow"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#fda4af" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Background ambient blush */}
              <circle cx="100" cy="80" r="55" fill="url(#blushGlow)" />

              {/* Graceful Silhouette Outline */}
              <g
                stroke="#4b5563"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Necklines */}
                <path d="M 86,16 C 84,24 82,32 80,36" opacity="0.6" />
                <path d="M 114,16 C 116,24 118,32 120,36" opacity="0.6" />

                {/* Delicate Collarbones */}
                <path
                  d="M 80,36 C 66,40 52,38 34,34"
                  strokeWidth="1"
                  opacity="0.45"
                />
                <path
                  d="M 120,36 C 134,40 148,38 166,34"
                  strokeWidth="1"
                  opacity="0.45"
                />
                {/* Suprasternal hollow */}
                <path
                  d="M 94,34 C 98,37 102,37 106,34"
                  strokeWidth="1"
                  opacity="0.4"
                />

                {/* Shoulders & Arms Slope */}
                <path
                  d="M 80,36 C 64,40 44,48 20,54"
                  strokeWidth="1.2"
                  opacity="0.5"
                />
                <path
                  d="M 120,36 C 136,40 156,48 180,54"
                  strokeWidth="1.2"
                  opacity="0.5"
                />

                {/* Torso Flanks & Waist */}
                <path
                  d="M 28,58 C 36,74 44,96 42,142"
                  strokeWidth="1.2"
                  opacity="0.4"
                />
                <path
                  d="M 172,58 C 164,74 156,96 158,142"
                  strokeWidth="1.2"
                  opacity="0.4"
                />

                {/* Beautifully curved breasts */}
                {/* Left Breast Volume Fill */}
                <path
                  d="M 50,56 C 46,76 46,92 68,102 C 84,107 96,98 98,78 C 96,62 82,56 68,54 Z"
                  fill="#fdf2f8"
                  opacity="0.6"
                  stroke="none"
                />
                {/* Right Breast Volume Fill */}
                <path
                  d="M 150,56 C 154,76 154,92 132,102 C 116,107 104,98 102,78 C 104,62 118,56 132,54 Z"
                  fill="#fdf2f8"
                  opacity="0.6"
                  stroke="none"
                />

                {/* Left Breast Contour Line */}
                <path
                  d="M 50,56 C 44,76 44,92 66,103 C 82,108 96,99 98,78"
                  stroke="#be185d"
                  strokeWidth="1.5"
                />
                {/* Right Breast Contour Line */}
                <path
                  d="M 150,56 C 156,76 156,92 134,103 C 118,108 104,99 102,78"
                  stroke="#be185d"
                  strokeWidth="1.5"
                />

                {/* Sensual Cleavage Fold */}
                <path
                  d="M 98,66 C 100,74 100,86 100,94"
                  stroke="#be185d"
                  strokeWidth="1.2"
                  opacity="0.75"
                />

                {/* Soft natural apex highlight */}
                <circle
                  cx="70"
                  cy="82"
                  r="2"
                  fill="#f472b6"
                  stroke="#db2777"
                  strokeWidth="0.5"
                  opacity="0.8"
                />
                <circle
                  cx="130"
                  cy="82"
                  r="2"
                  fill="#f472b6"
                  stroke="#db2777"
                  strokeWidth="0.5"
                  opacity="0.8"
                />
              </g>

              {/* STEP 1: MEASURING TAPE UNDER BUST */}
              <g>
                {/* Back side of tape (around back ribcage, dashed) */}
                <path
                  d="M 43,104 C 68,98 132,98 157,104"
                  stroke="#9ca3af"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  opacity="0.6"
                />

                {/* Front measuring tape right below inframammary fold */}
                <path
                  d="M 41,105 C 70,114 130,114 159,105"
                  stroke="url(#tapeYellow)"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                {/* Tape border definition */}
                <path
                  d="M 41,105 C 70,114 130,114 159,105"
                  stroke="#ca8a04"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Real measuring tape tick marks */}
                <g stroke="#78350f" strokeWidth="1" opacity="0.75">
                  <line x1="56" y1="105" x2="56" y2="109" />
                  <line x1="68" y1="108" x2="68" y2="112" />
                  <line x1="80" y1="110" x2="80" y2="114" />
                  <line x1="92" y1="111" x2="92" y2="115" />
                  <line x1="100" y1="111" x2="100" y2="115" strokeWidth="1.5" />
                  <line x1="108" y1="111" x2="108" y2="115" />
                  <line x1="120" y1="110" x2="120" y2="114" />
                  <line x1="132" y1="108" x2="132" y2="112" />
                  <line x1="144" y1="105" x2="144" y2="109" />
                </g>

                {/* Tape end tab & rivet */}
                <rect
                  x="152"
                  y="102"
                  width="7"
                  height="7"
                  rx="1"
                  fill="#71717a"
                  stroke="#3f3f46"
                  strokeWidth="0.5"
                />
                <circle cx="155.5" cy="105.5" r="1.5" fill="#f4f4f5" />

                {/* Snug fit badge indicator */}
                <g transform="translate(100, 134)">
                  <rect
                    x="-65"
                    y="-9"
                    width="130"
                    height="18"
                    rx="9"
                    fill="#111827"
                    opacity="0.9"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="8.5"
                    fontWeight="700"
                    letterSpacing="0.4"
                  >
                    WRAP SNUG BENEATH BUST
                  </text>
                </g>
              </g>
            </svg>
          </div>

          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>
                Wrap the tape directly beneath your bust where the bra band
                sits.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>
                Pull it <strong>snug</strong> against your ribcage without
                digging in.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>
                Exhale gently and record the measurement to the nearest whole or
                half number.
              </span>
            </li>
          </ul>
        </div>

        {/* Step 2: Bust */}
        <div className="rounded-none border border-gray-200 bg-white p-5 shadow-xs transition hover:border-pink-300">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-black tracking-widest text-white uppercase">
              Step 2
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              Fullest Bust (Apex)
            </span>
          </div>

          <h3 className="mt-3 font-serif text-lg font-bold text-gray-900">
            Measure Bust (Cup Size)
          </h3>

          {/* Artistic Fashion Illustration */}
          <div className="my-4 flex h-48 items-center justify-center overflow-hidden rounded-none border border-pink-100 bg-gradient-to-b from-[#fffafb] via-[#fff5f8] to-[#fdf0f4] p-2">
            <svg
              className="h-full w-full max-w-[260px]"
              viewBox="0 0 200 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient
                  id="blushGlow2"
                  cx="50%"
                  cy="55%"
                  r="45%"
                  fx="50%"
                  fy="50%"
                >
                  <stop offset="0%" stopColor="#f472b6" stopOpacity="0.22" />
                  <stop offset="60%" stopColor="#fbcfe8" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>

                <linearGradient
                  id="tapeYellow2"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="50%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#facc15" />
                </linearGradient>
              </defs>

              {/* Background ambient blush */}
              <circle cx="100" cy="80" r="55" fill="url(#blushGlow2)" />

              {/* Graceful Silhouette Outline */}
              <g
                stroke="#4b5563"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Necklines */}
                <path d="M 86,16 C 84,24 82,32 80,36" opacity="0.6" />
                <path d="M 114,16 C 116,24 118,32 120,36" opacity="0.6" />

                {/* Delicate Collarbones */}
                <path
                  d="M 80,36 C 66,40 52,38 34,34"
                  strokeWidth="1"
                  opacity="0.45"
                />
                <path
                  d="M 120,36 C 134,40 148,38 166,34"
                  strokeWidth="1"
                  opacity="0.45"
                />
                <path
                  d="M 94,34 C 98,37 102,37 106,34"
                  strokeWidth="1"
                  opacity="0.4"
                />

                {/* Shoulders & Arms Slope */}
                <path
                  d="M 80,36 C 64,40 44,48 20,54"
                  strokeWidth="1.2"
                  opacity="0.5"
                />
                <path
                  d="M 120,36 C 136,40 156,48 180,54"
                  strokeWidth="1.2"
                  opacity="0.5"
                />

                {/* Torso Flanks & Waist */}
                <path
                  d="M 28,58 C 36,74 44,96 42,142"
                  strokeWidth="1.2"
                  opacity="0.4"
                />
                <path
                  d="M 172,58 C 164,74 156,96 158,142"
                  strokeWidth="1.2"
                  opacity="0.4"
                />

                {/* Left Breast Volume Fill */}
                <path
                  d="M 50,56 C 46,76 46,92 68,102 C 84,107 96,98 98,78 C 96,62 82,56 68,54 Z"
                  fill="#fdf2f8"
                  opacity="0.6"
                  stroke="none"
                />
                {/* Right Breast Volume Fill */}
                <path
                  d="M 150,56 C 154,76 154,92 132,102 C 116,107 104,98 102,78 C 104,62 118,56 132,54 Z"
                  fill="#fdf2f8"
                  opacity="0.6"
                  stroke="none"
                />

                {/* Left Breast Contour Line */}
                <path
                  d="M 50,56 C 44,76 44,92 66,103 C 82,108 96,99 98,78"
                  stroke="#be185d"
                  strokeWidth="1.5"
                />
                {/* Right Breast Contour Line */}
                <path
                  d="M 150,56 C 156,76 156,92 134,103 C 118,108 104,99 102,78"
                  stroke="#be185d"
                  strokeWidth="1.5"
                />

                {/* Sensual Cleavage Fold */}
                <path
                  d="M 98,66 C 100,74 100,86 100,94"
                  stroke="#be185d"
                  strokeWidth="1.2"
                  opacity="0.75"
                />
              </g>

              {/* STEP 2: MEASURING TAPE ACROSS FULLEST BUST APEX */}
              <g>
                {/* Back side of tape across shoulder blades (dashed) */}
                <path
                  d="M 38,80 C 70,72 130,72 162,80"
                  stroke="#9ca3af"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  opacity="0.6"
                />

                {/* Front measuring tape crossing both apexes gracefully */}
                <path
                  d="M 36,81 C 55,87 75,85 100,80 C 125,85 145,87 164,81"
                  stroke="url(#tapeYellow2)"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  d="M 36,81 C 55,87 75,85 100,80 C 125,85 145,87 164,81"
                  stroke="#ca8a04"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Measuring tape tick marks */}
                <g stroke="#78350f" strokeWidth="1" opacity="0.75">
                  <line x1="50" y1="80" x2="50" y2="84" />
                  <line x1="62" y1="82" x2="62" y2="86" />
                  {/* Left apex point */}
                  <line x1="70" y1="81" x2="70" y2="86" strokeWidth="1.5" />
                  <line x1="82" y1="80" x2="82" y2="84" />
                  <line x1="94" y1="78" x2="94" y2="82" />
                  <line x1="100" y1="78" x2="100" y2="83" strokeWidth="1.5" />
                  <line x1="106" y1="78" x2="106" y2="82" />
                  <line x1="118" y1="80" x2="118" y2="84" />
                  {/* Right apex point */}
                  <line x1="130" y1="81" x2="130" y2="86" strokeWidth="1.5" />
                  <line x1="140" y1="82" x2="140" y2="86" />
                  <line x1="152" y1="80" x2="152" y2="84" />
                </g>

                {/* Prominent apex indicators */}
                <circle
                  cx="70"
                  cy="83.5"
                  r="3.5"
                  fill="#db2777"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
                <circle
                  cx="130"
                  cy="83.5"
                  r="3.5"
                  fill="#db2777"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />

                {/* Tape end tab & rivet */}
                <rect
                  x="157"
                  y="77.5"
                  width="7"
                  height="7"
                  rx="1"
                  fill="#71717a"
                  stroke="#3f3f46"
                  strokeWidth="0.5"
                />
                <circle cx="160.5" cy="81" r="1.5" fill="#f4f4f5" />

                {/* Relaxed fit badge indicator */}
                <g transform="translate(100, 134)">
                  <rect
                    x="-75"
                    y="-9"
                    width="150"
                    height="18"
                    rx="9"
                    fill="var(--accent)"
                    opacity="0.95"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="8.5"
                    fontWeight="700"
                    letterSpacing="0.4"
                  >
                    LEVEL & RELAXED ACROSS APEX
                  </text>
                </g>
              </g>
            </svg>
          </div>

          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>
                Wrap the tape around the fullest part of your bust (nipple
                apex).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>
                Keep it <strong>relaxed and level</strong> — do not compress the
                breast tissue.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>
                If one breast is larger, use the measurement of the fuller side.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Pro tip */}
      <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
        <HelpCircle className="h-4 w-4 shrink-0 text-gray-500" />
        <span>
          <strong>Decimal tip:</strong> If your tape shows a decimal like 33.6
          inches or 85.5 cm, round to the nearest whole number (e.g. 34 inches /
          86 cm) for maximum bra comfort.
        </span>
      </div>
    </div>
  );
}
