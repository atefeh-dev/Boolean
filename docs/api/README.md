# API documentation

Reference docs for every route in `server/api/`. Grouped by resource,
mirroring the components/composables docs in structure and accuracy bar —
every request/response shape, status code, and validation rule here is read
from the actual route handler and its Zod schema, not inferred.

| Doc | Covers |
|---|---|
| [`auth.md`](./auth.md) | `/api/auth/*` — login, register, session, password reset |
| [`newsletter.md`](./newsletter.md) | `/api/newsletter/*` and `/api/admin/newsletter/*` — subscribe, unsubscribe, sending |
| [`links.md`](./links.md) | `/api/links*` and `/api/admin/links*` — public feed, submission, moderation |
| [`categories.md`](./categories.md) | `/api/categories` |
| [`notifications.md`](./notifications.md) | `/api/notifications*` |
| [`admin-stats.md`](./admin-stats.md) | `/api/admin/analytics`, `/api/admin/overview`, `/api/admin/subscribers*` |

## Conventions that apply to every endpoint

**Framework.** These are [Nitro](https://nitro.build/) (Nuxt's server
engine) file-based routes — `server/api/links.post.ts` is `POST /api/links`,
`server/api/admin/links/[id].patch.ts` is `PATCH /api/admin/links/:id`. All
the shared helpers below (`prisma`, `createError`, `getQuery`, `sendMail`,
`requireAdmin`, ...) are auto-imported inside `server/`, same as
`app/composables` is on the client side — you won't see explicit imports
for them in most routes.

**Auth model — three tiers.**
- **Public** — no session needed (`/api/categories`, `/api/links` (GET),
  `/api/newsletter/subscribe`).
- **Logged-in** — `getVerifiedSessionUser(event)`, which re-checks the
  session against the DB (not just a valid JWT signature) so a deleted
  account or a stale dev-DB reset can't ride an old cookie. Returns `null`
  (never throws) — routes then throw their own `401` if it's null.
- **Admin-only** — `await requireAdmin(event)` at the top of the handler.
  Throws `401` if not logged in, `403` if logged in but not an `ADMIN`.

  There's also the cheaper `getSessionUser(event)` (JWT-verify only, no DB
  round trip) used where a route just needs to *read* who's logged in
  without any write depending on the account still existing (e.g.
  `/api/auth/me`, `/api/notifications`) — don't reach for the DB-checking
  version everywhere by default; it's an extra query per request.

**Session cookie.** `sidebar_session`, `httpOnly`, `sameSite: "strict"`
(zero CSRF exposure by construction — it's never sent on a cross-site
request at all), `secure` in production, a signed JWT (HS256, `jose`) valid
30 days. Set/read/cleared only via `server/utils/auth.ts` — there's no
reason to touch the cookie directly from a route handler.

**Validation.** Every route that accepts a body validates it against a Zod
schema from `shared/validation/schemas.ts` — the *same* schema the client
forms use (wrapped in `toTypedSchema()` there for vee-validate). The
server-side call is always
[`validateBody(event, schema)`](../../server/utils/validateBody.ts), which
throws a `400` with the first Zod error's message on failure. Client-side
validation is UX only — `validateBody` on the server is the actual
boundary. **If you add a field to a form, add it to the shared schema, not
just the client form** — the server route gets the new validation for free
and nothing can bypass it via a raw `fetch` call.

**Errors.** Every thrown error is H3's `createError({ statusCode, message })`
with a Persian, user-facing `message` — routes consistently surface this
directly in the UI's error banner (`err.data?.message` on the client), so
don't put anything in `message` you wouldn't want a user to read verbatim.
Common codes: `400` invalid input, `401` not logged in, `403` logged in but
not authorized, `404` not found, `429` rate-limited, `500` unexpected
server/DB error, `502` (newsletter send only) the mail provider itself is
unreachable/misconfigured.

**Rate limiting.** In-memory, per-process, keyed by `` `${action}:${ip or userId}` ``
via `enforceRateLimit(key, max, windowMs)`
([`server/utils/rateLimit.ts`](../../server/utils/rateLimit.ts)). Resets on
server restart and doesn't coordinate across multiple processes/instances
— fine at this app's current scale, called out here so nobody's surprised
it isn't Redis-backed. Exceeding the limit throws `429`. See each
endpoint's doc for its specific limit.

**Prisma schema-drift diagnostics.** A few routes (notifications, newsletter
subscribe/unsubscribe) wrap their Prisma calls and, on failure, run the
error through
[`diagnosePrismaSchemaDrift`](../../server/utils/prismaDiagnostics.ts) before
logging — it distinguishes "the Prisma Client hasn't been regenerated"
from "the migration hasn't been applied to this DB" and logs the actual fix
instead of a bare stack trace. If you add a new field/model and start
seeing a route fail confusingly right after, check the server log for this
hint before assuming it's a logic bug.
