const MAX_LINKS = 5;

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = await readBody<{ linkIds?: string[] }>(event);
  const linkIds = body.linkIds ?? [];

  if (!Array.isArray(linkIds) || linkIds.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "حداقل یک لینک را انتخاب کنید." });
  }

  if (linkIds.length > MAX_LINKS) {
    throw createError({ statusCode: 400, statusMessage: `حداکثر ${MAX_LINKS} لینک در هر شماره خبرنامه مجاز است.` });
  }

  // Verify all selected links exist, are published, and haven't been notified yet.
  const links = await prisma.link.findMany({
    where: {
      id: { in: linkIds },
      status: "PUBLISHED",
      notifiedAt: null,
    },
    select: { id: true, title: true, url: true, body: true },
  });

  if (links.length !== linkIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "برخی لینک‌های انتخاب‌شده معتبر نیستند یا قبلاً ارسال شده‌اند.",
    });
  }

  const subscribers = await prisma.subscriber.findMany({ select: { email: true } });
  if (subscribers.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "هیچ مشترکی وجود ندارد." });
  }

  const { html, text } = buildDigestEmail(links);

  const failures: string[] = [];
  for (const sub of subscribers) {
    try {
      await sendMail({
        to: sub.email,
        subject: "بولتن — لینک‌های این هفته",
        html,
        text,
      });
    } catch (err) {
      console.error(`[newsletter] failed for ${sub.email}:`, err);
      failures.push(sub.email);
    }
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.link.updateMany({
      where: { id: { in: links.map((l) => l.id) } },
      data: { notifiedAt: now },
    });
    await tx.newsletterSend.create({
      data: { recipients: subscribers.length - failures.length, linkCount: links.length },
    });
  });

  return {
    ok: true,
    sent: subscribers.length - failures.length,
    failed: failures.length,
    linkCount: links.length,
  };
});
