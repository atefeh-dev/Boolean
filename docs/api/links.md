# `/api/links*` and `/api/admin/links*`

## `GET /api/links` — public

The published-links feed. Backs the home, archive, and category pages
(via `useHomeLinks`/`useArchiveData`/`useCategoryData`) — one shared
endpoint, not three.

### Query params

| Param | Type | Default | Notes |
|---|---|---|---|
| `take` | `number` | `50` | Capped at `500` server-side regardless of what's requested |

### Response — `200`

```ts
{
  links: {
    id: string
    url: string
    title: string
    body: string | null
    publishedAt: string | null
    categories: { id: string; label: string }[]
  }[]
}
```

Only `status: "PUBLISHED"` links, newest-first by `publishedAt`. The
`select` is intentionally narrow — `credit`, `updatedAt`, `notifiedAt`, and
`submittedById` aren't fetched, since none of this endpoint's three
consumers use them. **If a new page needs one of those fields from this
endpoint, add it to the `select` deliberately** rather than switching to
`include` — the narrow select exists specifically to avoid pulling
unnecessary columns on every page load.

---

## `POST /api/links` — logged-in users

Public link submission — goes into the moderation queue as `PENDING`.

**Rate limit:** 20 / hour per user (`submit:${session.sub}` — keyed by user
id, not IP, since this requires login already).

### Body (`submitLinkSchema`)

| Field | Type | Rules |
|---|---|---|
| `url` | `string` | 1–2048 chars, must parse as a valid `http:`/`https:` URL |
| `title` | `string` | 1–80 chars |
| `body` | `string` | optional, ≤150 chars |
| `credit` | `string` | optional, ≤20 chars |
| `categories` | `string[]` | ≤3 ids, defaults to `[]` |

### Response — `200`

```ts
{ link: Link & { categories: Category[] } } // status: "PENDING"
```

### Errors

| Code | When |
|---|---|
| `401` | Not logged in |
| `429` | Rate limit exceeded |
| `400` | Failed schema validation, or a submitted category id doesn't exist |

### Behavior notes

The stored `url` is the **normalized** form from `new URL(url).href`, not
the raw submitted string (e.g. adds a trailing slash, normalizes
casing/encoding per the URL spec) — don't assume the stored value is a
byte-for-byte copy of what the user typed.

---

## `GET /api/admin/links` — admin only

The moderation queue, filterable by status.

### Query params

| Param | Type | Default | Notes |
|---|---|---|---|
| `status` | `"PENDING" \| "PUBLISHED" \| "REJECTED"` | `"PENDING"` | Case-insensitive on input; `400` on anything else |
| `take` | `number` | `20` | Clamped to `1`–`100` |
| `skip` | `number` | `0` | Clamped to `≥0` |

### Response — `200`

```ts
{
  links: (Link & { categories: Category[]; submittedBy: { name; email } | null })[]
  total: number
  take: number
  skip: number
}
```

`total` is the full count for that status (ignoring `take`/`skip`) — use it
for pagination UI.

---

## `PATCH /api/admin/links/:id` — admin only

The one moderation endpoint for approve/reject/edit — the `action` field
in the body picks which.

### Body

```ts
{
  action: "approve" | "reject" | "save"
  edits?: { title?: string; body?: string; credit?: string; categories?: string[] }
}
```

`edits` is only read for `action: "save"` — ignored for `approve`/`reject`.

### Response — `200`

```ts
{ link: Link & { categories: Category[] } }
```

### Errors

| Code | When |
|---|---|
| `401` / `403` | Not an admin |
| `400` | Missing/invalid `id`, invalid `action`, or (on `save`) an empty `title` or an unknown category id |
| `404` | Link doesn't exist |

### Behavior notes per action

- **`approve`** — sets `status: "PUBLISHED"` and `publishedAt: new Date()`.
  Doesn't touch any other field.
- **`reject`** — sets `status: "REJECTED"` only.
- **`save`** — updates only the fields present in `edits`; status is left
  untouched (you can edit a pending, published, or rejected link's text
  without changing its moderation state). Category updates are capped to 3
  and validated against real category ids, same as submission.

  **Known sharp edge, already handled — worth knowing if you touch this
  route:** `edits.categories` only replaces the link's categories when it's
  a *non-empty* array. An empty array (`[]`) is silently ignored rather
  than clearing all categories — because in JS, `[]` is truthy, so a naive
  `if (edits.categories)` check would have let "save with the categories
  checklist cleared" accidentally disconnect every category relation on
  the link. If you're modifying this branch, preserve the explicit
  `.length > 0` check rather than simplifying it back to a truthiness
  check.
