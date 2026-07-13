import { Prisma } from "@prisma/client";
import { subscribeSchema } from "#shared/validation/schemas";

export default defineEventHandler(async (event) => {
  // 5 subscribe attempts per hour per IP
  enforceRateLimit(`subscribe:${getClientIp(event)}`, 5, 60 * 60_000);

  const { email } = await validateBody(event, subscribeSchema);

  const session = await getVerifiedSessionUser(event);
  // A logged-in person can subscribe an email that isn't their own account
  // (e.g. admin testing, or a work address) — that must NOT attach the
  // subscription to their account. Only link/claim when they're subscribing
  // their own login email.
  const isOwnEmail = !!session && session.email.toLowerCase() === email;

  let alreadySubscribed = false;

  try {
    const existing = await prisma.subscriber.findUnique({ where: { email } });

    if (existing) {
      alreadySubscribed = true;
      // Claim an anonymous subscription for the logged-in account so it's
      // recognized on other browsers/devices from now on — but only if
      // this really is that account's own email, and only if it isn't
      // already claimed by someone else's account.
      if (isOwnEmail && existing.userId !== session!.sub) {
        await prisma.subscriber.update({
          where: { email },
          data: { userId: session!.sub },
        });
      }
    } else {
      try {
        await prisma.subscriber.create({
          data: { email, userId: isOwnEmail ? session!.sub : null },
        });
      } catch (err) {
        // Two near-simultaneous submits for the same email — two open
        // tabs, a slow network causing a retry — can both pass the
        // findUnique check above before either INSERT actually commits.
        // The `email` unique constraint then rejects the loser with
        // P2002. That's not a real failure: the email IS subscribed (by
        // the other request that won the race), so treat it exactly
        // like "already subscribed" instead of surfacing a raw 500 to
        // someone who, from their perspective, just succeeded.
        const isDuplicateEmail =
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002" &&
          (err.meta?.target as string[] | undefined)?.includes("email");
        if (!isDuplicateEmail) throw err;

        alreadySubscribed = true;
        if (isOwnEmail) {
          // Re-fetch rather than blindly overwrite: don't stomp on a
          // userId the winning request may have already set.
          const winner = await prisma.subscriber.findUnique({ where: { email } });
          if (winner && winner.userId !== session!.sub) {
            await prisma.subscriber.update({
              where: { email },
              data: { userId: session!.sub },
            });
          }
        }
      }
    }
  } catch (err) {
    console.error(`[newsletter] subscribe failed — ${diagnosePrismaSchemaDrift(err)}`, err);
    throw createError({ statusCode: 500, message: "مشکلی پیش آمد. دوباره تلاش کنید." });
  }

  if (alreadySubscribed) {
    return { ok: true, alreadySubscribed: true };
  }

  try {
    await sendMail({
      to: email,
      subject: "خوش آمدید به بولتن",
      text: "از عضویت شما در خبرنامه بولتن خوشحالیم. هر روز کاری، پنج لینک برتر طراحی در صندوق ورودی شما.",
      html: `<div dir="rtl" style="font-family:Tahoma,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#24483d">خوش آمدید به بولتن 👋</h2>
        <p>از عضویت شما خوشحالیم. هر روز کاری، پنج لینک برتر طراحی را برایتان ارسال می‌کنیم.</p>
      </div>`,
    });
  } catch (err) {
    console.error("[newsletter] welcome email failed:", err);
  }

  return { ok: true, alreadySubscribed: false };
});
