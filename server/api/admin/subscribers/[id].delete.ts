export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "شناسه مشترک الزامی است." });
  }

  const existing = await prisma.subscriber.findUnique({ where: { id } });
  if (!existing) {
    throw createError({ statusCode: 404, message: "مشترک پیدا نشد." });
  }

  await prisma.subscriber.delete({ where: { id } });
  return { ok: true };
});
