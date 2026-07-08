const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default defineEventHandler(async (event) => {
  // 5 subscribe attempts per hour per IP
  enforceRateLimit(`subscribe:${getClientIp(event)}`, 5, 60 * 60_000);

  const body  = await readBody<{ email?: string }>(event);
  const email = body.email?.trim().toLowerCase().slice(0, 254);

  if (!email || !EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, statusMessage: "ایمیل معتبر وارد کنید." });
  }

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) return { ok: true, alreadySubscribed: true };

  await prisma.subscriber.create({ data: { email } });

  try {
    await sendMail({
      to: email,
      subject: "خوش آمدید به بولتن",
      text: "از عضویت شما در خبرنامه بولتن خوشحالیم. هر روز کاری، پنج لینک برتر طراحی در صندوق ورودی شما.",
      html: `<div dir="rtl" style="font-family:Tahoma,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#24483d">خوش آمدید به بولتن 👋</h2>
        <p>از عضویت شما خوشحالیم. هر روز کاری، پنج لینک برتر طراحی را برایتان ارسال می‌کنیم.</p>
      </div>`,
    });
  } catch (err) {
    console.error("[newsletter] welcome email failed:", err);
  }

  return { ok: true, alreadySubscribed: false };
});
