/**
 * Notifications are derived from real data rather than a separate table:
 *  - Regular users see status updates on links they submitted (published/rejected).
 *  - Admins see links awaiting review (status = PENDING).
 *
 * Read state is server-side: `User.lastNotificationsReadAt` is a watermark
 * updated by POST /api/notifications/read (called when the panel opens).
 * Anything newer than that watermark is unread. This lives in the DB (not
 * localStorage) so it's consistent across devices/browsers.
 *
 * This runs on a 45s client-side poll for every logged-in user, so it's
 * one of the more "always-on" query paths in the app — worth keeping
 * lean: the two independent lookups below (read watermark + notification
 * source) run in parallel per branch, and the dismissals lookup is bounded
 * to just this batch's candidate ids rather than a user's entire dismissal
 * history.
 */
export interface NotificationItem {
  id: string;
  type: "link_published" | "link_rejected" | "link_pending";
  title: string;
  meta?: string;
  href: string;
  createdAt: string;
  read: boolean;
}

const TAKE = 15;

export default defineEventHandler(
  async (event): Promise<{ notifications: NotificationItem[]; unreadCount: number }> => {
    const session = await getSessionUser(event);
    if (!session) {
      throw createError({ statusCode: 401, message: "ابتدا وارد شوید." });
    }

    // Read state depends on a column (`lastNotificationsReadAt`) added in a
    // migration on top of the base schema. If that migration hasn't been
    // applied yet to this database, this lookup throws — but the
    // notifications themselves (from the `Link` table) are unaffected and
    // should still work, so the failure is caught *inside* this promise
    // and degrades to "read state unknown, treat everything as unread"
    // rather than taking the whole endpoint down. Catching it here (rather
    // than with a try/catch around the await) is what lets it safely run
    // in parallel with the links query below — this promise can never
    // reject.
    const readAtPromise = prisma.user
      .findUnique({ where: { id: session.sub }, select: { lastNotificationsReadAt: true } })
      .then((u) => u?.lastNotificationsReadAt ?? null)
      .catch((err) => {
        logNotificationsSchemaDrift("couldn't read lastNotificationsReadAt — falling back to 'everything unread'", err);
        return null as Date | null;
      });

    let readAt: Date | null;
    let notifications: NotificationItem[];

    try {
      if (session.role === "ADMIN") {
        const [ra, links] = await Promise.all([
          readAtPromise,
          prisma.link.findMany({
            where: { status: "PENDING" },
            orderBy: { createdAt: "desc" },
            take: TAKE,
            select: {
              id: true,
              title: true,
              createdAt: true,
              submittedBy: { select: { name: true } },
            },
          }),
        ]);
        readAt = ra;
        notifications = links.map((link) => ({
          id: `pending:${link.id}`,
          type: "link_pending" as const,
          title: `لینک «${link.title}» منتظر بررسی است`,
          meta: link.submittedBy?.name ? `ارسال از ${link.submittedBy.name}` : undefined,
          href: "/admin/links?status=PENDING",
          createdAt: link.createdAt.toISOString(),
          read: ra ? link.createdAt <= ra : false,
        }));
      } else {
        const [ra, links] = await Promise.all([
          readAtPromise,
          prisma.link.findMany({
            where: {
              submittedById: session.sub,
              status: { in: ["PUBLISHED", "REJECTED"] },
            },
            orderBy: { updatedAt: "desc" },
            take: TAKE,
            select: { id: true, title: true, status: true, updatedAt: true },
          }),
        ]);
        readAt = ra;
        notifications = links.map((link) => ({
          id: `${link.status.toLowerCase()}:${link.id}`,
          type: link.status === "PUBLISHED" ? ("link_published" as const) : ("link_rejected" as const),
          title:
            link.status === "PUBLISHED"
              ? `لینک «${link.title}» شما منتشر شد`
              : `لینک «${link.title}» شما رد شد`,
          href: link.status === "PUBLISHED" ? "/archives" : "/submit",
          createdAt: link.updatedAt.toISOString(),
          read: ra ? link.updatedAt <= ra : false,
        }));
      }
    } catch (err) {
      // readAtPromise can't reject (caught above), so a rejection here can
      // only come from the links query.
      logNotificationsSchemaDrift(`failed to load notifications for role=${session.role}`, err);
      throw createError({ statusCode: 500, message: "دریافت اعلان‌ها با خطا مواجه شد." });
    }

    // Same isolation pattern as the watermark above: dismissals live in a
    // separate table added by a later migration, so a not-yet-migrated DB
    // shouldn't break the feed — it just means nothing is filtered out yet.
    // Bounded to *this batch's* notification ids (at most TAKE=15) rather
    // than the user's entire dismissal history, which only ever grows.
    if (notifications.length > 0) {
      try {
        const dismissals = await prisma.notificationDismissal.findMany({
          where: { userId: session.sub, notificationId: { in: notifications.map((n) => n.id) } },
          select: { notificationId: true },
        });
        const dismissedIds = new Set(dismissals.map((d) => d.notificationId));
        notifications = notifications.filter((n) => !dismissedIds.has(n.id));
      } catch (err) {
        logNotificationsSchemaDrift("couldn't read dismissals — falling back to 'nothing dismissed'", err);
      }
    }

    return {
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    };
  },
);
