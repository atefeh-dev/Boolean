function daysBetween(a: Date, b: Date) {
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const now = new Date();
  const weekAgo    = new Date(now.getTime() - 7  * 86_400_000);
  const twoWeekAgo = new Date(now.getTime() - 14 * 86_400_000);
  const eightWeeksAgo = new Date(now.getTime() - 56 * 86_400_000);

  // ── All queries fire in parallel ────────────────────────────────────────
  const [
    publishedCount, pendingCount, rejectedCount,
    subscriberCount, categoryCount, userCount,
    recentPublished, allPending,
    recentSubscribers, lastNewsletter, newsletterReadyCount,
    newSubsThisWeek, newSubsLastWeek,
    allCategories, publishedWithCats,
    userSubmissions, notSubscribedCount,
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

    // All pending ordered oldest-first — for queue health
    prisma.link.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true, title: true, url: true, createdAt: true,
        categories: { select: { id: true, label: true } },
        submittedBy: { select: { name: true } },
      },
    }),

    // All subscribers in last 8 weeks (for trend + activity)
    prisma.subscriber.findMany({
      where: { createdAt: { gte: eightWeeksAgo } },
      orderBy: { createdAt: "desc" },
      select: { email: true, createdAt: true },
    }),

    prisma.newsletterSend.findFirst({ orderBy: { sentAt: "desc" } }),
    prisma.link.count({ where: { status: "PUBLISHED", notifiedAt: null } }),
    prisma.subscriber.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.subscriber.count({ where: { createdAt: { gte: twoWeekAgo, lt: weekAgo } } }),
    prisma.category.findMany({ select: { id: true, label: true } }),

    // Published links with categories — for category distribution
    prisma.link.findMany({
      where: { status: "PUBLISHED" },
      select: { categories: { select: { id: true } }, publishedAt: true },
    }),

    // User-submitted links — for funnel + top contributors
    prisma.link.findMany({
      where: { submittedById: { not: null } },
      select: { id: true, status: true, submittedById: true, submittedBy: { select: { name: true, email: true } } },
    }),

    // Registered accounts that never subscribed to the newsletter
    prisma.user.count({ where: { subscriber: null } }),
  ]);

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
  const catMap = new Map<string, { label: string; published: number; lastAt: Date | null }>();
  for (const c of allCategories) catMap.set(c.id, { label: c.label, published: 0, lastAt: null });
  for (const link of publishedWithCats) {
    for (const cat of link.categories) {
      const entry = catMap.get(cat.id);
      if (!entry) continue;
      entry.published++;
      if (!entry.lastAt || (link.publishedAt && link.publishedAt > entry.lastAt)) {
        entry.lastAt = link.publishedAt;
      }
    }
  }
  const categories = Array.from(catMap.entries())
    .map(([id, v]) => ({
      id,
      label: v.label,
      publishedCount: v.published,
      lastPublishedDaysAgo: v.lastAt ? daysBetween(v.lastAt, now) : null,
    }))
    .sort((a, b) => b.publishedCount - a.publishedCount);

  // ── Derived: top contributors ────────────────────────────────────────────
  const contribMap = new Map<string, { name: string; email: string; submitted: number; approved: number; rejected: number }>();
  for (const link of userSubmissions) {
    if (!link.submittedById || !link.submittedBy) continue;
    if (!contribMap.has(link.submittedById)) {
      contribMap.set(link.submittedById, { name: link.submittedBy.name, email: link.submittedBy.email, submitted: 0, approved: 0, rejected: 0 });
    }
    const c = contribMap.get(link.submittedById)!;
    c.submitted++;
    if (link.status === "PUBLISHED") c.approved++;
    if (link.status === "REJECTED")  c.rejected++;
  }
  const topContributors = [...contribMap.values()]
    .sort((a, b) => b.submitted - a.submitted)
    .slice(0, 5)
    .map(c => ({ ...c, approvalRate: c.submitted > 0 ? Math.round((c.approved / c.submitted) * 100) : 0 }));

  // ── Derived: oldest pending ──────────────────────────────────────────────
  const oldestPending = allPending.slice(0, 5).map(l => ({
    id: l.id,
    title: l.title,
    url: l.url,
    daysAgo: daysBetween(new Date(l.createdAt), now),
    submittedBy: l.submittedBy?.name ?? null,
    categories: l.categories,
  }));

  // ── Derived: approval funnel ─────────────────────────────────────────────
  const totalUserSubmitted = userSubmissions.length;
  const totalApproved = userSubmissions.filter(l => l.status === "PUBLISHED").length;
  const totalRejected = userSubmissions.filter(l => l.status === "REJECTED").length;
  const approvalRate = totalUserSubmitted > 0
    ? Math.round((totalApproved / totalUserSubmitted) * 100) : 0;

  // ── Derived: publishing pace ─────────────────────────────────────────────
  const publishedThisWeek = recentPublished.filter(l => l.publishedAt && l.publishedAt >= weekAgo).length;
  const publishedLastWeek = recentPublished.filter(l => l.publishedAt && l.publishedAt >= twoWeekAgo && l.publishedAt < weekAgo).length;

  // ── Derived: recent activity feed ───────────────────────────────────────
  // Take up to 10 from EACH source before merging — not an arbitrary
  // smaller split like 6/4. Taking N from each of two sources and merging
  // is the only way to guarantee the true top-N of the combined list is
  // present; a smaller per-type cap can silently drop genuinely-recent
  // items of whichever type happens to be more active that day.
  const activityPublished = recentPublished.slice(0, 10).map(l => ({
    type: "published" as const,
    title: l.title,
    meta: l.categories.map(c => c.label).join("، ") || "—",
    at: l.publishedAt?.toISOString() ?? now.toISOString(),
  }));
  const activitySubscribed = recentSubscribers.slice(0, 10).map(s => ({
    type: "subscribed" as const,
    // Mask the local part, keeping only the first 3 characters — but for
    // short local parts (e.g. "ab@x.com"), a lookbehind requiring 3
    // characters never matches at all, leaving the email fully unmasked.
    // Cap the "kept" prefix at the local part's own length so it degrades
    // to masking everything rather than masking nothing.
    title: s.email.replace(/^(.{0,3})(.+)(?=@)/, (_m, keep: string, rest: string) => keep + "*".repeat(rest.length)),
    meta: "مشترک جدید",
    at: s.createdAt.toISOString(),
  }));
  const recentActivity = [...activityPublished, ...activitySubscribed]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 10);

  // ── Derived: action items ────────────────────────────────────────────────
  // Count pending links older than 3 days (need attention)
  const oldPendingCount = allPending.filter(l => daysBetween(new Date(l.createdAt), now) >= 3).length;

  // New subscribers in last 24 hours
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const newSubsToday = await prisma.subscriber.count({ where: { createdAt: { gte: todayStart } } });

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
  const veryOldCount = allPending.filter(l => daysBetween(new Date(l.createdAt), now) > 7).length;
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
    recentActivity,
    actionItems,
    subscriberWeeklyTrend,
  };
});
