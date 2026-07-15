import { verifyEmailSchema } from "#shared/validation/schemas";

export default defineEventHandler(async (event) => {
  enforceRateLimit(`verify-email:${getClientIp(event)}`, 10, 60 * 60_000);

  const { token } = await validateBody(event, verifyEmailSchema);

  // Only fetch fields we need — do NOT include passwordHash or other sensitive data.
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true, usedAt: true },
  });

  if (!record)       throw createError({ statusCode: 400, message: "لینک تأیید نامعتبر است." });
  if (record.usedAt) throw createError({ statusCode: 400, message: "این ایمیل قبلاً تأیید شده است." });
  if (record.expiresAt < new Date()) {
    throw createError({ statusCode: 400, message: "لینک تأیید منقضی شده است." });
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } });
    await tx.emailVerificationToken.update({ where: { token }, data: { usedAt: new Date() } });
  });

  return { ok: true };
});
