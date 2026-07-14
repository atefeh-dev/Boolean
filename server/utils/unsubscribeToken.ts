import { SignJWT, jwtVerify } from "jose";
import type { H3Event } from "h3";

/**
 * Signed, stateless tokens that identify a subscriber by email — used so
 * the unsubscribe link inside an email can work on its own, without the
 * recipient being logged in. This matters because `Subscriber.userId` is
 * nullable: anyone who subscribed via the public form without an account
 * has no session to authenticate with, so the existing session-based
 * unsubscribe endpoint can never reach them. A signed token sidesteps that
 * entirely — possession of the (unguessable) token in *their* email is the
 * proof of identity.
 *
 * No expiration is set on purpose: an unsubscribe link that stops working
 * after N days just means the person who dug an old newsletter out of
 * their archive six months from now can't opt out, which is the opposite
 * of what we want here.
 */

const PURPOSE = "unsubscribe";

function getSecretKey(event: H3Event) {
  const { authSecret } = useRuntimeConfig(event);
  return new TextEncoder().encode(authSecret);
}

export async function createUnsubscribeToken(event: H3Event, email: string) {
  return new SignJWT({ purpose: PURPOSE, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(getSecretKey(event));
}

/** Returns the subscriber's email if the token is valid, otherwise null. */
export async function verifyUnsubscribeToken(
  event: H3Event,
  token: string
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(event));
    if (payload.purpose !== PURPOSE || typeof payload.email !== "string") return null;
    return payload.email;
  } catch {
    return null;
  }
}
