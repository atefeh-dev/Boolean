import { resetPasswordSchema } from "#shared/validation/schemas";

export default defineEventHandler(async (event) => {
  enforceRateLimit(`reset:${getClientIp(event)}`, 10, 60 * 60_000);

  const { token, password } = await validateBody(event, resetPasswordSchema);

  // Only fetch fields we need — do NOT include passwordHash or other sensitive data.
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true, usedAt: true },
  });

  if (!record)          throw createError({ statusCode: 400, message: "لینک بازیابی نامعتبر است." });
  if (record.usedAt)    throw createError({ statusCode: 400, message: "این لینک قبلاً استفاده شده است." });
  if (record.expiresAt < new Date()) {
    throw createError({ statusCode: 400, message: "لینک بازیابی منقضی شده است. دوباره درخواست دهید." });
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await tx.passwordResetToken.update({ where: { token }, data: { usedAt: new Date() } });
  });

  return { ok: true };
});
