import { unsubscribeTokenSchema } from "#shared/validation/schemas";

/**
 * Target for the `List-Unsubscribe` / `List-Unsubscribe-Post` headers
 * (RFC 8058) set on every newsletter send. Mailbox providers (Gmail,
 * Outlook, ...) call this directly — a plain POST, no cookies, no page
 * render — when someone taps the built-in "Unsubscribe" affordance next to
 * the sender name, instead of opening anything.
 *
 * Identity comes entirely from the signed `token` query param embedded in
 * the header at send time, so this works for anonymous subscribers too.
 * Deliberately not rate-limited by IP: these hits come from mail-provider
 * infrastructure shared across many recipients, not from one person's
 * browser, and the signed token is already the access control — nothing
 * useful to brute-force without it.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const parsed = unsubscribeTokenSchema.safeParse({ token: query.token });
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: "Missing or invalid token" });
  }

  const email = await verifyUnsubscribeToken(event, parsed.data.token);
  if (!email) {
    throw createError({ statusCode: 400, message: "Invalid or expired token" });
  }

  await prisma.subscriber.deleteMany({ where: { email } });

  return { ok: true };
});
