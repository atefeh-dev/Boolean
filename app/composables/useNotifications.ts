export interface NotificationItem {
  id: string
  type: 'link_published' | 'link_rejected' | 'link_pending'
  title: string
  meta?: string
  href: string
  createdAt: string
  read: boolean
}

/**
 * Notifications are real (derived server-side from link status changes /
 * the pending-review queue). Read state is server-side too: the API
 * computes each item's `read` flag from `User.lastNotificationsReadAt`,
 * and `markAllRead()` advances that watermark via POST /api/notifications/read.
 * Nothing is stored in the browser, so state is consistent across devices.
 */
export function useNotifications() {
  const { user, isLoggedIn } = useAuth()

  const notifications = useState<NotificationItem[]>('notifications_list', () => [])
  const unreadCount = useState<number>('notifications_unread_count', () => 0)
  const loading = useState<boolean>('notifications_loading', () => false)
  const error = useState<boolean>('notifications_error', () => false)
  const lastFetchedFor = useState<string | null>('notifications_fetched_for', () => null)

  // ── Bell ring, for newly-arrived notifications ──────────────────────────
  // Shared (not per-component) state: the public site and the admin panel
  // use separate layouts, each mounting their own NotificationsBell, so a
  // ref local to that component would reset every time the user crosses
  // between them and miss the exact fetch that revealed the new item.
  // `lastSeenUnreadCount` starts at 0 (the same default as unreadCount
  // itself), so a fresh page load that immediately finds unread items
  // rings too — not just increases spotted mid-session.
  const ringing = useState<boolean>('notifications_ringing', () => false)
  const lastSeenUnreadCount = useState<number>('notifications_last_seen_count', () => 0)
  let ringTimeout: ReturnType<typeof setTimeout> | undefined

  function maybeRing(newCount: number) {
    const prev = lastSeenUnreadCount.value
    lastSeenUnreadCount.value = newCount
    if (newCount <= prev) return
    ringing.value = false
    setTimeout(() => {
      ringing.value = true
      if (ringTimeout) clearTimeout(ringTimeout)
      ringTimeout = setTimeout(() => {
        ringing.value = false
      }, 1400)
    }, 0)
  }

  async function fetchNotifications({ force = false } = {}) {
    if (!isLoggedIn.value || !user.value) return
    if (!force && lastFetchedFor.value === user.value.id) return

    loading.value = true
    error.value = false
    try {
      const res = await $fetch<{ notifications: NotificationItem[]; unreadCount: number }>(
        '/api/notifications',
      )
      notifications.value = res.notifications
      maybeRing(res.unreadCount)
      unreadCount.value = res.unreadCount
      lastFetchedFor.value = user.value.id
    } catch (err) {
      error.value = true
      // Swallowed to a boolean flag for the UI, but logged so a real cause
      // (e.g. the lastNotificationsReadAt migration not having been run
      // against this DB) is visible in devtools instead of just "no badge".
      console.error('[notifications] fetch failed', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Persists "read up to now" on the server and clears the badge locally.
   * Intentionally doesn't mutate `notifications.value` — items already
   * rendered keep the `read` flag they had when fetched, so a freshly
   * opened panel still shows which ones were new this time. The next
   * fetch will reflect everything as read.
   */
  async function markAllRead() {
    if (!isLoggedIn.value) return
    unreadCount.value = 0
    try {
      await $fetch('/api/notifications/read', { method: 'POST' })
    } catch (err) {
      // Non-fatal: worst case the badge count is corrected on the next fetch.
      console.error('[notifications] mark-as-read failed', err)
    }
  }

  /**
   * Permanently removes one notification — optimistic on the client (so the
   * swipe/close interaction feels instant), persisted via POST
   * /api/notifications/dismiss so it stays gone after a refresh or on
   * another device. Rolled back if the request fails, since silently
   * "un-dismissing" on next fetch would be a confusing surprise mid-session.
   */
  async function dismissNotification(id: string) {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index === -1) return

    const [removed] = notifications.value.splice(index, 1)
    if (removed && !removed.read) {
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }

    try {
      await $fetch('/api/notifications/dismiss', { method: 'POST', body: { id } })
    } catch (err) {
      console.error('[notifications] dismiss failed, restoring item', err)
      if (removed) {
        notifications.value.splice(index, 0, removed)
        if (!removed.read) unreadCount.value += 1
      }
    }
  }

  function reset() {
    notifications.value = []
    unreadCount.value = 0
    lastFetchedFor.value = null
    lastSeenUnreadCount.value = 0
    ringing.value = false
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    ringing,
    fetchNotifications,
    markAllRead,
    dismissNotification,
    reset,
  }
}
