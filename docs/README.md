# Booltan (بولتن) — developer docs

| Section | What's there |
|---|---|
| [`components/`](./components/README.md) | Every Vue component — props, emits, slots, usage examples |
| [`composables/`](./composables/README.md) | Every composable in `app/composables/` |
| [`api/`](./api/README.md) | Every route in `server/api/` — request/response shapes, auth, rate limits |

Start with each section's `README.md` — it covers the conventions shared
across everything in that section (auto-import naming, auth tiers,
validation, etc.) so the individual pages don't have to repeat them.

If you're onboarding fresh: read `api/README.md` and
`composables/README.md` first (the data layer), then `components/README.md`
(what's built on top of it) — most components are thin presentation over
a composable or a direct API call, so understanding the data layer first
makes the component docs click faster.
