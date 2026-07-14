# `/api/newsletter/*` and `/api/admin/newsletter/*`

## `POST /api/newsletter/subscribe`

**Rate limit:** 5 / hour per IP (`subscribe:${ip}`).

### Body (`subscribeSchema`)

| Field | Type |
|---|---|
| `email` | `string` (trimmed, lowercased, valid, ≤254 chars) |

### Response — `200`

```ts
{ ok: true, alreadySubscribed: boolean }
```

### Errors

| Code | When |
|---|---|
| `429` | Rate limit exceeded |
| `400` | Invalid email |
| `500` | Unexpected DB error |

### Behavior notes

- **Works both logged-in and anonymous.** If called with a session and the
  submitted email matches that account's own login email, the subscription
  is linked to the account (`Subscriber.userId`). Submitting a *different*
  email while logged in (e.g. an admin checking someone else's status)
  creates/reuses that subscription without touching the caller's own
  account.
- **Idempotent under races.** Two near-simultaneous submits for the same
  email (two tabs, a retried request) can both pass the existence check
  before either insert commits; the resulting unique-constraint violation
  (`P2002` on `email`) is caught and treated as `alreadySubscribed: true`
  rather than surfacing a `500` to a request that, from the caller's
  perspective, succeeded.
- On a genuinely new subscription, sends a welcome email — wrapped in
  try/catch, so a mail failure never turns into a `500` for the subscribe
  action itself (the subscription is already committed by that point).

---

## `POST /api/newsletter/unsubscribe`

**Rate limit:** 5 / hour per IP (`unsubscribe:${ip}`).

Two independent auth paths, chosen by whether the body includes a `token`:

### Path 1 — token (no login required)

### Body (`unsubscribeTokenSchema`)

| Field | Type |
|---|---|
| `token` | `string`, non-empty |

This is the target of the "لغو عضویت" link inside every newsletter email
(see `app/pages/unsubscribe.vue`). The token is a signed JWT (see
"Unsubscribe tokens" below) that resolves to an email address — it's what
lets a subscriber who never created an account (`Subscriber.userId` is
nullable) unsubscribe at all, since they have no session to authenticate
with otherwise.

### Path 2 — session (the in-app modal)

No body (or a body without `token`). Requires a valid session
(`getVerifiedSessionUser`); deletes by `userId` instead of `email`.

### Response — `200` (either path)

```ts
{ ok: true }
```

### Errors

| Code | When |
|---|---|
| `429` | Rate limit exceeded |
| `400` | Token path: missing/invalid/expired token |
| `401` | Session path: not logged in |
| `500` | Unexpected DB error |

Both paths use `deleteMany` (not `delete`), so unsubscribing twice — a
second tab, a stale UI state — is a harmless no-op rather than a `404`/`500`.

---

## `POST /api/newsletter/unsubscribe-link`

The target of the `List-Unsubscribe`/`List-Unsubscribe-Post` headers (RFC
8058) set on every newsletter send — mailbox providers (Gmail, Outlook)
call this directly when someone taps the native "Unsubscribe" affordance
next to the sender name, with no cookies and no page render involved.

### Query params

| Param | Type |
|---|---|
| `token` | `string` — same signed unsubscribe token as above, passed as a query param since the mail provider POSTs to a fixed URL with a fixed body |

### Response — `200`

```ts
{ ok: true }
```

### Errors

`400` on a missing/invalid/expired token.

**Not rate-limited by IP** — deliberately. These requests come from
mail-provider infrastructure shared across every recipient of a given
mailbox provider, not from one person's browser, and the signed token is
already the access control (nothing useful to brute-force without it).

---

## Unsubscribe tokens

Both unsubscribe routes above rely on
[`server/utils/unsubscribeToken.ts`](../../server/utils/unsubscribeToken.ts):

```ts
createUnsubscribeToken(event, email: string): Promise<string>       // sign
verifyUnsubscribeToken(event, token: string): Promise<string | null> // verify → email, or null
```

Signed JWTs (HS256, same `authSecret` as the session cookie), payload
`{ purpose: "unsubscribe", email }`. **Deliberately never expire** — an
unsubscribe link that stops working after N days would mean someone
digging an old newsletter out of their inbox six months later couldn't opt
out, which defeats the point. A fresh token is minted per subscriber on
every send, so this isn't "one token forever" in practice, but an old one
is never invalidated either.

---

## `GET /api/admin/newsletter/preview` — admin only

No params. Returns everything the send screen needs in one call.

### Response — `200`

```ts
{
  links: { id, title, url, body, publishedAt, categories: {id,label}[], submittedBy: {name} | null }[] // PUBLISHED, notifiedAt: null
  subscriberCount: number
  lastSend: { sentAt, recipients, linkCount } | null
}
```

`links` is exactly the candidate pool `POST /api/admin/newsletter/send`
will accept `linkIds` from — a published link that's already been sent
(`notifiedAt` set) won't appear here or be sendable again.

---

## `POST /api/admin/newsletter/send` — admin only

Sends the next newsletter issue to every current subscriber.

### Body

```ts
{ linkIds: string[] } // 1–5 ids, must all currently be PUBLISHED and notifiedAt: null
```

### Response — `200`

```ts
{ ok: true, sent: number, failed: number, linkCount: number }
```

### Errors

| Code | When |
|---|---|
| `401` / `403` | Not an admin |
| `400` | Empty `linkIds`, more than 5, or one/more aren't valid PUBLISHED+unsent links |
| `400` | Zero subscribers on file |
| `502` | Every single send attempt failed — treated as an infrastructure problem (bad SMTP creds, provider outage), not a per-recipient failure; see below |

### Behavior notes

- **Sends individually per subscriber**, each with its own freshly-signed
  unsubscribe token and `List-Unsubscribe`/`List-Unsubscribe-Post` headers
  (RFC 8058 one-click), via the pooled SMTP transporter in
  [`mailer.ts`](../../server/utils/mailer.ts). A per-recipient failure is
  logged and counted in `failed`; it does **not** abort the run for the
  remaining subscribers.
- **All-or-nothing bookkeeping.** The selected links are only marked
  `notifiedAt` (and a `NewsletterSend` row only created) if *at least one*
  send succeeded. If every single send fails, the route throws `502`
  instead — because marking the links as notified here would filter them
  out of `notifiedAt: null` forever, silently losing that issue with no way
  to retry once the actual mail problem is fixed. A partial failure (some
  subscribers bounced, most got it) still records normally; `failed` in the
  response tells you how many didn't.
- `MAX_LINKS = 5` per issue is enforced server-side, matching the newsletter
  UI's own cap — this isn't just a UI nicety, it'll reject a raw API call
  with 6+ ids too.
