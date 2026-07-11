import { submitLinkSchema } from "#shared/validation/schemas";

export default defineEventHandler(async (event) => {
  const session = await getVerifiedSessionUser(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "ابتدا وارد شوید." });
  }

  // 20 submissions per hour per user — prevents spam
  enforceRateLimit(`submit:${session.sub}`, 20, 60 * 60_000);

  const { url, title, body, credit, categories } = await validateBody(event, submitLinkSchema);
  const categoryIds = Array.from(new Set(categories)).slice(0, 3);

  // Format/protocol is already verified by the schema — this just gets us
  // the normalized href to store.
  const parsed = new URL(url);

  if (categoryIds.length > 0) {
    const found = await prisma.category.findMany({
      where: { id: { in: categoryIds } }, select: { id: true },
    });
    if (found.length !== categoryIds.length) {
      throw createError({ statusCode: 400, statusMessage: "یکی از دسته‌بندی‌های انتخاب‌شده نامعتبر است." });
    }
  }

  const link = await prisma.link.create({
    data: {
      url: parsed.href, // use normalized URL from URL parser
      title,
      body: body || null,
      credit: credit || null,
      submittedById: session.sub,
      categories: { connect: categoryIds.map((id) => ({ id })) },
    },
    include: { categories: true },
  });

  return { link };
});
