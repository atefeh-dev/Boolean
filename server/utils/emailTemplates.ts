/**
 * Shared email layout + the transactional emails built on it.
 *
 * Design notes (why this looks the way it does, for whoever touches this
 * next):
 *  - No custom webfonts. Email clients have famously unreliable @font-face
 *    support (Outlook desktop and the Gmail Android app in particular), so
 *    loading Vazirmatn/Newsreader here would silently fail for a chunk of
 *    recipients with no visual fallback control. Instead this leans on the
 *    same *fallback* stacks the app itself already defines for when its
 *    own webfonts fail — Georgia for headings (serif, evokes the same
 *    editorial feel as Newsreader), Tahoma/Segoe UI/Arial for body text.
 *    Every recipient sees the same thing; it just isn't literally Vazirmatn.
 *  - Table-based layout, not flex/grid. This isn't a stylistic choice —
 *    Outlook desktop renders email HTML with Word's engine, which doesn't
 *    support either. Tables are the actual bulletproof-compatible option.
 *  - No images/icons. Avoids the "blocked by default" problem most email
 *    clients apply to remote images (recipient would see broken icons
 *    until they click "show images"), and avoids needing a stable public
 *    URL for the icons in the first place. The brand comes through via
 *    color + typography instead — which also happens to fit "minimal."
 *  - `color-scheme: light` is set explicitly so mail clients that
 *    auto-invert for dark mode don't mangle the brand colors — this is a
 *    light-only template by design, not an oversight.
 */

const COLORS = {
  paper: "#f3f4ef",
  surface: "#ffffff",
  ink: "#1c1f1c",
  inkSoft: "#4f544c",
  inkFaint: "#868c82",
  line: "#dcdfd5",
  forest: "#24483d",
  forestDeep: "#173027",
  clay: "#9c5a3a",
  claySoft: "#e9d8c8",
  gold: "#b08d46",
};

const FONT_BODY = "Tahoma, 'Segoe UI', Arial, sans-serif";
const FONT_HEADING = "Georgia, 'Times New Roman', serif";

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface EmailLayoutOptions {
  preheader: string;
  eyebrow: string;
  heading: string;
  bodyHtml: string; // Trusted — built by the functions below, not from user input.
  ctaLabel: string;
  ctaUrl: string;
  ctaColor?: string;
  footerNote: string;
}

