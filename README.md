# Booltan (بولتن) — Nuxt

Persian RTL redesign of **بولتن**, migrated from static HTML/CSS into a Nuxt 4 application.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
sidebar-fa-nuxt/
├── app/
│   ├── app.vue                 # Root shell + global toast
│   ├── assets/css/             # Modular styles migrated from HTML
│   │   ├── main.css            # Entry point
│   │   ├── shared/             # Tokens, base, layout (nav, footer, breadcrumb)
│   │   ├── components/         # Reusable UI blocks (hero, issues, page-hero)
│   │   └── pages/              # Page-specific styles (archives, categories, submit)
│   ├── components/
│   │   ├── art/                # Hero SVG illustrations
│   │   ├── archive/            # Archive filters + issue cards
│   │   ├── categories/         # Category grid + detail views
│   │   ├── home/               # Homepage hero
│   │   ├── issues/             # Daily issue + link rows
│   │   ├── layout/             # Nav, footer, section bar, logo
│   │   ├── shared/             # Cross-page components (PageHero)
│   │   ├── submit/             # Submit link form
│   │   └── ui/                 # Toast, icons
│   ├── composables/            # useToast, useLinksData
│   ├── layouts/default.vue     # Shared page wrapper
│   ├── pages/                  # File-based routes
│   ├── types/                  # TypeScript interfaces
│   └── utils/                  # Helpers (Persian numerals)
├── data/
│   ├── links.json              # Issues + categories (homepage feed)
│   └── content.ts              # Archive, category detail, submit metadata
└── public/                     # Static assets (icons, placeholders)
```

## Routes

| Route | Page |
|-------|------|
| `/` | Homepage with hero + recent issues |
| `/archives` | Searchable archive with category filters |
| `/categories` | Category grid + detail drill-down |
| `/submit` | Link submission form |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run generate` — static site generation

## Source

Original static prototype: `../sidebar-fa-redesign-refined/`
# Boolean
