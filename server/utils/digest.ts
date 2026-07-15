interface DigestLink {
  title: string;
  url: string;
  body: string | null;
}

interface DigestContent {
  itemsHtml: string;
  itemsText: string;
}

/**
 * The newsletter content itself — identical for every recipient. Build
 * this ONCE per send, not once per subscriber; only the unsubscribe URL
 * actually varies per recipient (see wrapDigestEmail below). For a
 * 5-link digest going to a few thousand subscribers, that's the
 * difference between rendering this list once vs. thousands of times for
 * byte-identical output.
 */
export function buildDigestContent(links: DigestLink[]): DigestContent {
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

  const itemsText = links.map((l) => `${l.title}\n${l.url}`).join("\n\n");

  return { itemsHtml, itemsText };
}

/** Cheap per-recipient step — just splices in this subscriber's unsubscribe URL. */
export function wrapDigestEmail(content: DigestContent, unsubscribeUrl: string) {
  const html = `<div dir="rtl" style="font-family: Tahoma, sans-serif; max-width: 560px; margin: 0 auto;">
    <h2 style="color: #24483d;">بولتن — لینک‌های این هفته</h2>
    <table style="width: 100%; border-collapse: collapse;">${content.itemsHtml}</table>
    <p style="margin-top: 24px; font-size: 12px; color: #958878;">
      این ایمیل برای شما ارسال شده چون در خبرنامه بولتن عضو هستید. —
      <a href="${unsubscribeUrl}" style="color: #958878; text-decoration: underline;">لغو عضویت</a>
    </p>
  </div>`;

  const text =
    "بولتن — لینک‌های این هفته\n\n" +
    content.itemsText +
    `\n\n---\nلغو عضویت: ${unsubscribeUrl}`;

  return { html, text };
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
