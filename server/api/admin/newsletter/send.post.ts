const MAX_LINKS = 5;

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = await readBody<{ linkIds?: string[] }>(event);
  const linkIds = body.linkIds ?? [];

  if (!Array.isArray(linkIds) || linkIds.length === 0) {
    throw createError({ statusCode: 400, message: "حداقل یک لینک را انتخاب کنید." });
  }

  if (linkIds.length > MAX_LINKS) {
    throw createError({ statusCode: 400, message: `حداکثر ${MAX_LINKS} لینک در هر شماره خبرنامه مجاز است.` });
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
      message: "برخی لینک‌های انتخاب‌شده معتبر نیستند یا قبلاً ارسال شده‌اند.",
    });
  }

  const subscribers = await prisma.subscriber.findMany({ select: { email: true } });
  if (subscribers.length === 0) {
    throw createError({ statusCode: 400, message: "هیچ مشترکی وجود ندارد." });
  }

  const appUrl = process.env.APP_URL || "http://localhost:3000";

  // Built once — identical for every recipient, only the unsubscribe URL
  // varies per subscriber (see wrapDigestEmail below). Previously this
  // was rebuilt from scratch inside the loop, once per subscriber.
  const digestContent = buildDigestContent(links);

  // Sent in bounded batches rather than fully sequentially (which, at
  // even a few hundred ms per SMTP round trip, turns a few thousand
  // subscribers into several minutes inside a single HTTP request — risking
  // a gateway/proxy timeout well before it finishes) or fully unbounded in
  // parallel (which can trip most SMTP providers' concurrent-connection
  // limits). 8 concurrent sends is a conservative default; raise it if
  // your SMTP provider comfortably allows more concurrent connections.
  const SEND_CONCURRENCY = 8;
  const failures: string[] = [];

  for (let i = 0; i < subscribers.length; i += SEND_CONCURRENCY) {
    const batch = subscribers.slice(i, i + SEND_CONCURRENCY);
    await Promise.all(
      batch.map(async (sub) => {
        try {
          // Per-subscriber token so the unsubscribe link (both the one in
          // the body and the List-Unsubscribe header) identifies this
          // exact subscriber without them needing to be logged in.
          const token = await createUnsubscribeToken(event, sub.email);
          const unsubscribeUrl = `${appUrl}/unsubscribe?token=${token}`;
          const { html, text } = wrapDigestEmail(digestContent, unsubscribeUrl);

          await sendMail({
            to: sub.email,
            subject: "بولتن — لینک‌های این هفته",
            html,
            text,
            headers: {
              // RFC 8058 one-click unsubscribe — lets Gmail/Outlook/etc. show
              // their native "Unsubscribe" button next to the sender name.
              "List-Unsubscribe": `<${appUrl}/api/newsletter/unsubscribe-link?token=${token}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          });
        } catch (err) {
          console.error(`[newsletter] failed for ${sub.email}:`, err);
          failures.push(sub.email);
        }
      })
    );
  }

  // A fully failed run means something is wrong with the mail service
  // itself (bad creds, wrong host/port, provider outage) — not "we sent it
  // and a few addresses bounced". Marking links as notified here would
  // silently bury this issue's newsletter: notifiedAt gets filtered out of
  // future send candidates, so there'd be no way to pick these links again
  // once the mail service is actually working.
  if (failures.length === subscribers.length) {
    throw createError({
      statusCode: 502,
      message: "ارسال به هیچ مشترکی موفق نبود. تنظیمات سرویس ایمیل را بررسی کنید.",
    });
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
