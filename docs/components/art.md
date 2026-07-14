# `art/` — decorative illustrations

Five prop-less, template-only SVG illustrations, each tied to a specific
page hero. No `<script>` block in any of them — no props, no logic, nothing
to configure.

| Component | Used on |
|---|---|
| `HomeHeroArt` | Home page hero |
| `ArchiveHeroArt` | Archive page hero (via `PageHero`'s `art-component` prop) |
| `CategoriesHeroArt` | Categories page hero (via `PageHero`) |
| `AuthPanelArt` | (reserved for) auth panel — currently `AuthPanel`'s illustration is inline SVG in that component rather than a separate `art/` piece; this file exists for a future split |
| `SubmitAsideArt` | Submit page, imported directly inside `SubmitForm` |

## Usage

Most of these are handed to `PageHero` as a component reference, not
rendered inline:

```vue
<script setup lang="ts">
import HomeHeroArt from '~/components/art/HomeHeroArt.vue'
</script>

<template>
  <SharedPageHero
    eyebrow="خانه"
    title="..."
    description="..."
    :art-component="HomeHeroArt"
  />
</template>
```

`SubmitAsideArt` is the exception — `SubmitForm` imports and renders it
directly rather than going through `PageHero`, since the submit page's
layout puts the art beside the form rather than in a hero band.

## Adding a new one

Since there's no prop surface at all, "customizing" one of these means
editing the SVG markup directly rather than passing configuration — these
are illustrations, not templated components. If a new page needs a hero
image, add a new file here following the same shape (a bare `<template>`
with an inline `<svg>`, no `<script>` block) and wire it into that page's
`PageHero` usage.
