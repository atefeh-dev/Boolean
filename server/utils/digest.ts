interface DigestLink {
  title: string;
  url: string;
  body: string | null;
}

export function buildDigestEmail(links: DigestLink[]) {
  const itemsHtml = links
    .map(
      (l) => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #e8ddca;">
            <a href="${l.url}" style="font-size: 16px; font-weight: 700; color: #211d17; text-decoration: none;">
              ${escapeHtml(l.title)}
            </a>
            ${l.body ? `<p style="margin: 6px 0 0; font-size: 14px; color: #5a5146;">${escapeHtml(l.body)}</p>` : ""}
          </td>
        </tr>`
    )
    .join("");

  const html = `<div dir="rtl" style="font-family: Tahoma, sans-serif; max-width: 560px; margin: 0 auto;">
    <h2 style="color: #24483d;">سایدبار — لینک‌های این هفته</h2>
    <table style="width: 100%; border-collapse: collapse;">${itemsHtml}</table>
    <p style="margin-top: 24px; font-size: 12px; color: #958878;">
      این ایمیل برای شما ارسال شده چون در خبرنامه سایدبار عضو هستید.
    </p>
  </div>`;

  const text =
    "سایدبار — لینک‌های این هفته\n\n" +
    links.map((l) => `${l.title}\n${l.url}`).join("\n\n");

  return { html, text };
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
