/**
 * Marks all current notifications as read by advancing the user's
 * `lastNotificationsReadAt` watermark to now. Called when the notifications
 * panel is opened (see NotificationsBell.vue).
 */
export default defineEventHandler(async (event) => {
  const session = await getVerifiedSessionUser(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "ابتدا وارد شوید." });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.sub },
      data: { lastNotificationsReadAt: new Date() },
      select: { lastNotificationsReadAt: true },
    });
    return { lastNotificationsReadAt: updated.lastNotificationsReadAt };
  } catch (err) {
    logNotificationsSchemaDrift("couldn't persist lastNotificationsReadAt", err);
    throw createError({ statusCode: 500, statusMessage: "ثبت وضعیت خوانده‌شده با خطا مواجه شد." });
  }
});
