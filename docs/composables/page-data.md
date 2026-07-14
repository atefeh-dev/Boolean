# `useLinksData`, `useHomeLinks`, `useArchiveData`, `useCategoryData`

Four composables that all solve the same problem for a different page: get
real published-link data from the API, but never show a broken or
empty-looking page if the database isn't reachable or hasn't been seeded
yet. If you're adding a new content page that needs the same treatment,
copy the pattern from the one closest to your case rather than inventing a
fifth variant.

## `useLinksData()`

The base case — no fetch at all, just the bundled static demo content from
`data/links.json`, typed as `LinksData`. Every other composable in this
group uses this as its fallback source.

```ts
function useLinksData(): {
  categories: Category[]
  issues: Issue[]
  categoryMap: ComputedRef<Record<string, string>>
}
```

Synchronous — no `await`, no loading state, because it never does network
I/O.

---

## `useHomeLinks()`

Powers the homepage feed. Async (must be `await`ed, or called inside a
context where a top-level `await` in `<script setup>` is valid).

```ts
async function useHomeLinks(): Promise<{
  issues: ComputedRef<Issue[]>
  categoryMap: ComputedRef<Record<string, string>>
  hasRealLinks: ComputedRef<boolean>
}>
```

Fetches `GET /api/links?take=50` and `GET /api/categories` in parallel,
groups links by Persian calendar day into `Issue[]`. Falls back to
`useLinksData()`'s static content when:
- the fetch throws (network/API error), **or**
- it succeeds but returns zero links (DB has nothing published yet)

`hasRealLinks` tells you which case you're in, if a caller needs to know
(e.g. to hide a "browsing demo content" notice once real data shows up).

**Cache behavior is deliberately non-default.** `getCachedData` reuses the
SSR payload only during hydration (so the client's first render matches
the server, avoiding a hydration mismatch) and bypasses Nuxt's cache for
every subsequent client-side navigation. Without this, Nuxt would cache the
first SSR result indefinitely — meaning a newly-approved link wouldn't
appear on the homepage until a hard refresh. If you copy this composable's
shape for a new page, copy this `getCachedData` function too, not the
simpler "always fresh" version `useArchiveData`/`useCategoryData` use — see
below for why those two get away with the simpler version.

```vue
<script setup lang="ts">
const { issues, categoryMap } = await useHomeLinks()
</script>

<template>
  <IssuesIssueDay v-for="issue in issues" :key="issue.date" :issue="issue" :category-map="categoryMap" />
</template>
```

---

## `useArchiveData()`

Powers the archive page. Same overall shape as `useHomeLinks`, adapted for
a full history rather than a recent feed:

```ts
async function useArchiveData(): Promise<{
  archiveMonths: ComputedRef<ArchiveMonth[]>
  categories: ComputedRef<ApiCategory[]>
}>
```

Fetches `GET /api/links?take=500` (the whole published history, up to
500) and `GET /api/categories`, groups into day-issues then further groups
those into Persian calendar months, each issue capped to a 3-link preview
(`remainingCount` holds the rest). Falls back to static `archiveMonths`
data on fetch failure or empty result, same null-vs-empty distinction as
`useHomeLinks`.

Uses the simpler `getCachedData: () => undefined` (always refetch, no
hydration-matching dance) rather than `useHomeLinks`'s conditional version
— the archive page is browsed less frequently and isn't the "does my
newly-approved link show up instantly" surface `useHomeLinks` had to solve
for, so the extra complexity isn't needed here.

---

## `useCategoryData()`

Powers the categories page (both the card grid and the per-category detail
view).

```ts
async function useCategoryData(): Promise<{
  categoryCards: ComputedRef<CategoryCard[]>       // { id, label, count }
  categorySections: ComputedRef<CategorySection[]> // { id, label, count, links }
}>
```

Same fetch (`/api/links?take=500` + `/api/categories`) and the same
null-vs-empty fallback logic as the other two, expressed here as a
`hasRealData` computed rather than inline in each derived value. Notably,
this one **filters out zero-count categories** from `categoryCards` (a
category no published link currently uses won't show a card) — if you need
every category regardless of count, use `categoriesRes.categories` from
`GET /api/categories` directly instead of this composable.

### The shared null-vs-empty contract

All three async composables treat the API result as one of three states,
and it's worth internalizing this if you're extending any of them:

| Fetch result | Meaning | Behavior |
|---|---|---|
| Fetch throws | Network/API error | Fall back to static content |
| `{ links: [] }` | DB has zero published links (a genuinely empty, freshly-seeded install) | Fall back to static content |
| `{ links: [...] }` | Real data exists | Use it, ignore static content entirely |

The fetch function always returns `null` (not `[]`) on a caught error
specifically so the composable can tell "fetch failed" apart from
"database is legitimately empty" — both currently resolve to the same
static-fallback behavior, but keeping them distinguishable in the data
layer means a future caller (e.g. an admin-only "you're viewing demo
content because the API is down" banner) doesn't have to guess which case
it's in.
