export default defineEventHandler(async (event) => {
  // 5 unsubscribe attempts per hour per IP — same guard as subscribe, this
  // endpoint isn't spam-sensitive but there's no reason to leave it
  // unbounded either.
  enforceRateLimit(`unsubscribe:${getClientIp(event)}`, 5, 60 * 60_000);

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
