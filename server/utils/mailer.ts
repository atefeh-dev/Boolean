import nodemailer from "nodemailer";

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

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
  });

  return cachedTransporter;
}

export async function sendMail(opts: { to: string; subject: string; html: string; text: string }) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || '"سایدبار" <hello@sidebar.fa>';

  const info = await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
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
