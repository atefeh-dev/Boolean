# `/api/notifications*`

Notifications aren't stored in their own table — they're derived live from
`Link` rows on every request. "Read" state is a single watermark column
(`User.lastNotificationsReadAt`); dismissal is the one thing that does get
its own table (`NotificationDismissal`), since "permanently hide this one
item" can't be expressed as a single timestamp.

## `GET /api/notifications` — logged-in users

### Response — `200`

```ts
{
  notifications: {
    id: string          // "pending:<linkId>" | "published:<linkId>" | "rejected:<linkId>"
    type: "link_published" | "link_rejected" | "link_pending"
    title: string
    meta?: string
    href: string
    createdAt: string   // ISO
    read: boolean
  }[]
  unreadCount: number
}
```

### Errors

`401` if not logged in. `500` if the underlying links query itself fails
(distinct from the read-watermark/dismissals lookups, which are designed
to degrade gracefully instead — see below).

### What shows up depends on role

- **Admins** see the up-to-15 most recently submitted `PENDING` links
  (`type: "link_pending"`) — i.e. "things waiting on you."
- **Regular users** see the up-to-15 most recent status changes
  (`PUBLISHED`/`REJECTED`) on links *they personally submitted*.

An account is never shown both — the response depends entirely on
`session.role`.

### Behavior notes

- **`read` is computed, not stored per-notification** — it's
  `createdAt/updatedAt <= user.lastNotificationsReadAt`. Advancing that one
  watermark (via `POST /api/notifications/read`) is what marks everything
  "as of now" read in one shot.
- **Two independent graceful-degradation paths**, both logged via
  `logNotificationsSchemaDrift` rather than failing the whole endpoint:
  reading the watermark falls back to "treat everything as unread" if that
  column doesn't exist yet on this DB (e.g. migration not applied), and
  reading dismissals falls back to "nothing's dismissed" the same way. Only
  a failure in the core links query itself produces a `500` — a
  half-migrated database degrades instead of breaking notifications
  entirely.
- Dismissed notifications (see below) are filtered out before the response
  is built — bounded to just this batch's candidate ids, not the user's
  entire dismissal history, since that lookup only ever grows over time.

---

## `POST /api/notifications/read` — logged-in users

Marks everything as read up to now by advancing the watermark. Called by
`NotificationsBell` every time the panel opens.

### Response — `200`

```ts
{ lastNotificationsReadAt: string } // ISO
```

### Errors

`401` if not logged in, `500` if the DB write itself fails (schema-drift
diagnosis logged, same as above).

---

## `POST /api/notifications/dismiss` — logged-in users

Permanently removes one notification from the feed — distinct from "read,"
which just changes how an item looks. A dismissed notification stays gone
across refreshes/devices until the underlying `Link` changes state again
(which produces a new, distinct notification id, so it isn't "un-dismissed"
by this — it's a genuinely new notification).

### Body

```ts
{ id: string } // e.g. "pending:abc123"
```

### Response — `200`

```ts
{ ok: true }
```

### Errors

| Code | When |
|---|---|
| `401` | Not logged in |
| `400` | Missing/empty `id` |
| `500` | DB write failed |

Uses `upsert` — dismissing an already-dismissed id is a harmless no-op,
not an error.
