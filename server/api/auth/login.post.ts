import { loginSchema } from "#shared/validation/schemas";

export default defineEventHandler(async (event) => {
  // 5 attempts per 15 minutes per IP
  enforceRateLimit(`login:${getClientIp(event)}`, 5, 15 * 60_000);

  const { email, password } = await validateBody(event, loginSchema);

  // Timing-safe: always run bcrypt even when user not found, to prevent
  // user-enumeration via response-time differences.
  const user = await prisma.user.findUnique({ where: { email } });
  const dummyHash = "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345";
  const valid = user
    ? await verifyPassword(password, user.passwordHash)
    : (await verifyPassword(password, dummyHash), false);

  if (!user || !valid) {
    throw createError({ statusCode: 401, statusMessage: "ایمیل یا رمز عبور اشتباه است." });
  }

  await createSessionCookie(event, {
    sub: user.id, email: user.email, name: user.name, role: user.role,
  });

  // If this email was subscribed anonymously before the account existed
  // (or from another browser), attach it to the account now.
  const subscriber = await prisma.subscriber.findUnique({ where: { email: user.email } });
  if (subscriber && subscriber.userId !== user.id) {
    await prisma.subscriber.update({ where: { email: user.email }, data: { userId: user.id } });
  }

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, subscribed: !!subscriber },
  };
});
