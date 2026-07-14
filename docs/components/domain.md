# Domain content components

Page-specific components — each one is tied to a particular page's content
shape (`app/types/links.ts`) rather than being reusable across contexts. They
live in `archive/`, `categories/`, `issues/`, `submit/`, and `home/`.

## `ArchiveIssue` → `<ArchiveArchiveIssue>`

One month's worth of archive entries: a single issue card (weekday, date,
category tags, a few preview links, "+N more").

### Props

| Prop | Type |
|---|---|
| `issue` | `ArchiveIssue` (from `app/types/links.ts`) |

```ts
interface ArchiveIssue {
  weekday: string
  dateShort: string
  categories: string[]
  previewLinks: ArchivePreviewLink[] // { rank: number; title: string; url: string; domain: string }
  remainingCount: number
}
```

```vue
<ArchiveArchiveIssue v-for="issue in month.issues" :key="issue.dateShort" :issue="issue" />
```

---

## `ArchiveControls` → `<ArchiveArchiveControls>`

The search box + category chip row above the archive list. Supports
`v-model` on two separate props (`query` and `activeCategory`).

### Props

| Prop | Type | Notes |
|---|---|---|
| `query` | `string` | Current search text |
| `activeCategory` | `string` | Currently selected category id |
| `chips` | `{ id: string; label: string }[]` | Category filter options |

### Emits (v-model)

| Event | Payload |
|---|---|
| `update:query` | `string` |
| `update:activeCategory` | `string` |

### Example

```vue
<ArchiveArchiveControls
  v-model:query="searchQuery"
  v-model:active-category="activeCategory"
  :chips="categoryChips"
/>
```

Note: the component keeps its own internal `query` ref (initialized from the
prop, kept in sync via a `watch`) rather than emitting on every keystroke
straight from the prop — if you need to react to search input elsewhere,
watch the parent's `v-model:query` binding, not something on this component
directly.

---

## `CategoryGrid` → `<CategoriesCategoryGrid>`

The grid of category cards on the categories landing page.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `cards` | `{ id: string; label: string; count: number }[]` | falls back to `data/content.ts`'s static `categoryCards` | Optional — omit to use the static fallback list; pass real data once category counts are fetched from the API |

### Emits

| Event | Payload |
|---|---|
| `select` | `categoryId: string` |

```vue
<CategoriesCategoryGrid :cards="liveCategoryCards" @select="goToCategory" />
```

---

## `CategoryDetail` → `<CategoriesCategoryDetail>`

The link listing for a single selected category (or "all"), grouped into
sections.

### Props

| Prop | Type |
|---|---|
| `sections` | `CategorySection[]` |
| `activeCategory` | `string` |

```ts
interface CategorySection {
  id: string
  label: string
  count: number
  links: { domain: string; title: string; url: string; date: string }[]
}
```

---

## `IssueDay` → `<IssuesIssueDay>`

One day's newsletter issue on the home/issues feed — weekday/date header
plus its `LinkRow`s.

### Props

| Prop | Type |
|---|---|
| `issue` | `Issue` — `{ weekday: string; date: string; links: LinkItem[] }` |
| `categoryMap` | `Record<string, string>` — category id → display label |

`issue.links` only carries category **ids** (`LinkItem.categories: string[]`);
`categoryMap` is what turns those ids into the labels actually shown, so it
must contain an entry for every category id referenced by every link in
`issue`, or that link's category tag renders blank.

```vue
<IssuesIssueDay v-for="issue in issues" :key="issue.date" :issue="issue" :category-map="categoryMap" />
```

---

## `LinkRow` → `<IssuesLinkRow>`

A single link entry (title, description, domain, category tags). Used
directly by `IssueDay`, but can be used standalone anywhere a single link
needs the same treatment.

### Props

| Prop | Type |
|---|---|
| `link` | `LinkItem` — `{ url; domain; title; description; categories: string[] }` |
| `categoryMap` | `Record<string, string>` |

Same `categoryMap` contract as `IssueDay` above — it must cover every id in
`link.categories`.

---

## `SubmitForm` → `<SubmitSubmitForm>`

The full "submit a link" form: validation (via `useZodForm` +
`submitLinkSchema`), category checkboxes (max 3, enforced client-side),
character counters, submit/success/error states.

### Props / Emits

None — entirely self-contained. It fetches its own category list
(`GET /api/categories`, falling back to a static list from `data/content.ts`
if that fails) and posts directly to `POST /api/links` on submit.

```vue
<SubmitSubmitForm />
```

If you need to know when a submission succeeds (e.g. to track an event),
there's currently no emit for that — the component just flips its own
internal `submitted` ref to show a success state. Add an emit if a consumer
needs to react to it, rather than reaching into the component's internals.

---

## `HomeHero` → `<HomeHomeHero>`

The homepage hero: headline plus the newsletter-subscribe email form,
including its own success/already-subscribed/error states and guest-cookie
handling.

### Props / Emits

None — self-contained, same shape as `SubmitForm`. Reads/writes auth state
via `useAuth()` and the guest subscription cookie via
`useNewsletterGuestCookie()`, and posts to `POST /api/newsletter/subscribe`.

```vue
<HomeHomeHero />
```

Notable behavior worth knowing before touching this component: if a logged-in
user submits an email that **isn't** their own account's email (e.g. an admin
checking someone else's subscription status), it deliberately does *not*
update that admin's own `subscribed` badge or guest cookie — only a
self-submission does. Keep that distinction in mind if you're modifying the
submit handler; it's intentional, not a bug.
