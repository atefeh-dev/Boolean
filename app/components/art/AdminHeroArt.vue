<template>
  <svg viewBox="0 0 360 300" fill="none" role="img" aria-label="پنل مدیریت بولتن">
    <defs>
      <linearGradient id="admin-panel" x1="40" y1="20" x2="320" y2="280" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FFFFFF" />
        <stop offset="1" stop-color="#ECEFE4" />
      </linearGradient>
      <filter id="admin-hero-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000" flood-opacity="0.22" />
      </filter>
    </defs>

    <g filter="url(#admin-hero-shadow)">
      <rect x="40" y="24" width="280" height="240" rx="20" fill="url(#admin-panel)" />
      <rect x="40" y="24" width="280" height="38" rx="20" fill="#24483D" />
      <rect x="40" y="44" width="280" height="18" fill="#24483D" />
      <circle cx="64" cy="43" r="4.5" fill="#9C5A3A" opacity="0.85" />
      <circle cx="78" cy="43" r="4.5" fill="#B08D46" opacity="0.85" />
      <circle cx="92" cy="43" r="4.5" fill="rgba(255, 255, 255,0.45)" />

      <rect x="60" y="84" width="248" height="34" rx="10" fill="rgba(36,72,61,0.07)" />
      <circle cx="78" cy="101" r="8" fill="#24483D" />
      <path d="M74 101l3 3 6-7" stroke="#EFF1E7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <rect x="96" y="95" width="120" height="6" rx="3" fill="#1C1F1C" opacity="0.7" />
      <rect x="96" y="106" width="80" height="4" rx="2" fill="#868c82" opacity="0.6" />

      <rect x="60" y="128" width="248" height="34" rx="10" fill="rgba(156, 90, 58,0.08)" />
      <circle cx="78" cy="145" r="8" fill="#9C5A3A" />
      <path d="M74 145h8M78 141v8" stroke="#EFF1E7" stroke-width="2" stroke-linecap="round" />
      <rect x="96" y="139" width="140" height="6" rx="3" fill="#1C1F1C" opacity="0.7" />
      <rect x="96" y="150" width="96" height="4" rx="2" fill="#868c82" opacity="0.6" />

      <rect x="60" y="172" width="248" height="34" rx="10" fill="rgba(176, 141, 70,0.1)" />
      <circle cx="78" cy="189" r="8" fill="#B08D46" />
      <rect x="74" y="187" width="8" height="4" rx="1.5" fill="#EFF1E7" />
      <rect x="96" y="183" width="110" height="6" rx="3" fill="#1C1F1C" opacity="0.7" />
      <rect x="96" y="194" width="70" height="4" rx="2" fill="#868c82" opacity="0.6" />

      <rect x="60" y="216" width="116" height="32" rx="9" fill="#24483D" />
      <rect x="74" y="228" width="50" height="6" rx="3" fill="#EFF1E7" />
      <rect x="192" y="216" width="116" height="32" rx="9" fill="rgba(36,72,61,0.08)" />
      <rect x="206" y="228" width="50" height="6" rx="3" fill="#24483D" opacity="0.6" />
    </g>

    <g filter="url(#admin-hero-shadow)" transform="translate(238 18) rotate(-8)">
      <rect width="84" height="84" rx="20" fill="#B08D46" />
      <path d="M24 42l12 12 24-26" stroke="#EFF1E7" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </svg>
</template>
