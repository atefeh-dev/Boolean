import type { H3Event } from "h3";
import type { ZodType, z } from "zod";

/**
 * Reads the request body and validates it against a Zod schema. Throws the
 * same createError({ statusCode: 400, statusMessage }) shape every other
 * route already uses, so the client's single top-level error banner keeps
 * working unchanged — only the validation logic itself moved into the
 * shared schema.
 */
export async function validateBody<S extends ZodType>(
  event: H3Event,
  schema: S
): Promise<z.infer<S>> {
  const body = await readBody(event);
  const result = schema.safeParse(body);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "اطلاعات ارسالی نامعتبر است.";
    throw createError({ statusCode: 400, statusMessage: message });
  }

  return result.data;
}
