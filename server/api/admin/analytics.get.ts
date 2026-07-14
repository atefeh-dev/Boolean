function daysBetween(a: Date, b: Date) {
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const now = new Date();
  const weekAgo       = new Date(now.getTime() - 7  * 86_400_000);
  const twoWeekAgo    = new Date(now.getTime() - 14 * 86_400_000);
  const threeDaysAgo  = new Date(now.getTime() - 3  * 86_400_000);
  const sevenDaysAgo  = new Date(now.getTime() - 7  * 86_400_000);
  const eightWeeksAgo = new Date(now.getTime() - 56 * 86_400_000);
  const todayStart    = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // ── All queries fire in parallel. None of these scale with all-time
  // history anymore — each is either a bounded count/aggregate pushed into
  // Postgres, or a time-windowed / take-limited fetch. (Previously three of
  // these were unbounded findMany, reduced by hand in JS — see the perf
  // review for why that doesn't scale.) ──────────────────────────────────
  const [
    publishedCount, pendingCount, rejectedCount,
    subscriberCount, categoryCount, userCount,
    recentPublished,
    oldestPending5, oldPendingCount, veryOldCount,
    recentSubscribers, lastNewsletter, newsletterReadyCount,
    newSubsThisWeek, newSubsLastWeek, newSubsToday,
    categoriesWithCounts,
    totalUserSubmitted, totalApproved, totalRejected,
    topContributorGroups,
    notSubscribedCount,
  ] = await Promise.all([
    prisma.link.count({ where: { status: "PUBLISHED" } }),
    prisma.link.count({ where: { status: "PENDING" } }),
    prisma.link.count({ where: { status: "REJECTED" } }),
    prisma.subscriber.count(),
    prisma.category.count(),
    prisma.user.count(),

    // Published in last 8 weeks — used for trend chart + activity feed
    prisma.link.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: eightWeeksAgo } },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true, url: true, publishedAt: true, categories: { select: { id: true, label: true } } },
    }),

    // Only the 5 oldest pending links are ever shown — no reason to fetch
    // the whole queue to get them.
    prisma.link.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 5,
      select: {
        id: true, title: true, url: true, createdAt: true,
        categories: { select: { id: true, label: true } },
        submittedBy: { select: { name: true } },
      },
    }),
    // Queue-age counts computed in the DB instead of filtering a full
    // in-memory list of every pending link.
    prisma.link.count({ where: { status: "PENDING", createdAt: { lt: threeDaysAgo } } }),
    prisma.link.count({ where: { status: "PENDING", createdAt: { lt: sevenDaysAgo } } }),

    // All subscribers in last 8 weeks (for trend + recent subscribers list)
    prisma.subscriber.findMany({
      where: { createdAt: { gte: eightWeeksAgo } },
      orderBy: { createdAt: "desc" },
      select: { email: true, createdAt: true, userId: true },
    }),

    prisma.newsletterSend.findFirst({ orderBy: { sentAt: "desc" } }),
    prisma.link.count({ where: { status: "PUBLISHED", notifiedAt: null } }),
    prisma.subscriber.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.subscriber.count({ where: { createdAt: { gte: twoWeekAgo, lt: weekAgo } } }),
    prisma.subscriber.count({ where: { createdAt: { gte: todayStart } } }),

    // Category distribution, computed by Postgres (count + most-recent
    // publish date per category) instead of pulling every published link's
    // categories into Node to tally by hand.
    prisma.category.findMany({
      select: {
        id: true,
        label: true,
        _count: { select: { links: { where: { status: "PUBLISHED" } } } },
        links: {
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          take: 1,
          select: { publishedAt: true },
        },
      },
    }),

    // Approval funnel — three bounded counts instead of fetching every
    // user-submitted link ever to count them in JS.
    prisma.link.count({ where: { submittedById: { not: null } } }),
    prisma.link.count({ where: { submittedById: { not: null }, status: "PUBLISHED" } }),
    prisma.link.count({ where: { submittedById: { not: null }, status: "REJECTED" } }),

    // Top 5 contributors by submission count, computed in the DB.
    prisma.link.groupBy({
      by: ["submittedById"],
      where: { submittedById: { not: null } },
      _count: { submittedById: true },
      orderBy: { _count: { submittedById: "desc" } },
      take: 5,
    }),

    // Registered accounts that never subscribed to the newsletter
    prisma.user.count({ where: { subscriber: null } }),
  ]);

  // Per-status breakdown + names for just the top 5 contributors — a
  // second small, bounded round trip rather than folding this into the
  // query above (groupBy can't mix "top N by count" with a full status
  // breakdown in a single pass).
  const topIds = topContributorGroups.map((g) => g.submittedById).filter((id): id is string => !!id);
  const [contributorStatusBreakdown, contributorUsers] = topIds.length
    ? await Promise.all([
        prisma.link.groupBy({
          by: ["submittedById", "status"],
          where: { submittedById: { in: topIds } },
          _count: { _all: true },
        }),
        prisma.user.findMany({ where: { id: { in: topIds } }, select: { id: true, name: true, email: true } }),
      ])
    : [[], []];

  // ── Derived: subscriber weekly trend ────────────────────────────────────
  const subscriberWeeklyTrend = Array.from({ length: 8 }, (_, i) => {
    const daysBack = (7 - i) * 7;
    const start = new Date(now.getTime() - (daysBack + 7) * 86_400_000);
    const end   = new Date(now.getTime() - daysBack * 86_400_000);
    const count = recentSubscribers.filter(
      s => s.createdAt >= start && s.createdAt < end
    ).length;
    return { label: i === 7 ? "این هفته" : `${8 - i - 1}w`, count };
  });

  // ── Derived: category distribution ──────────────────────────────────────
  const categories = categoriesWithCounts
    .map((c) => ({
      id: c.id,
      label: c.label,
      publishedCount: c._count.links,
      lastPublishedDaysAgo: c.links[0]?.publishedAt ? daysBetween(c.links[0].publishedAt, now) : null,
    }))
    .sort((a, b) => b.publishedCount - a.publishedCount);

  // ── Derived: top contributors ────────────────────────────────────────────
  const userById = new Map(contributorUsers.map((u) => [u.id, u]));
  const submittedById = new Map(topContributorGroups.map((g) => [g.submittedById!, g._count.submittedById]));
  const approvedById = new Map<string, number>();
  const rejectedById = new Map<string, number>();
  for (const row of contributorStatusBreakdown) {
    if (!row.submittedById) continue;
    if (row.status === "PUBLISHED") approvedById.set(row.submittedById, row._count._all);
    if (row.status === "REJECTED")  rejectedById.set(row.submittedById, row._count._all);
  }
  // topIds is already ordered by submission count desc (from the groupBy
  // orderBy+take above), so this preserves that order.
  const topContributors = topIds.map((id) => {
    const user = userById.get(id);
    const submitted = submittedById.get(id) ?? 0;
    const approved = approvedById.get(id) ?? 0;
    const rejected = rejectedById.get(id) ?? 0;
    return {
      name: user?.name ?? "—",
      email: user?.email ?? "",
      submitted,
      approved,
      rejected,
      approvalRate: submitted > 0 ? Math.round((approved / submitted) * 100) : 0,
    };
  });

  // ── Derived: oldest pending ──────────────────────────────────────────────
  const oldestPending = oldestPending5.map(l => ({
    id: l.id,
    title: l.title,
    url: l.url,
    daysAgo: daysBetween(new Date(l.createdAt), now),
    submittedBy: l.submittedBy?.name ?? null,
    categories: l.categories,
  }));

  // ── Derived: approval funnel ─────────────────────────────────────────────
  const approvalRate = totalUserSubmitted > 0
    ? Math.round((totalApproved / totalUserSubmitted) * 100) : 0;

  // ── Derived: publishing pace ─────────────────────────────────────────────
  const publishedThisWeek = recentPublished.filter(l => l.publishedAt && l.publishedAt >= weekAgo).length;
  const publishedLastWeek = recentPublished.filter(l => l.publishedAt && l.publishedAt >= twoWeekAgo && l.publishedAt < weekAgo).length;

  // ── Derived: recent subscribers ─────────────────────────────────────────
  const recentSubscriptions = recentSubscribers.slice(0, 10).map(s => ({
    // Mask the local part, keeping only the first 3 characters — capped at
    // the local part's own length so short addresses (e.g. "ab@x.com")
    // degrade to masking everything rather than a lookbehind silently
    // failing to match and leaving the email fully unmasked.
    email: s.email.replace(/^(.{0,3})(.+)(?=@)/, (_m, keep: string, rest: string) => keep + "*".repeat(rest.length)),
    hasAccount: !!s.userId,
    at: s.createdAt.toISOString(),
  }));

  // ── Derived: action items ────────────────────────────────────────────────
  // Days since last newsletter (null = never sent)
  const daysSinceSent = lastNewsletter ? daysBetween(new Date(lastNewsletter.sentAt), now) : null;

  type ActionLevel = "urgent" | "warn" | "info" | "success";
  interface ActionItem {
    level: ActionLevel;
    icon: string;
    text: string;
    href: string;
    cta: string;
  }

  const actionItems: ActionItem[] = [];

  // 🔴 Urgent: very old pending links (>7 days)
  if (veryOldCount > 0) {
    actionItems.push({
      level: "urgent",
      icon: "clock",
      text: `${veryOldCount} لینک در انتظار بررسی بیش از ۷ روز`,
      href: "/admin/links?status=PENDING",
      cta: "بررسی فوری",
    });
  }

  // 🟡 Warning: pending links 3–7 days old
  const moderateOldCount = oldPendingCount - veryOldCount;
  if (moderateOldCount > 0) {
    actionItems.push({
      level: "warn",
      icon: "clock",
      text: `${moderateOldCount} لینک در انتظار بررسی بیش از ۳ روز`,
      href: "/admin/links?status=PENDING",
      cta: "مشاهده صف",
    });
  }

  // 🟡 Warning: newsletter overdue (not sent in 2+ days, has content) — daily
  // cadence, so anything beyond a day or two is actually stale, not weekly.
  if ((daysSinceSent === null || daysSinceSent >= 2) && newsletterReadyCount > 0) {
    const msg = daysSinceSent === null
      ? "خبرنامه هرگز ارسال نشده است"
      : "خبرنامه چند روزی است ارسال نشده است";
    actionItems.push({
      level: "warn",
      icon: "mail",
      text: msg,
      href: "/admin/newsletter",
      cta: "ارسال کنید",
    });
  }

  // 🟢 Info: links ready to send
  if (newsletterReadyCount > 0) {
    actionItems.push({
      level: "info",
      icon: "send",
      text: `${newsletterReadyCount} لینک آماده ارسال در خبرنامه بعدی`,
      href: "/admin/newsletter",
      cta: "پیش‌نمایش",
    });
  }

  // 🟢 Success: new subscribers today
  if (newSubsToday > 0) {
    actionItems.push({
      level: "success",
      icon: "users",
      text: `${newSubsToday} مشترک جدید امروز`,
      href: "/admin/subscribers",
      cta: "مشاهده",
    });
  }

  // 🟢 Success: all caught up on queue
  if (pendingCount === 0) {
    actionItems.push({
      level: "success",
      icon: "check",
      text: "صف بررسی خالی است — همه لینک‌ها بررسی شده‌اند",
      href: "/admin/links?status=PUBLISHED",
      cta: "لینک‌های منتشرشده",
    });
  }

  return {
    counts: { publishedCount, pendingCount, rejectedCount, subscriberCount, categoryCount, userCount },
    pace: { thisWeek: publishedThisWeek, lastWeek: publishedLastWeek },
    queue: {
      count: pendingCount,
      oldestDaysAgo: oldestPending[0]?.daysAgo ?? null,
      oldestTitle: oldestPending[0]?.title ?? null,
    },
    newsletter: {
      readyCount: newsletterReadyCount,
      lastSentAt: lastNewsletter?.sentAt?.toISOString() ?? null,
      lastSentCount: lastNewsletter?.recipients ?? null,
      daysSinceSent,
    },
    subscribers: { total: subscriberCount, newThisWeek: newSubsThisWeek, newLastWeek: newSubsLastWeek, newToday: newSubsToday },
    members: {
      total: userCount,
      subscribedToday: newSubsToday,
      subscribed: userCount - notSubscribedCount,
      notSubscribed: notSubscribedCount,
    },
    funnel: { total: totalUserSubmitted, approved: totalApproved, rejected: totalRejected, pending: pendingCount, approvalRate },
    categories,
    topContributors,
    oldestPending,
    recentSubscriptions,
    actionItems,
    subscriberWeeklyTrend,
  };
});
