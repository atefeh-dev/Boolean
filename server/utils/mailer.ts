import nodemailer from "nodemailer";

// Typed as the generic Transporter (not `ReturnType<typeof createTransport>`,
// which resolves against a specific overload) since createTransport's actual
// return type here depends on the `pool: true` option below — pinning the
// variable to the generic type keeps that assignment valid either way.
let cachedTransporter: nodemailer.Transporter | null = null;

/**
 * One SMTP transporter, configured purely from env vars — so swapping from
 * a trial provider (Ethereal/Gmail) to a self-hosted GCP mail server later
 * is just a .env change, no code change.
 */
function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP_HOST/SMTP_USER/SMTP_PASS are not set — see .env.example for a quick Ethereal trial setup."
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    // Reuse a small pool of connections instead of opening a fresh one per
    // message. Barely matters for one-off transactional emails (welcome,
    // reset), but the newsletter send loops over every subscriber — without
    // pooling that's one TCP+TLS+auth handshake per recipient, which is
    // slow and the kind of pattern SMTP providers rate-limit or flag.
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });

  return cachedTransporter;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  // Extra raw headers — e.g. List-Unsubscribe / List-Unsubscribe-Post for
  // the newsletter, so mailbox providers can show their native "Unsubscribe"
  // affordance instead of relying solely on a link in the body.
  headers?: Record<string, string>;
}) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || '"سایدبار" <hello@sidebar.fa>';

  const info = await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    headers: opts.headers,
  });

  // Ethereal gives back a preview URL instead of actually delivering —
  // handy during the trial, harmless to log in other environments since
  // it's just undefined there.
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[mailer] Ethereal preview: ${previewUrl}`);
  }

  return info;
}
