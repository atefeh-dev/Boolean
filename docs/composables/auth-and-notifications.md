# `useAuth`, `useNotifications`, `useNewsletterGuestCookie`

## `useAuth()`

The single source of truth for "who's logged in." Session state itself
lives server-side in an httpOnly cookie (see `api/auth.md`) — this
composable only ever holds the public, non-sensitive user shape the server
hands back from `/api/auth/me`.

### Returns

| Key | Type | Notes |
|---|---|---|
| `user` | `Ref<AuthUser \| null>` | `{ id, name, email, role: 'USER' \| 'ADMIN', subscribed }` |
| `isLoggedIn` | `ComputedRef<boolean>` | `!!user.value` |
| `initialized` | `Ref<boolean>` | Flips true after the first `fetchUser()` resolves (success or failure) — check this, not `user`, if you need to tell "still loading" apart from "confirmed logged out" |
| `fetchUser()` | `() => Promise<void>` | Hits `GET /api/auth/me`, sets `user` (or `null` on failure) |
| `ensureFetched()` | `() => Promise<void>` | Calls `fetchUser()` only if `!initialized.value` — safe to call from every page/layout without refetching on every navigation |
| `login(email, password)` | `() => Promise<AuthUser \| null>` | Throws a plain `Error` with a Persian message on failure — catch it and show `err.message` directly |
| `register(name, email, password)` | `() => Promise<AuthUser \| null>` | Same error contract as `login` |
| `logout()` | `() => Promise<void>` | Clears `user` even if the server call fails (`finally` block) |
| `markSubscribed()` | `() => void` | Optimistically flips `user.subscribed = true` — see below |
| `markUnsubscribed()` | `() => void` | Counterpart, flips it back to `false` |

### Why `markSubscribed`/`markUnsubscribed` exist

`login`/`register`/`fetchUser` all refetch from `/api/auth/me` rather than
trusting an echoed user object in a response — deliberately, per a comment
in the source, so `subscribed` has exactly one place it's computed
server-side instead of two endpoints potentially drifting out of sync.
`markSubscribed`/`markUnsubscribed` are the one intentional exception: after
a newsletter subscribe/unsubscribe action, they let the nav update
instantly without waiting on a full round trip. Only call them right after
the corresponding API call actually succeeds — they don't verify anything
themselves.

### Example

```vue
<script setup lang="ts">
const { user, isLoggedIn, login } = useAuth()

async function onSubmit() {
  try {
    await login(email.value, password.value)
    await navigateTo('/')
  } catch (err) {
    serverError.value = (err as Error).message
  }
}
</script>
```

### Server-side note

`fetchUser()` picks `useRequestFetch()` over plain `$fetch` when running on
the server (`import.meta.server`), so the incoming request's cookies get
forwarded to `/api/auth/me` during SSR. If you're calling `useAuth()`
inside a server-only context of your own, keep that distinction in mind —
plain `$fetch` on the server won't carry the visitor's session cookie.

---

## `useNotifications()`

Backs `NotificationsBell`. Notifications aren't a separate feed you write
to — they're derived server-side from link status changes (see
`api/notifications.md`), and "read" state is a server-persisted watermark,
not local storage, so it stays consistent across devices.

### Returns

| Key | Type | Notes |
|---|---|---|
| `notifications` | `Ref<NotificationItem[]>` | `{ id, type, title, meta?, href, createdAt, read }` |
| `unreadCount` | `Ref<number>` | |
| `loading` | `Ref<boolean>` | |
| `error` | `Ref<boolean>` | Set on fetch failure; check `console.error` for the real cause during development |
| `ringing` | `Ref<boolean>` | True for ~1.4s when `unreadCount` increases — drives the bell's ring animation |
| `fetchNotifications({ force? })` | `(opts?) => Promise<void>` | No-ops if already fetched for the current user unless `force: true`; no-ops entirely if not logged in |
| `markAllRead()` | `() => Promise<void>` | Zeroes `unreadCount` locally, persists the watermark via `POST /api/notifications/read`. Deliberately does **not** mutate individual items' `read` flags, so an already-open panel keeps showing which ones were new |
| `dismissNotification(id)` | `(id: string) => Promise<void>` | Optimistic remove, rolled back if `POST /api/notifications/dismiss` fails |
| `reset()` | `() => void` | Clears all state — call on logout |

### Example

```vue
<script setup lang="ts">
const { notifications, unreadCount, fetchNotifications, markAllRead } = useNotifications()

async function openPanel() {
  await fetchNotifications({ force: true })
  markAllRead()
}
</script>
```

If you're building anything that shows notification state outside
`NotificationsBell`, reuse this composable rather than fetching
`/api/notifications` directly — the `ringing` bell-shake behavior and the
shared `useState` keys depend on going through here so state stays in sync
between the public-site and admin bells.

---

## `useNewsletterGuestCookie()`

```ts
function useNewsletterGuestCookie(): Ref<"1" | undefined>
```

A thin wrapper around `useCookie` for one specific cookie
(`booltan_subscribed`), used to track newsletter subscription for visitors
without an account. It exists as a composable — rather than each call site
declaring its own `useCookie(...)` — purely so every place that reads or
writes it (the homepage subscribe form, the unsubscribe modal) agrees on
the exact same key and options; two independently-typed `useCookie` calls
could silently drift.

### Example

```ts
const guestSubscribedCookie = useNewsletterGuestCookie()

// After a successful guest subscribe:
guestSubscribedCookie.value = "1"

// After unsubscribing:
guestSubscribedCookie.value = undefined
```

Logged-in users never touch this — their subscription status comes from
`useAuth().user.value.subscribed` instead. Don't read this cookie to decide
a logged-in user's subscription state.
