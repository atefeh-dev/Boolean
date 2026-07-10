const MAX_URL    = 2048;
const MAX_TITLE  = 200;
const MAX_BODY   = 500;
const MAX_CREDIT = 100;
const ALLOWED_PROTOCOLS = ["http:", "https:"];

export default defineEventHandler(async (event) => {
  const session = await getVerifiedSessionUser(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "ابتدا وارد شوید." });
  }

  // 20 submissions per hour per user — prevents spam
  enforceRateLimit(`submit:${session.sub}`, 20, 60 * 60_000);

  const body = await readBody<{
    url?: string; title?: string; body?: string;
    credit?: string; categories?: string[];
  }>(event);

  const url      = body.url?.trim().slice(0, MAX_URL);
  const title    = body.title?.trim().slice(0, MAX_TITLE);
  const linkBody = (body.body?.trim() || null)?.slice(0, MAX_BODY) ?? null;
  const credit   = (body.credit?.trim() || null)?.slice(0, MAX_CREDIT) ?? null;
  const categoryIds = Array.from(new Set(body.categories ?? [])).slice(0, 3);

  if (!url || !title) {
    throw createError({ statusCode: 400, statusMessage: "آدرس لینک و عنوان الزامی هستند." });
  }

  // Restrict to http/https — prevents javascript:, file://, data: injection
  let parsed: URL;
  try { parsed = new URL(url); } catch {
    throw createError({ statusCode: 400, statusMessage: "آدرس لینک معتبر نیست." });
  }
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    throw createError({ statusCode: 400, statusMessage: "فقط لینک‌های http و https مجاز هستند." });
  }

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
      body: linkBody,
      credit,
      submittedById: session.sub,
      categories: { connect: categoryIds.map((id) => ({ id })) },
    },
    include: { categories: true },
  });

  return { link };
});
