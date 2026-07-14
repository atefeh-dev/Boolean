# `/api/admin/analytics`, `/api/admin/overview`, `/api/admin/subscribers*`

All routes on this page require admin (`requireAdmin`) — `401` if not
logged in, `403` if logged in but not `ADMIN`.

## `GET /api/admin/analytics`

The one big call behind the entire admin dashboard — every panel documented
in `components/admin.md` gets its props from a slice of this single
response, fetched once by the dashboard page. If a panel needs a new field,
it goes here, not into a new endpoint of its own.

### Response — `200`

```ts
{
  counts: { publishedCount, pendingCount, rejectedCount, subscriberCount, categoryCount, userCount }
  pace: { thisWeek: number; lastWeek: number } // links published
  queue: { count: number; oldestDaysAgo: number | null; oldestTitle: string | null }
  newsletter: { readyCount: number; lastSentAt: string | null; lastSentCount: number | null; daysSinceSent: number | null }
  subscribers: { total: number; newThisWeek: number; newLastWeek: number; newToday: number }
  members: { total: number; subscribedToday: number; subscribed: number; notSubscribed: number }
  funnel: { total: number; approved: number; rejected: number; pending: number; approvalRate: number } // user-submitted links only
  categories: { id: string; label: string; publishedCount: number; lastPublishedDaysAgo: number | null }[]
  topContributors: { name: string; email: string; submitted: number; approved: number; rejected: number; approvalRate: number }[] // top 5
  oldestPending: { id, title, url, daysAgo, submittedBy: string | null, categories: {id,label}[] }[] // 5 oldest
  recentSubscriptions: { email: string; hasAccount: boolean; at: string }[] // 10 most recent, email partially masked
  actionItems: { level: "urgent"|"warn"|"info"|"success"; icon: string; text: string; href: string; cta: string }[]
  subscriberWeeklyTrend: { label: string; count: number }[] // 8 weeks
}
```

### Performance notes worth knowing before modifying this route

Every query here is either a bounded `count`/aggregate pushed into
Postgres, or a `take`-limited fetch — deliberately, per an inline comment
in the source noting this used to include unbounded `findMany` calls
reduced by hand in JS (e.g. "sum this field across every row ever"), which
stopped scaling as the tables grew. **If you're adding a new stat here,
compute it as a bounded/aggregate Prisma query, not a full-table fetch
reduced in application code** — that regression is exactly what this route
was rewritten to avoid.

All ~19 top-level queries run in a single `Promise.all` — a second small
round trip (contributor status breakdown + names) only fires afterward,
and only for the actual top-5 contributor ids, since a `groupBy` can't
mix "top N by count" with a full status breakdown in one pass.

### Where each admin panel's props come from

| Panel (see `components/admin.md`) | Response path |
|---|---|
| `AdminKpis` | `counts` + `pace` + `subscribers` |
| `AdminQueuePanel` | `queue`, `oldestPending` |
| `AdminGrowthPanel` | `funnel` |
| `AdminCategoryChart` | `categories` |
| `AdminSubscriberChart` | `subscriberWeeklyTrend` |
| `AdminMembersPanel` | `members` |
| `AdminContributorsPanel` | `topContributors` |
| `AdminSignupsPanel` | `recentSubscriptions` |
| `AdminActionRequired` | `actionItems` |
| `AdminNewsletterPanel` | `newsletter`, `queue.count` (as `readyCount`'s counterpart) |

`actionItems` is computed server-side from thresholds (queue age >3/>7
days, newsletter unset-or-2+ days stale, etc.) — the exact same severity
logic `AdminActionRequired` just renders, so tuning "when does this
warning appear" means editing this route, not the component.

---

## `GET /api/admin/overview`

A smaller, older sibling of `/analytics` — six raw counts only, no
derived/trend data. Response:

```ts
{ pendingCount, publishedCount, rejectedCount, categoriesCount, subscriberCount, userCount }
```

Used by the admin **links** page (`app/pages/admin/links.vue`) to populate
the pending/published/rejected tab counts — a lighter call than
`/analytics` for a page that only needs those three numbers, not the full
dashboard payload. The admin **dashboard** page (`admin/index.vue`) calls
`/analytics` instead, since it needs everything else `/overview` doesn't
have. If a page only needs these six counts, prefer this endpoint over
`/analytics` for the smaller query; if it needs anything beyond raw counts,
use `/analytics` rather than extending this one.

---

## `GET /api/admin/subscribers`

Paginated, searchable, filterable contact list — the one endpoint in the
app that queries across two tables in a single call: `Subscriber` rows
(may or may not have an account attached — a guest can subscribe without
ever registering) unioned with `User` rows that have *no* `Subscriber` at
all (an account that never subscribed to the newsletter).

### Query params

| Param | Type | Default | Notes |
|---|---|---|---|
| `take` | `number` | `30` | Clamped `1`–`100` |
| `skip` | `number` | `0` | Clamped `≥0` |
| `filter` | `"all" \| "subscribed" \| "not-subscribed"` | `"all"` | Anything else silently falls back to `"all"` |
| `search` | `string` | — | Matched `ILIKE` against email and name, truncated to 100 chars |

### Response — `200`

```ts
{
  subscribers: { id: string; email: string; name: string | null; hasAccount: boolean; subscribed: boolean; createdAt: string }[]
  total: number
  take: number
  skip: number
}
```

### Implementation note

This is raw SQL (`prisma.$queryRaw` with a `Prisma.sql` CTE), not a plain
Prisma model query — the union-across-two-tables shape genuinely isn't
expressible as one. **All inputs are passed as bound parameters via
`Prisma.sql`/`Prisma.join`, never string-concatenated** — if you extend
this route's filtering, keep every user-supplied value going through
`Prisma.sql` template interpolation rather than building the query string
by hand, or you reintroduce SQL injection into the one hand-written query
in the codebase.

---

## `DELETE /api/admin/subscribers/:id`

Removes a subscriber by their `Subscriber` row id (not `userId` — this
deletes the subscription, not the account).

### Response — `200`

```ts
{ ok: true }
```

### Errors

`400` missing id, `404` no such subscriber.

---

## `GET /api/admin/subscribers/stats`

A tiny, standalone version of the `members` slice from `/analytics` —
subscriber/user/not-subscribed counts only, no trend or list data.

### Response — `200`

```ts
{ subscriberCount: number; userCount: number; notSubscribedCount: number }
```

Useful if a future admin view (e.g. the subscribers list page's own header)
needs just these three counts without paying for the full `/analytics`
query.
