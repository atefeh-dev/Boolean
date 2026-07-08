import type { H3Event } from "h3";

export async function requireAdmin(event: H3Event) {
  const session = await getSessionUser(event);
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "ابتدا وارد شوید." });
  }
  if (session.role !== "ADMIN") {
    throw createError({ statusCode: 403, statusMessage: "دسترسی غیرمجاز." });
  }
  return session;
}
