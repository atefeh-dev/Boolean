import { randomBytes } from "node:crypto";
import { registerSchema } from "#shared/validation/schemas";

export default defineEventHandler(async (event) => {
  // 10 registrations per hour per IP
  enforceRateLimit(`register:${getClientIp(event)}`, 10, 60 * 60_000);

  const { name, email, password } = await validateBody(event, registerSchema);

  // These two are independent of each other — hashing doesn't need to know
  // yet whether the email is taken — so run them concurrently instead of
  // paying for both round trips back to back. (Can't go further than this:
  // creating the user genuinely has to wait for both — bcrypt result to
  // store, and the existence check to know whether to proceed at all.)
  const [existing, passwordHash] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    hashPassword(password),
  ]);
  if (existing) {
    throw createError({ statusCode: 409, message: "این ایمیل قبلاً ثبت شده است." });
  }

  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  // No createSessionCookie here, deliberately — login is now gated on
  // emailVerifiedAt (see login.post.ts), so starting a session at this
  // point would just be a session nobody can use for anything that
  // actually checks verification later, and would make the register page
  // look like it succeeded into a logged-in state when it didn't.

  // Same email could already be on the newsletter list anonymously.
  const subscriber = await prisma.subscriber.findUnique({ where: { email: user.email } });
  if (subscriber && subscriber.userId !== user.id) {
    await prisma.subscriber.update({ where: { email: user.email }, data: { userId: user.id } });
  }

  // Best-effort — a transient SMTP hiccup shouldn't fail registration
  // itself (the account is already created above). Worst case, the
  // person doesn't get the email this one time and uses "resend" on the
  // login page once they try to sign in.
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

  return { ok: true };
});
