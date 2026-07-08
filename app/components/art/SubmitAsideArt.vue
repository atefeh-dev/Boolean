<template>
  <svg
            class="submit-aside__art"
            viewBox="0 0 420 360"
            fill="none"
            role="img"
            aria-label="هواپیمای کاغذی که لینکی را به صندوق ورودی می‌فرستد"
          >
            <defs>
              <filter
                id="soft-blur"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="22" />
              </filter>
            </defs>
            <circle
              cx="300"
              cy="90"
              r="95"
              fill="#E8DDCA"
              opacity="0.55"
              filter="url(#soft-blur)"
            />
            <circle
              cx="115"
              cy="265"
              r="115"
              fill="#D3A240"
              opacity="0.24"
              filter="url(#soft-blur)"
            />

            <!-- curved flight path -->
            <path
              d="M58 296 C120 250 130 150 210 142 C282 135 300 96 332 72"
              stroke="rgba(36,72,61,0.28)"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-dasharray="1 10"
            />

            <!-- inbox tray (destination) bottom-left -->
            <g transform="translate(34,250)">
              <rect width="128" height="78" rx="16" fill="#24483D" />
              <path
                d="M14 30 H40 L50 48 H78 L88 30 H114 V60 a8 8 0 0 1 -8 8 H22 a8 8 0 0 1 -8 -8 Z"
                fill="#31584B"
              />
              <rect
                x="40"
                y="-10"
                width="48"
                height="34"
                rx="8"
                fill="#FFFDF8"
              />
              <rect
                x="50"
                y="0"
                width="28"
                height="5"
                rx="2.5"
                fill="#958878"
              />
              <rect
                x="50"
                y="10"
                width="20"
                height="5"
                rx="2.5"
                fill="#D8CBB7"
              />
            </g>

            <!-- small link card mid-flight -->
            <g transform="translate(176,150) rotate(-8)">
              <rect
                width="96"
                height="40"
                rx="11"
                fill="#FFFDF8"
                stroke="#E0D2BC"
              />
              <circle cx="22" cy="20" r="9" fill="#D3A240" />
              <rect x="38" y="13" width="44" height="6" rx="3" fill="#24483D" />
              <rect
                x="38"
                y="25"
                width="30"
                height="5"
                rx="2.5"
                fill="#958878"
              />
            </g>

            <!-- paper plane (arriving / top-right) -->
            <g transform="translate(296,40) rotate(8)">
              <path d="M2 30 L96 2 L60 92 L46 58 Z" fill="#FFFDF8" />
              <path d="M46 58 L96 2 L60 92 Z" fill="#D8CBB7" />
              <path
                d="M46 58 L96 2"
                stroke="#958878"
                stroke-width="2"
                stroke-linecap="round"
              />
            </g>

            <!-- sparkle accents -->
            <path
              d="M150 70 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z"
              fill="#B85D3E"
              opacity="0.85"
            />
            <circle cx="250" cy="250" r="5" fill="#D3A240" />
          </svg>
</template>
