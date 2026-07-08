const MIN_PW = 8;
const MAX_PW = 128;

export default defineEventHandler(async (event) => {
  enforceRateLimit(`reset:${getClientIp(event)}`, 10, 60 * 60_000);

  const body     = await readBody<{ token?: string; password?: string }>(event);
  const token    = body.token?.trim();
  const password = body.password ?? "";

  if (!token || !password) {
    throw createError({ statusCode: 400, statusMessage: "توکن و رمز عبور الزامی هستند." });
  }
  if (password.length < MIN_PW) {
    throw createError({ statusCode: 400, statusMessage: `رمز عبور باید حداقل ${MIN_PW} کاراکتر باشد.` });
  }
  if (password.length > MAX_PW) {
    throw createError({ statusCode: 400, statusMessage: "رمز عبور بیش از حد طولانی است." });
  }

  // Only fetch fields we need — do NOT include passwordHash or other sensitive data.
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true, usedAt: true },
  });

  if (!record)          throw createError({ statusCode: 400, statusMessage: "لینک بازیابی نامعتبر است." });
  if (record.usedAt)    throw createError({ statusCode: 400, statusMessage: "این لینک قبلاً استفاده شده است." });
  if (record.expiresAt < new Date()) {
    throw createError({ statusCode: 400, statusMessage: "لینک بازیابی منقضی شده است. دوباره درخواست دهید." });
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await tx.passwordResetToken.update({ where: { token }, data: { usedAt: new Date() } });
  });

  return { ok: true };
});
