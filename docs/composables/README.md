# Composable documentation

Reference docs for every composable in `app/composables/`. Same accuracy
bar as the component docs — every signature here is read straight from the
source, not reconstructed from memory.

| Doc | Covers |
|---|---|
| [`auth-and-notifications.md`](./auth-and-notifications.md) | `useAuth`, `useNotifications`, `useNewsletterGuestCookie` — session state and the things that depend on it |
| [`forms.md`](./forms.md) | `useZodForm`, `useToast` — the form-validation wrapper and the global toast |
| [`page-data.md`](./page-data.md) | `useLinksData`, `useHomeLinks`, `useArchiveData`, `useCategoryData` — the static-fallback-then-live-data pattern used by every content page |

## Conventions

**Auto-import, same as components.** Everything in `app/composables/` is
auto-imported by Nuxt — there's no `import { useAuth } from '...'` anywhere
in the app, and you don't need one either.

**Shared reactive state via `useState`, not module-level `ref`.** `useAuth`,
`useNotifications`, and the toast/newsletter-cookie composables all use
Nuxt's `useState(key, init)` (or, for the toast, a plain module-scope `ref`
— see `forms.md` for why that one's different) so the same value is shared
across every component that calls the composable, and is correctly
per-request on the server (no state leaking between two different users'
SSR renders) rather than a naive global.

**The static-fallback pattern.** `useHomeLinks`, `useArchiveData`, and
`useCategoryData` all follow the same shape: try a real API fetch, and if
it fails *or* comes back with zero rows, fall back to the bundled static
JSON in `data/`. This means the site never shows a broken empty page — even
with no database at all, `npm run dev` renders real-looking content. See
`page-data.md` for the exact null-vs-empty-vs-real logic, since it's easy
to get subtly wrong if you're adding a new composable in the same family.

**These aren't Pinia stores.** There's no store library in this app —
"global state" is just `useState` composables. If a new piece of shared
state doesn't fit naturally into an existing composable, the pattern is a
new small composable following the same shape, not a new dependency.
