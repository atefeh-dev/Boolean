<template>
  <svg
          class="hero__art"
          viewBox="0 0 420 360"
          fill="none"
          role="img"
          aria-label="بولتن با پنج لینک منتخب روزانه طراحی"
        >
          <defs>
            <linearGradient id="panel-glow" x1="0" y1="0" x2="420" y2="360" gradientUnits="userSpaceOnUse">
              <stop stop-color="#EFF1E7" stop-opacity="0.14" />
              <stop offset="1" stop-color="#EFF1E7" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="sidebar-panel" x1="88" y1="48" x2="332" y2="312" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FFFFFF" />
              <stop offset="1" stop-color="#ECEFE4" />
            </linearGradient>
            <linearGradient id="featured-card" x1="0" y1="0" x2="1" y2="1">
              <stop stop-color="#31584B" />
              <stop offset="1" stop-color="#173027" />
            </linearGradient>
            <filter id="hero-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="#000" flood-opacity="0.28" />
            </filter>
            <filter id="hero-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000" flood-opacity="0.18" />
            </filter>
          </defs>

          <!-- ambient glow -->
          <ellipse cx="210" cy="180" rx="160" ry="130" fill="url(#panel-glow)" class="float-slow" />

          <!-- main browser window -->
          <g class="float-card" filter="url(#hero-glow)">
            <rect x="52" y="36" width="316" height="288" rx="22" fill="url(#sidebar-panel)" />
            <rect x="52" y="36" width="316" height="288" rx="22" stroke="rgba(255, 255, 255,0.35)" stroke-width="1.5" />

            <!-- window chrome -->
            <rect x="52" y="36" width="316" height="44" rx="22" fill="#24483D" />
            <rect x="52" y="58" width="316" height="22" fill="#24483D" />
            <circle cx="82" cy="58" r="5" fill="#9C5A3A" opacity="0.85" />
            <circle cx="98" cy="58" r="5" fill="#B08D46" opacity="0.85" />
            <circle cx="114" cy="58" r="5" fill="rgba(255, 255, 255,0.45)" />

            <!-- sidebar column -->
            <rect x="68" y="92" width="88" height="216" rx="14" fill="#24483D" />
            <!-- brand waves -->
            <path d="M78 112 C78 112 84 108 92 110 C100 112 106 110 106 110" stroke="#EFF1E7" stroke-width="2.2" stroke-linecap="round" opacity="0.9" />
            <path d="M78 122 C78 122 84 118 92 120 C100 122 106 120 106 120" stroke="#EFF1E7" stroke-width="2.2" stroke-linecap="round" opacity="0.9" />
            <path d="M78 132 C78 132 84 128 92 130 C100 132 106 130 106 130" stroke="#EFF1E7" stroke-width="2.2" stroke-linecap="round" opacity="0.9" />
            <rect x="78" y="148" width="68" height="1.5" rx="0.75" fill="rgba(255, 255, 255,0.2)" />

            <!-- 5 curated link rows in sidebar -->
            <g class="float-chip">
              <rect x="76" y="160" width="72" height="26" rx="8" fill="rgba(255, 255, 255,0.14)" />
              <circle cx="88" cy="173" r="5" fill="#B08D46" />
              <rect x="98" y="169" width="40" height="4" rx="2" fill="rgba(255, 255, 255,0.85)" />
              <rect x="98" y="177" width="28" height="3" rx="1.5" fill="rgba(255, 255, 255,0.35)" />
            </g>
            <g>
              <rect x="76" y="192" width="72" height="26" rx="8" fill="rgba(255, 255, 255,0.1)" />
              <circle cx="88" cy="205" r="5" fill="#9C5A3A" opacity="0.8" />
              <rect x="98" y="201" width="36" height="4" rx="2" fill="rgba(255, 255, 255,0.65)" />
              <rect x="98" y="209" width="24" height="3" rx="1.5" fill="rgba(255, 255, 255,0.28)" />
            </g>
            <g class="paper-line">
              <rect x="76" y="224" width="72" height="26" rx="8" fill="rgba(255, 255, 255,0.08)" />
              <circle cx="88" cy="237" r="5" fill="rgba(255, 255, 255,0.45)" />
              <rect x="98" y="233" width="42" height="4" rx="2" fill="rgba(255, 255, 255,0.55)" />
              <rect x="98" y="241" width="30" height="3" rx="1.5" fill="rgba(255, 255, 255,0.22)" />
            </g>
            <g>
              <rect x="76" y="256" width="72" height="26" rx="8" fill="rgba(255, 255, 255,0.06)" />
              <circle cx="88" cy="269" r="5" fill="rgba(255, 255, 255,0.35)" />
              <rect x="98" y="265" width="34" height="4" rx="2" fill="rgba(255, 255, 255,0.45)" />
            </g>
            <g>
              <rect x="76" y="280" width="72" height="22" rx="8" fill="rgba(255, 255, 255,0.05)" />
              <circle cx="88" cy="291" r="4" fill="rgba(255, 255, 255,0.28)" />
              <rect x="98" y="288" width="38" height="3.5" rx="1.75" fill="rgba(255, 255, 255,0.38)" />
            </g>

            <!-- main content: featured link preview -->
            <rect x="168" y="92" width="184" height="216" rx="14" fill="#EBEEE2" />
            <rect x="184" y="108" width="72" height="8" rx="4" fill="#9C5A3A" />
            <rect x="184" y="128" width="140" height="96" rx="10" fill="url(#featured-card)" />
            <path d="M210 168 C224 152 238 152 252 168" stroke="#E9D8C8" stroke-width="2.5" stroke-linecap="round" />
            <rect x="184" y="236" width="120" height="7" rx="3.5" fill="#24483D" />
            <rect x="184" y="252" width="148" height="5" rx="2.5" fill="#868c82" opacity="0.7" />
            <rect x="184" y="266" width="132" height="5" rx="2.5" fill="#CFD4C2" />
            <rect x="184" y="284" width="56" height="16" rx="8" fill="#E9D8C8" />
            <rect x="192" y="290" width="28" height="4" rx="2" fill="#9C5A3A" />
          </g>

          <!-- floating daily badge -->
          <g class="float-chip" filter="url(#hero-soft)">
            <g transform="translate(12 48) rotate(-12)">
              <rect width="96" height="96" rx="20" fill="#9C5A3A" />
              <text x="48" y="44" text-anchor="middle" fill="#EFF1E7" font-family="Vazirmatn, Tahoma, sans-serif" font-size="28" font-weight="800">۵</text>
              <text x="48" y="68" text-anchor="middle" fill="rgba(239, 241, 231,0.85)" font-family="Vazirmatn, Tahoma, sans-serif" font-size="11" font-weight="600">لینک امروز</text>
            </g>
          </g>

          <!-- floating link chip -->
          <g class="float-slow" filter="url(#hero-soft)">
            <g transform="translate(310 248) rotate(10)">
              <rect width="88" height="52" rx="12" fill="rgba(255, 255, 255,0.95)" stroke="rgba(255, 255, 255,0.4)" />
              <circle cx="22" cy="26" r="10" fill="#24483D" />
              <path d="M18 26 L21 29 L27 22" stroke="#EFF1E7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <rect x="38" y="18" width="38" height="5" rx="2.5" fill="#24483D" />
              <rect x="38" y="30" width="28" height="4" rx="2" fill="#868c82" opacity="0.6" />
            </g>
          </g>

          <!-- sparkle accents -->
          <circle class="pulse-dot" cx="368" cy="72" r="5" fill="#B08D46" />
          <circle class="pulse-dot" cx="38" cy="290" r="4" fill="rgba(255, 255, 255,0.55)" />
        </svg>
</template>
