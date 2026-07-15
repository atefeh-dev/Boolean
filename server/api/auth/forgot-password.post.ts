import { randomBytes } from "node:crypto";
import { forgotPasswordSchema } from "#shared/validation/schemas";

export default defineEventHandler(async (event) => {
  // 3 requests per 15 minutes per IP — prevents email flooding
  enforceRateLimit(`forgot:${getClientIp(event)}`, 3, 15 * 60_000);

  const { email } = await validateBody(event, forgotPasswordSchema);

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
    const { subject, html, text } = buildPasswordResetEmail({ name: user.name, resetUrl });
    await sendMail({ to: user.email, subject, html, text });
  } catch (err) {
    console.error("[auth] reset email failed:", err);
  }

  return { ok: true };
});
