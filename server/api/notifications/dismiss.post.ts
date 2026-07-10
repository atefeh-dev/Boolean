/**
 * Permanently dismisses a single notification for the current user by
 * recording its derived id (e.g. "pending:<linkId>") in
 * NotificationDismissal. GET /api/notifications filters these out, so a
 * dismissed notification stays gone across refreshes and devices — unlike
 * "read", which just changes how it looks, dismiss removes it from the
 * feed entirely until the underlying Link changes state again (which
 * produces a new, distinct notification id).
 */
export default defineEventHandler(async (event) => {
  const session = await getVerifiedSessionUser(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "ابتدا وارد شوید." });
  }

  const body = await readBody<{ id?: string }>(event).catch(() => null);
  const notificationId = body?.id?.trim();
  if (!notificationId) {
    throw createError({ statusCode: 400, statusMessage: "شناسه اعلان الزامی است." });
  }

  try {
    await prisma.notificationDismissal.upsert({
      where: { userId_notificationId: { userId: session.sub, notificationId } },
      create: { userId: session.sub, notificationId },
      // Already dismissed — no-op update, just confirms success.
      update: {},
    });
    return { ok: true };
  } catch (err) {
    logNotificationsSchemaDrift("couldn't persist dismissal", err);
    throw createError({ statusCode: 500, statusMessage: "حذف اعلان با خطا مواجه شد." });
  }
});
