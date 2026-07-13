export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const query = getQuery(event);
  const status = (query.status as string)?.toUpperCase() || "PENDING";
  const validStatuses = ["PENDING", "PUBLISHED", "REJECTED"];

  if (!validStatuses.includes(status)) {
    throw createError({ statusCode: 400, message: "وضعیت نامعتبر است." });
  }

  const take = Math.min(Math.max(Number(query.take) || 20, 1), 100);
  const skip = Math.max(Number(query.skip) || 0, 0);

  const where = { status: status as "PENDING" | "PUBLISHED" | "REJECTED" };

  const [links, total] = await Promise.all([
    prisma.link.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: { categories: true, submittedBy: { select: { name: true, email: true } } },
    }),
    prisma.link.count({ where }),
  ]);

  return { links, total, take, skip };
});
