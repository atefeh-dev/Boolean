<template>
  <svg
          class="page-hero__art"
          viewBox="0 0 420 360"
          fill="none"
          role="img"
          aria-label="تقویم و خط زمانی شماره‌های گذشته"
        >
          <defs>
            <filter id="soft-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="22" />
            </filter>
          </defs>
          <circle
            cx="300"
            cy="90"
            r="95"
            fill="#DCDFD5"
            opacity="0.35"
            filter="url(#soft-blur)"
          />
          <circle
            cx="115"
            cy="280"
            r="115"
            fill="#B08D46"
            opacity="0.26"
            filter="url(#soft-blur)"
          />

          <!-- vertical dashed timeline -->
          <path
            d="M96 70 L96 320"
            stroke="rgba(36,72,61,0.28)"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-dasharray="1 9"
          />

          <!-- timeline node 1 -->
          <circle cx="96" cy="118" r="7" fill="#B08D46" />
          <g transform="translate(118,92)">
            <rect width="138" height="58" rx="13" fill="#FFFFFF" stroke="#D7DBCD" />
            <rect x="16" y="16" width="70" height="7" rx="3.5" fill="#24483D" />
            <rect x="16" y="32" width="104" height="6" rx="3" fill="#868c82" />
          </g>

          <!-- timeline node 2 -->
          <circle cx="96" cy="206" r="7" fill="#9C5A3A" />
          <g transform="translate(118,180)">
            <rect width="120" height="56" rx="13" fill="#FFFFFF" stroke="#D7DBCD" />
            <rect x="16" y="15" width="58" height="7" rx="3.5" fill="#9C5A3A" />
            <rect x="16" y="31" width="88" height="6" rx="3" fill="#868c82" />
          </g>

          <!-- timeline node 3 -->
          <circle cx="96" cy="290" r="7" fill="#31584B" />
          <g transform="translate(118,264)">
            <rect width="128" height="54" rx="13" fill="#FFFFFF" stroke="#D7DBCD" />
            <rect x="16" y="15" width="64" height="7" rx="3.5" fill="#24483D" />
            <rect x="16" y="30" width="96" height="6" rx="3" fill="#CFD4C2" />
          </g>

          <!-- calendar card -->
          <g transform="translate(244,34) rotate(4)">
            <rect width="150" height="140" rx="18" fill="#FFFFFF" stroke="#D7DBCD" />
            <rect width="150" height="40" rx="18" fill="#24483D" />
            <rect y="22" width="150" height="18" fill="#24483D" />
            <rect x="34" y="-8" width="10" height="22" rx="5" fill="#9C5A3A" />
            <rect x="106" y="-8" width="10" height="22" rx="5" fill="#9C5A3A" />
            <rect x="18" y="14" width="48" height="9" rx="4.5" fill="#E9D8C8" />
            <!-- day grid -->
            <g fill="rgba(36,72,61,0.24)">
              <circle cx="28" cy="64" r="5" />
              <circle cx="52" cy="64" r="5" />
              <circle cx="76" cy="64" r="5" />
              <circle cx="100" cy="64" r="5" />
              <circle cx="124" cy="64" r="5" />
              <circle cx="28" cy="90" r="5" />
              <circle cx="52" cy="90" r="5" />
              <circle cx="100" cy="90" r="5" />
              <circle cx="124" cy="90" r="5" />
              <circle cx="28" cy="116" r="5" />
              <circle cx="52" cy="116" r="5" />
              <circle cx="76" cy="116" r="5" />
              <circle cx="124" cy="116" r="5" />
            </g>
            <!-- highlighted day -->
            <circle cx="76" cy="90" r="10" fill="#9C5A3A" />
          </g>
        </svg>
</template>
