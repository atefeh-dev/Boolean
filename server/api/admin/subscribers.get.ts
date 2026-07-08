export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const query = getQuery(event);
  const take = Math.min(Math.max(Number(query.take) || 30, 1), 100);
  const skip = Math.max(Number(query.skip) || 0, 0);

  const [subscribers, total] = await Promise.all([
    prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: { id: true, email: true, createdAt: true },
    }),
    prisma.subscriber.count(),
  ]);

  return { subscribers, total, take, skip };
});
