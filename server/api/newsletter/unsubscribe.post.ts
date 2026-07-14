import { unsubscribeTokenSchema } from "#shared/validation/schemas";

export default defineEventHandler(async (event) => {
  // 5 unsubscribe attempts per hour per IP — same guard as subscribe, this
  // endpoint isn't spam-sensitive but there's no reason to leave it
  // unbounded either.
  enforceRateLimit(`unsubscribe:${getClientIp(event)}`, 5, 60 * 60_000);

  const body = await readBody<{ token?: string }>(event).catch(() => ({}) as { token?: string });

  // Token path: the "لغو عضویت" link inside the newsletter email itself.
  // This has to work without a session — Subscriber.userId is nullable, so
  // anyone who subscribed anonymously (no account) has no session to
  // authenticate with, and would otherwise have no way to unsubscribe at
  // all. Possession of the signed, subscriber-specific token is the proof
  // of identity instead.
  if (body?.token) {
    const parsed = unsubscribeTokenSchema.safeParse(body);
    if (!parsed.success) {
      throw createError({ statusCode: 400, message: "توکن نامعتبر است." });
    }

    const email = await verifyUnsubscribeToken(event, parsed.data.token);
    if (!email) {
      throw createError({ statusCode: 400, message: "این لینک نامعتبر است." });
    }

    try {
      await prisma.subscriber.deleteMany({ where: { email } });
    } catch (err) {
      console.error(`[newsletter] token unsubscribe failed — ${diagnosePrismaSchemaDrift(err)}`, err);
      throw createError({ statusCode: 500, message: "مشکلی پیش آمد. دوباره تلاش کنید." });
    }

    return { ok: true };
  }

  // Session path: unchanged — the in-app "لغو عضویت" modal for a logged-in
  // account, keyed off userId rather than email.
  const session = await getVerifiedSessionUser(event);
  if (!session) {
    throw createError({ statusCode: 401, message: "لطفاً ابتدا وارد حساب کاربری خود شوید." });
  }

  try {
    // deleteMany (not delete) so this is idempotent: if the account was
    // already unsubscribed (e.g. a second tab, or a stale UI state), this
    // is a harmless no-op instead of a 500 for a row that isn't there.
    await prisma.subscriber.deleteMany({ where: { userId: session.sub } });
  } catch (err) {
    console.error(`[newsletter] unsubscribe failed — ${diagnosePrismaSchemaDrift(err)}`, err);
    throw createError({ statusCode: 500, message: "مشکلی پیش آمد. دوباره تلاش کنید." });
  }

  return { ok: true };
});
