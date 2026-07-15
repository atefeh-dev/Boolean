import { randomBytes } from "node:crypto";
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

  // Best-effort, same as the password reset email — a transient SMTP
  // hiccup shouldn't fail registration itself (the account is already
  // created and the session already set above). Worst case, the person
  // just doesn't get a confirmation email this one time.
  try {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 48 * 3_600_000); // 48 hours

    await prisma.emailVerificationToken.create({ data: { token, userId: user.id, expiresAt } });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    const { subject, html, text } = buildVerificationEmail({ name: user.name, verifyUrl });
    await sendMail({ to: user.email, subject, html, text });
  } catch (err) {
    console.error("[auth] verification email failed:", err);
  }

  return {
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role,
      subscribed: !!subscriber, emailVerified: false,
    },
  };
});
