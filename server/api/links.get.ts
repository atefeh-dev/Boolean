export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const take = Math.min(Number(query.take) || 50, 500);

  const links = await prisma.link.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take,
    include: { categories: true },
  });

  return { links };
});
