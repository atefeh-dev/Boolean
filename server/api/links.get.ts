export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const take = Math.min(Number(query.take) || 50, 500);

  const links = await prisma.link.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take,
    // This endpoint has 3 consumers (home, archive, category pages) —
    // union of what they actually use. `credit` isn't read by any of
    // them, `updatedAt`/`notifiedAt`/`submittedById` aren't either, so
    // there's no reason to pull them for every link on every request.
    select: {
      id: true,
      url: true,
      title: true,
      body: true,
      publishedAt: true,
      categories: { select: { id: true, label: true } },
    },
  });

  return { links };
});
