export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const [links, subscriberCount, lastSend] = await Promise.all([
    prisma.link.findMany({
      where: { status: "PUBLISHED", notifiedAt: null },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        url: true,
        body: true,
        publishedAt: true,
        categories: { select: { id: true, label: true } },
        submittedBy: { select: { name: true } },
      },
    }),
    prisma.subscriber.count(),
    prisma.newsletterSend.findFirst({ orderBy: { sentAt: "desc" } }),
  ]);

  return { links, subscriberCount, lastSend };
});
