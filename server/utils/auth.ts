import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { H3Event } from "h3";

export const SESSION_COOKIE = "sidebar_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

export interface SessionPayload {
  sub: string; // user id
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

function getSecretKey(event: H3Event) {
  const { authSecret } = useRuntimeConfig(event);
  return new TextEncoder().encode(authSecret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionCookie(
  event: H3Event,
  payload: SessionPayload
) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey(event));

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    // "strict" prevents the cookie from being sent on any cross-site request,
    // including top-level navigations from external sites — eliminates CSRF risk.
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: "/" });
}

/**
 * Reads + verifies the session cookie on the current request.
 * Returns null if there's no session or it's invalid/expired.
 */
export async function getSessionUser(
  event: H3Event
): Promise<SessionPayload | null> {
  const token = getCookie(event, SESSION_COOKIE);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(event));
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Like getSessionUser, but also confirms the account still exists in the
 * DB rather than trusting the JWT claim blindly.
 *
 * The session cookie is a stateless, signed token valid for 30 days — its
 * signature stays valid even if the account it points to is later deleted
 * (or the dev DB gets reset/reseeded, which is common enough locally).
 * Any endpoint that only *reads* the session (e.g. "is someone logged in,
 * show their name") is fine with the cheap getSessionUser. But anything
 * that *writes* using session.sub as a foreign key — like linking a
 * newsletter subscription to userId — will hit a foreign key constraint
 * violation if that id no longer exists, and that's an ugly, opaque 500
 * for the one visitor unlucky enough to be carrying a stale cookie.
 *
 * This clears the dead cookie as a side effect when the account is gone,
 * so the browser stops presenting an invalid session on every subsequent
 * request instead of failing the same way forever.
 */
export async function getVerifiedSessionUser(
  event: H3Event
): Promise<SessionPayload | null> {
  const session = await getSessionUser(event);
  if (!session) return null;

  const exists = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true },
  });
  if (!exists) {
    clearSessionCookie(event);
    return null;
  }
  return session;
}
export function toPublicUser(user: SessionPayload): PublicUser {
  return {
    id: user.sub,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
