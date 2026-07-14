# `/api/auth/*`

## `POST /api/auth/login`

**Rate limit:** 5 / 15 min per IP (`login:${ip}`).

### Body (`loginSchema`)

| Field | Type | Rules |
|---|---|---|
| `email` | `string` | trimmed, lowercased, valid email, ≤254 chars |
| `password` | `string` | non-empty (no length check here — this is login, not registration) |

### Response — `200`

```ts
{ user: { id, name, email, role: 'USER' | 'ADMIN', subscribed: boolean } }
```

### Errors

| Code | When |
|---|---|
| `429` | Rate limit exceeded |
| `400` | Failed schema validation |
| `401` | Wrong email or password — same message either way, deliberately, to avoid confirming whether an email is registered |

### Behavior notes

- **Timing-safe against user enumeration.** Even when the email doesn't
  exist, the route still runs `bcrypt.compare` against a dummy hash before
  responding, so a nonexistent-email request takes the same time as a
  wrong-password one.
- On success, sets the `sidebar_session` cookie and — if this email has an
  anonymous (no-account) newsletter subscription already on file — attaches
  it to this account (`Subscriber.userId`), so a guest who subscribed
  before registering shows up as subscribed once they log in.

---

## `POST /api/auth/register`

**Rate limit:** 10 / hour per IP (`register:${ip}`).

### Body (`registerSchema`)

| Field | Type | Rules |
|---|---|---|
| `name` | `string` | trimmed, 1–80 chars |
| `email` | `string` | same as login |
| `password` | `string` | 8–128 chars |

### Response — `200`

Same shape as login's.

### Errors

| Code | When |
|---|---|
| `429` | Rate limit exceeded |
| `400` | Failed schema validation |
| `409` | Email already registered |

Same subscriber-claiming behavior as login on success.

---

## `POST /api/auth/logout`

No body, no auth required (logging out an already-logged-out session is a
no-op). Clears the session cookie.

### Response — `200`

```ts
{ ok: true }
```

---

## `GET /api/auth/me`

The canonical "who am I" check — `useAuth()`'s `fetchUser()` calls this and
nothing else. No auth required to *call* it; it just returns `null` if
there's no valid session.

### Response — `200`

```ts
{ user: { id, name, email, role, subscribed } | null }
```

### Behavior notes

Re-verifies the session against the database on every call (not just the
JWT signature) — if the account was deleted since the cookie was issued,
this clears the stale cookie as a side effect and returns `{ user: null }`
rather than throwing.

---

## `POST /api/auth/forgot-password`

**Rate limit:** 3 / 15 min per IP (`forgot:${ip}`) — deliberately the
tightest limit in the app, since this is the one route that sends an email
per request.

### Body (`forgotPasswordSchema`)

| Field | Type |
|---|---|
| `email` | `string` (same rules as login) |

### Response — `200`

```ts
{ ok: true }
```

**Always** — whether or not the email is registered, to prevent
user-enumeration via response differences. If the email doesn't exist, the
route returns immediately with no further side effects.

### Behavior notes

- On a real match: invalidates any previous unused reset tokens for that
  user, creates a new one-hour token, and emails a reset link to
  `${APP_URL}/reset-password?token=...`.
- The email send is wrapped in try/catch — if SMTP is down, the route still
  returns `{ ok: true }` (correct from a security standpoint: don't leak
  mail-delivery failures either) and logs the error server-side. If you're
  debugging "reset emails aren't arriving," check the server log, not the
  API response — the response will look successful either way.

---

## `POST /api/auth/reset-password`

**Rate limit:** 10 / hour per IP (`reset:${ip}`).

### Body (`resetPasswordSchema`)

| Field | Type | Rules |
|---|---|---|
| `token` | `string` | non-empty — from the reset-email link |
| `password` | `string` | 8–128 chars |

Note: password-confirmation matching is a client-only check
(`resetPasswordFormSchema`, with its extra `confirm` field) — the server
schema only ever sees `{ token, password }`.

### Response — `200`

```ts
{ ok: true }
```

### Errors

| Code | When |
|---|---|
| `429` | Rate limit exceeded |
| `400` | Bad schema, unknown token, already-used token, or expired (1 hour) token — each with a distinct Persian message |

Updates the password and marks the token used inside a single
`$transaction`, so a token can never be successfully replayed even under a
race.
