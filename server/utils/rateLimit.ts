/**
 * Lightweight in-memory rate limiter for Nitro server routes.
 * Uses a per-key sliding window. Resets on server restart (acceptable for
 * small-scale; swap for Redis in a multi-process deployment).
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Purge expired entries lazily to prevent unbounded memory growth.
// We run this every 50 checks, not on every call, to keep overhead low.
let checkCount = 0;
function maybeCleanup() {
  if (++checkCount % 50 !== 0) return;
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * Returns `true` if the request is within the allowed limit.
 * Returns `false` (and you should throw 429) if the limit is exceeded.
 *
 * @param key        Identifier — e.g. `login:${ip}` or `subscribe:${ip}`
 * @param max        Max requests allowed within the window
 * @param windowMs   Window size in milliseconds
 */
export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  maybeCleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count++;
  return true;
}

/** Convenience: throw H3 429 if rate limit exceeded. */
export function enforceRateLimit(key: string, max: number, windowMs: number) {
  if (!checkRateLimit(key, max, windowMs)) {
    throw createError({
      statusCode: 429,
      statusMessage: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید.",
    });
  }
}

/** Get caller IP, respecting common proxy headers. */
export function getClientIp(event: ReturnType<typeof useEvent>): string {
  return (
    getRequestHeader(event, "x-forwarded-for")?.split(",")[0].trim() ??
    getRequestHeader(event, "x-real-ip") ??
    "unknown"
  );
}
