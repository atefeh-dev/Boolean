import { randomBytes } from "node:crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default defineEventHandler(async (event) => {
  // 3 requests per 15 minutes per IP — prevents email flooding
  enforceRateLimit(`forgot:${getClientIp(event)}`, 3, 15 * 60_000);

  const body  = await readBody<{ email?: string }>(event);
  const email = body.email?.trim().toLowerCase().slice(0, 254);

  if (!email || !EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, statusMessage: "ایمیل معتبر وارد کنید." });
  }

  // Always return the same response — prevents user enumeration.
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: true };

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

  const token     = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3_600_000); // 1 hour

  await prisma.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } });

  const appUrl   = process.env.APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  try {
    await sendMail({
      to: user.email,
      subject: "بازیابی رمز عبور — بولتن",
      text: `برای بازیابی رمز عبور روی لینک زیر کلیک کنید (۱ ساعت معتبر است):\n\n${resetUrl}`,
      html: `<div dir="rtl" style="font-family:Tahoma,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#24483d">بازیابی رمز عبور</h2>
        <p>درخواست بازیابی رمز عبور برای حساب شما ثبت شد.</p>
        <p style="margin:24px 0">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#24483d;color:#fff;border-radius:999px;text-decoration:none;font-weight:700">
            بازیابی رمز عبور
          </a>
        </p>
        <p style="font-size:13px;color:#958878">
          این لینک تا ۱ ساعت دیگر معتبر است.<br>
          اگر این درخواست را شما ارسال نکرده‌اید، این ایمیل را نادیده بگیرید.
        </p>
      </div>`,
    });
  } catch (err) {
    console.error("[auth] reset email failed:", err);
  }

  return { ok: true };
});
