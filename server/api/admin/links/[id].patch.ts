interface PatchBody {
  action: "approve" | "reject" | "save";
  edits?: {
    title?: string;
    body?: string;
    credit?: string;
    categories?: string[];
  };
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "شناسه لینک الزامی است." });
  }

  const body = await readBody<PatchBody>(event);
  if (!["approve", "reject", "save"].includes(body.action ?? "")) {
    throw createError({ statusCode: 400, message: "عملیات نامعتبر است." });
  }

  const existing = await prisma.link.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    throw createError({ statusCode: 404, message: "لینک پیدا نشد." });
  }

  // ── Approve / Reject — only touch status fields, nothing else ──────────
  if (body.action === "approve" || body.action === "reject") {
    const link = await prisma.link.update({
      where: { id },
      data:
        body.action === "approve"
          ? { status: "PUBLISHED", publishedAt: new Date() }
          : { status: "REJECTED" },
      include: { categories: true },
    });
    return { link };
  }

  // ── Save (edit fields only, status unchanged) ──────────────────────────
  const edits = body.edits ?? {};

  const title = edits.title?.trim();
  if (edits.title !== undefined && !title) {
    throw createError({ statusCode: 400, message: "عنوان نمی‌تواند خالی باشد." });
  }

  // An empty array is still truthy in JS, so `edits.categories !== undefined`
  // alone isn't enough here — it would also pass for "user cleared every
  // category". Only build the { set: [...] } update when there's at least
  // one id, otherwise a save with no categories selected would disconnect
  // ALL category relations from the link instead of being a no-op.
  let categoryUpdate: { set: { id: string }[] } | undefined;
  if (edits.categories !== undefined && edits.categories.length > 0) {
    const categoryIds = Array.from(new Set(edits.categories)).slice(0, 3);
    const found = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });
    if (found.length !== categoryIds.length) {
      throw createError({
        statusCode: 400,
        message: "یکی از دسته‌بندی‌های انتخاب‌شده نامعتبر است.",
      });
    }
    categoryUpdate = { set: categoryIds.map((cid) => ({ id: cid })) };
  }

  const link = await prisma.link.update({
    where: { id },
    data: {
      ...(title ? { title } : {}),
      ...(edits.body !== undefined ? { body: edits.body.trim() || null } : {}),
      ...(edits.credit !== undefined ? { credit: edits.credit.trim() || null } : {}),
      ...(categoryUpdate ? { categories: categoryUpdate } : {}),
    },
    include: { categories: true },
  });

  return { link };
});
