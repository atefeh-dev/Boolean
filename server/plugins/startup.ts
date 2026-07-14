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

  // Unlike AUTH_SECRET, a missing SMTP config isn't a security hole — it's
  // a functionality gap. mailer.ts already throws the first time something
  // actually tries to send, but that failure is easy to miss if it's
  // buried in a try/catch (welcome emails, password resets). Surfacing it
  // once at boot, in every environment, means it's caught before someone
  // notices "nobody's getting reset emails" days later.
  const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  if (!smtpConfigured) {
    console.warn(
      "\n⚠️  SMTP_HOST/SMTP_USER/SMTP_PASS are not set.\n" +
        "  → Newsletter, welcome, and password-reset emails will fail until they're configured.\n" +
        "  → See .env.example.\n"
    );
  }
});
