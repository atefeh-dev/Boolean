export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const [subscriberCount, userCount, notSubscribedCount] = await Promise.all([
    prisma.subscriber.count(),
    prisma.user.count(),
    prisma.user.count({ where: { subscriber: null } }),
  ]);

  return { subscriberCount, userCount, notSubscribedCount };
});
