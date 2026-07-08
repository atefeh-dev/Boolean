export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const [
    pendingCount,
    publishedCount,
    rejectedCount,
    categoriesCount,
    subscriberCount,
    userCount,
  ] = await Promise.all([
    prisma.link.count({ where: { status: "PENDING" } }),
    prisma.link.count({ where: { status: "PUBLISHED" } }),
    prisma.link.count({ where: { status: "REJECTED" } }),
    prisma.category.count(),
    prisma.subscriber.count(),
    prisma.user.count(),
  ]);

  return {
    pendingCount,
    publishedCount,
    rejectedCount,
    categoriesCount,
    subscriberCount,
    userCount,
  };
});