function renderEmailLayout(opts: EmailLayoutOptions) {
  const ctaColor = opts.ctaColor ?? COLORS.forest;

  return `<!DOCTYPE html>
<html dir="rtl" lang="fa" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(opts.heading)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background: ${COLORS.paper}; }
    a { color: ${COLORS.forest}; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .card { padding: 28px 22px !important; }
      .heading { font-size: 22px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:${COLORS.paper};">
  <!-- Preheader: shows in the inbox preview line, hidden in the body -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
    ${escapeHtml(opts.preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.paper};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" class="container" width="520" cellpadding="0" cellspacing="0" style="width:520px; max-width:100%;">

          <!-- Wordmark -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <span style="font-family:${FONT_HEADING}; font-size:22px; font-weight:700; color:${COLORS.forest}; letter-spacing:0.5px;">
                بولتن
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td class="card" style="background:${COLORS.surface}; border:1px solid ${COLORS.line}; border-radius:16px; padding:40px 36px;">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 14px;">
                    <span style="display:inline-block; font-family:${FONT_BODY}; font-size:12px; font-weight:700; letter-spacing:1px; color:${COLORS.gold}; text-transform:uppercase;">
                      ${escapeHtml(opts.eyebrow)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="center" class="heading" style="padding-bottom: 18px; font-family:${FONT_HEADING}; font-size:26px; line-height:1.4; font-weight:700; color:${COLORS.ink};">
                    ${escapeHtml(opts.heading)}
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 30px; font-family:${FONT_BODY}; font-size:15px; line-height:1.9; color:${COLORS.inkSoft};">
                    ${opts.bodyHtml}
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 22px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" bgcolor="${ctaColor}" style="border-radius:999px;">
                          <a href="${opts.ctaUrl}" target="_blank"
                             style="display:inline-block; padding:14px 36px; font-family:${FONT_BODY}; font-size:15px; font-weight:700; color:${COLORS.surface}; text-decoration:none; border-radius:999px;">
                            ${escapeHtml(opts.ctaLabel)}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family:${FONT_BODY}; font-size:12px; line-height:1.8; color:${COLORS.inkFaint}; word-break:break-all;">
                    اگر دکمه بالا کار نکرد، این لینک را در مرورگر خود باز کنید:<br>
                    <a href="${opts.ctaUrl}" target="_blank" style="color:${COLORS.clay};">${opts.ctaUrl}</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 28px 20px 0; font-family:${FONT_BODY}; font-size:12px; line-height:1.8; color:${COLORS.inkFaint};">
              ${opts.footerNote}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 6px 20px 0; font-family:${FONT_BODY}; font-size:12px; color:${COLORS.inkFaint};">
              © ${new Date().getFullYear()} بولتن
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Email confirmation ──────────────────────────────────────────────────

export function buildVerificationEmail(opts: { name: string; verifyUrl: string }) {
  const subject = "تأیید ایمیل — بولتن";
  const name = escapeHtml(opts.name);

  const html = renderEmailLayout({
    preheader: "برای فعال‌سازی کامل حساب، ایمیل خود را تأیید کنید.",
    eyebrow: "تأیید ایمیل",
    heading: `خوش آمدید، ${name}!`,
    bodyHtml: `
      حساب شما در بولتن ساخته شد. برای تکمیل ثبت‌نام و تأیید اینکه این ایمیل متعلق به شماست،
      روی دکمه زیر کلیک کنید.
    `,
    ctaLabel: "تأیید ایمیل",
    ctaUrl: opts.verifyUrl,
    ctaColor: COLORS.forest,
    footerNote:
      "این لینک تا ۴۸ ساعت دیگر معتبر است. اگر شما این حساب را نساخته‌اید، همین ایمیل را نادیده بگیرید — بدون تأیید، هیچ اقدامی روی حساب انجام نمی‌شود.",
  });

  const text = `خوش آمدید، ${opts.name}!

حساب شما در بولتن ساخته شد. برای تأیید ایمیل خود، لینک زیر را باز کنید (تا ۴۸ ساعت معتبر است):

${opts.verifyUrl}

اگر شما این حساب را نساخته‌اید، این ایمیل را نادیده بگیرید.`;

  return { subject, html, text };
}

// ── Forgot password ──────────────────────────────────────────────────────

export function buildPasswordResetEmail(opts: { name: string; resetUrl: string }) {
  const subject = "بازیابی رمز عبور — بولتن";
  const name = escapeHtml(opts.name);

  const html = renderEmailLayout({
    preheader: "درخواست بازیابی رمز عبور برای حساب شما ثبت شد.",
    eyebrow: "بازیابی رمز عبور",
    heading: `سلام ${name}`,
    bodyHtml: `
      درخواست بازیابی رمز عبور برای حساب شما ثبت شد. برای تعیین رمز عبور جدید،
      روی دکمه زیر کلیک کنید.
    `,
    ctaLabel: "بازیابی رمز عبور",
    ctaUrl: opts.resetUrl,
    ctaColor: COLORS.clay,
    footerNote:
      "این لینک تا ۱ ساعت دیگر معتبر است و فقط یک‌بار قابل استفاده است. اگر این درخواست را شما ارسال نکرده‌اید، نگران نباشید — رمز عبور شما تغییر نخواهد کرد؛ کافی است این ایمیل را نادیده بگیرید.",
  });

  const text = `سلام ${opts.name}

درخواست بازیابی رمز عبور برای حساب شما ثبت شد. برای تعیین رمز عبور جدید، لینک زیر را باز کنید (تا ۱ ساعت معتبر است):

${opts.resetUrl}

اگر این درخواست را شما ارسال نکرده‌اید، این ایمیل را نادیده بگیرید — رمز عبور شما تغییر نخواهد کرد.`;

  return { subject, html, text };
}
