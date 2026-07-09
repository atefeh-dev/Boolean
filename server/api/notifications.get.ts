/**
 * Notifications are derived from real data rather than a separate table:
 *  - Regular users see status updates on links they submitted (published/rejected).
 *  - Admins see links awaiting review (status = PENDING).
 *
 * Read state is server-side: `User.lastNotificationsReadAt` is a watermark
 * updated by POST /api/notifications/read (called when the panel opens).
 * Anything newer than that watermark is unread. This lives in the DB (not
 * localStorage) so it's consistent across devices/browsers.
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
      throw createError({ statusCode: 401, statusMessage: "ابتدا وارد شوید." });
    }

    // Read state depends on a column (`lastNotificationsReadAt`) added in a
    // migration on top of the base schema. If that migration hasn't been
    // applied yet to this database, this lookup throws — but the
    // notifications themselves (from the `Link` table) are unaffected and
    // still fully queryable. So this failure is isolated and degrades to
    // "read state unknown, treat everything as unread" rather than taking
    // the whole endpoint down.
    let readAt: Date | null = null;
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.sub },
        select: { lastNotificationsReadAt: true },
      });
      readAt = dbUser?.lastNotificationsReadAt ?? null;
    } catch (err) {
      logNotificationsSchemaDrift("couldn't read lastNotificationsReadAt — falling back to 'everything unread'", err);
    }
    const isRead = (createdAt: Date) => (readAt ? createdAt <= readAt : false);

    // Same isolation pattern as the watermark above: dismissals live in a
    // separate table added by a later migration, so a not-yet-migrated DB
    // shouldn't break the feed — it just means nothing is filtered out yet.
    let dismissedIds = new Set<string>();
    try {
      const dismissals = await prisma.notificationDismissal.findMany({
        where: { userId: session.sub },
        select: { notificationId: true },
      });
      dismissedIds = new Set(dismissals.map((d) => d.notificationId));
    } catch (err) {
      logNotificationsSchemaDrift("couldn't read dismissals — falling back to 'nothing dismissed'", err);
    }

    let notifications: NotificationItem[];

    try {
      if (session.role === "ADMIN") {
        const links = await prisma.link.findMany({
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: TAKE,
          select: {
            id: true,
            title: true,
            createdAt: true,
            submittedBy: { select: { name: true } },
          },
        });

        notifications = links
          .map((link) => ({
            id: `pending:${link.id}`,
            type: "link_pending" as const,
            title: `لینک «${link.title}» منتظر بررسی است`,
            meta: link.submittedBy?.name ? `ارسال از ${link.submittedBy.name}` : undefined,
            href: "/admin/links?status=PENDING",
            createdAt: link.createdAt.toISOString(),
            read: isRead(link.createdAt),
          }))
          .filter((n) => !dismissedIds.has(n.id));
      } else {
        const links = await prisma.link.findMany({
          where: {
            submittedById: session.sub,
            status: { in: ["PUBLISHED", "REJECTED"] },
          },
          orderBy: { updatedAt: "desc" },
          take: TAKE,
          select: { id: true, title: true, status: true, updatedAt: true },
        });

        notifications = links
          .map((link) => ({
            id: `${link.status.toLowerCase()}:${link.id}`,
            type: link.status === "PUBLISHED" ? ("link_published" as const) : ("link_rejected" as const),
            title:
              link.status === "PUBLISHED"
                ? `لینک «${link.title}» شما منتشر شد`
                : `لینک «${link.title}» شما رد شد`,
            href: link.status === "PUBLISHED" ? "/archives" : "/submit",
            createdAt: link.updatedAt.toISOString(),
            read: isRead(link.updatedAt),
          }))
          .filter((n) => !dismissedIds.has(n.id));
      }
    } catch (err) {
      logNotificationsSchemaDrift(`failed to load notifications for role=${session.role}`, err);
      throw createError({
        statusCode: 500,
        statusMessage: "دریافت اعلان‌ها با خطا مواجه شد.",
      });
    }

    return {
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    };
  },
);
