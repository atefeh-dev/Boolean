<template>
  <svg
          class="page-hero__art"
          viewBox="0 0 420 360"
          fill="none"
          role="img"
          aria-label="پوشه‌های موضوعی و برچسب‌های دسته‌بندی"
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
            fill="#E8DDCA"
            opacity="0.35"
            filter="url(#soft-blur)"
          />
          <circle
            cx="115"
            cy="280"
            r="115"
            fill="#D3A240"
            opacity="0.26"
            filter="url(#soft-blur)"
          />

          <!-- back folder -->
          <g transform="translate(64,118) rotate(-8)">
            <path
              d="M0 22 a16 16 0 0 1 16 -16 H58 l14 16 H170 a16 16 0 0 1 16 16 V150 a16 16 0 0 1 -16 16 H16 a16 16 0 0 1 -16 -16 Z"
              fill="#24483D"
            />
          </g>

          <!-- middle folder -->
          <g transform="translate(76,108) rotate(-2)">
            <path
              d="M0 22 a16 16 0 0 1 16 -16 H58 l14 16 H170 a16 16 0 0 1 16 16 V150 a16 16 0 0 1 -16 16 H16 a16 16 0 0 1 -16 -16 Z"
              fill="#31584B"
            />
            <rect x="22" y="44" width="60" height="8" rx="4" fill="#F3DFD1" />
          </g>

          <!-- front folder (open, with tags) -->
          <g transform="translate(58,150) rotate(6)">
            <path
              d="M0 24 a16 16 0 0 1 16 -16 H62 l14 16 H188 a16 16 0 0 1 16 16 V150 a16 16 0 0 1 -16 16 H16 a16 16 0 0 1 -16 -16 Z"
              fill="#FFFDF8"
            />
            <!-- topic tag chips -->
            <g transform="translate(22,40)">
              <rect width="74" height="22" rx="11" fill="#B85D3E" />
              <circle cx="16" cy="11" r="5" fill="#FFFDF8" />
              <rect x="28" y="8" width="34" height="6" rx="3" fill="#FFFDF8" />
            </g>
            <g transform="translate(106,40)">
              <rect width="64" height="22" rx="11" fill="#24483D" />
              <circle cx="15" cy="11" r="5" fill="#D3A240" />
              <rect x="26" y="8" width="28" height="6" rx="3" fill="#F3DFD1" />
            </g>
            <g transform="translate(22,76)">
              <rect width="58" height="22" rx="11" fill="#F2EADB" />
              <circle cx="15" cy="11" r="5" fill="#31584B" />
              <rect x="26" y="8" width="24" height="6" rx="3" fill="#958878" />
            </g>
            <g transform="translate(90,76)">
              <rect width="80" height="22" rx="11" fill="#F2EADB" />
              <circle cx="15" cy="11" r="5" fill="#B85D3E" />
              <rect x="26" y="8" width="44" height="6" rx="3" fill="#958878" />
            </g>
          </g>
        </svg>
</template>
