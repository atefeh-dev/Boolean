import { randomBytes } from "node:crypto";
import { resendVerificationSchema } from "#shared/validation/schemas";

export default defineEventHandler(async (event) => {
  // 3 requests per 15 minutes per IP — same limit as forgot-password,
  // same reason: prevents using this to flood someone else's inbox.
  enforceRateLimit(`resend-verify:${getClientIp(event)}`, 3, 15 * 60_000);

  const { email } = await validateBody(event, resendVerificationSchema);

  // Always return the same response — prevents user enumeration (same
  // reasoning as forgot-password.post.ts).
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerifiedAt) return { ok: true };

  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id, usedAt: null } });

  const token     = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 3_600_000); // 48 hours

  await prisma.emailVerificationToken.create({ data: { token, userId: user.id, expiresAt } });

  const appUrl   = process.env.APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;

  try {
    const { subject, html, text } = buildVerificationEmail({ name: user.name, verifyUrl });
    await sendMail({ to: user.email, subject, html, text });
  } catch (err) {
    console.error("[auth] resend verification email failed:", err);
  }

  return { ok: true };
});
