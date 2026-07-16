import { submitLinkSchema } from "#shared/validation/schemas";

export default defineEventHandler(async (event) => {
  const session = await getVerifiedSessionUser(event);
  if (!session) {
    throw createError({ statusCode: 401, message: "ابتدا وارد شوید." });
  }

  // getVerifiedSessionUser only confirms the account still exists — it
  // doesn't check verification status, since most session-gated endpoints
  // (notifications, unsubscribe, ...) don't need to. Submitting a link
  // does, so that's checked here specifically rather than baked into the
  // shared helper. 403 (not 401) so the client can tell "not logged in"
  // apart from "logged in, but not verified yet" and show the right UI
  // for each instead of just bouncing to /login either way.
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { emailVerifiedAt: true },
  });
  if (!user?.emailVerifiedAt) {
    throw createError({
      statusCode: 403,
      message: "شما باید پیش از ارسال لینک، ایمیل خود را تأیید کنید. لطفاً ایمیل خود را بررسی کرده و از لینک تأییدی که برایتان ارسال شده استفاده کنید.",
    });
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
      throw createError({ statusCode: 400, message: "یکی از دسته‌بندی‌های انتخاب‌شده نامعتبر است." });
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
