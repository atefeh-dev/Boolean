import { registerSchema } from "#shared/validation/schemas";

export default defineEventHandler(async (event) => {
  // 10 registrations per hour per IP
  enforceRateLimit(`register:${getClientIp(event)}`, 10, 60 * 60_000);

  const { name, email, password } = await validateBody(event, registerSchema);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw createError({ statusCode: 409, message: "این ایمیل قبلاً ثبت شده است." });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  await createSessionCookie(event, {
    sub: user.id, email: user.email, name: user.name, role: user.role,
  });

  // Same email could already be on the newsletter list anonymously.
  const subscriber = await prisma.subscriber.findUnique({ where: { email: user.email } });
  if (subscriber && subscriber.userId !== user.id) {
    await prisma.subscriber.update({ where: { email: user.email }, data: { userId: user.id } });
  }

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, subscribed: !!subscriber },
  };
});
