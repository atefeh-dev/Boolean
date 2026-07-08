export default defineNitroPlugin(() => {
  const secret = process.env.AUTH_SECRET;
  const isInsecureFallback = !secret || secret === "dev-only-insecure-secret";

  if (isInsecureFallback) {
    const msg =
      "[SECURITY] AUTH_SECRET is not set or uses the insecure default value.\n" +
      "  → Set AUTH_SECRET to a strong random string (32+ chars) in your environment.\n" +
      "  → Example: openssl rand -base64 32";

    if (process.env.NODE_ENV === "production") {
      // Hard-fail in production — an unset secret means ALL sessions can be forged.
      throw new Error(msg);
    }
    // Warn loudly in dev so it's not overlooked.
    console.warn("\n⚠️  " + msg + "\n");
  }
});
