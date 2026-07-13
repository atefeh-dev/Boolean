<template>
  <div class="admin-layout">
    <div class="admin-page-header">
      <h1 class="admin-page-title"><IconsMail /> خبرنامه</h1>
    </div>

    <p v-if="errorMsg" class="admin-error">{{ errorMsg }}</p>
    <div v-if="loading" class="admin-empty">در حال بارگذاری...</div>

    <template v-else>
      <!-- ── Stats strip ─────────────────────────────────────────── -->
      <div class="nl-stats">
        <div class="nl-stat">
          <span class="nl-stat__num">{{ toPersian(preview.subscriberCount) }}</span>
          <span class="nl-stat__label">مشترک فعال</span>
        </div>
        <div class="nl-stat">
          <span class="nl-stat__num">{{ toPersian(preview.links.length) }}</span>
          <span class="nl-stat__label">لینک در صف</span>
        </div>
        <div class="nl-stat" :class="selectionFull ? 'nl-stat--ready' : ''">
          <span class="nl-stat__num">{{ toPersian(selected.size) }} / {{ toPersian(MAX) }}</span>
          <span class="nl-stat__label">انتخاب‌شده برای این شماره</span>
        </div>
        <div v-if="preview.lastSend" class="nl-stat nl-stat--muted">
          <span class="nl-stat__num">{{ formatDate(preview.lastSend.sentAt) }}</span>
          <span class="nl-stat__label">آخرین ارسال · {{ toPersian(preview.lastSend.recipients) }} مشترک</span>
        </div>
      </div>

      <!-- ── Send success state ─────────────────────────────────── -->
      <div v-if="sendResult" class="nl-success">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/>
        </svg>
        <div>
          <p class="nl-success__title">خبرنامه با موفقیت ارسال شد</p>
          <p class="nl-success__sub">{{ sendResult }}</p>
        </div>
        <UiAppButton variant="line" size="sm" class="nl-success__reset" @click="reset">ارسال شماره بعدی</UiAppButton>
      </div>

      <!-- ── Empty queue ──────────────────────────────────────────── -->
      <div v-else-if="!preview.links.length" class="nl-empty">
        <IconsMail />
        <p>همه لینک‌های منتشرشده قبلاً ارسال شده‌اند.</p>
        <NuxtLink to="/admin/links?status=PENDING" class="nl-empty__link">
          بررسی لینک‌های در انتظار ←
        </NuxtLink>
      </div>

      <!-- ── Compose issue ─────────────────────────────────────────── -->
      <template v-else>
        <div class="nl-compose">

          <!-- Left: link selection -->
          <div class="nl-link-list">
            <div class="nl-list-head">
              <p class="nl-list-head__title">لینک‌های آماده</p>
              <p class="nl-list-head__hint">
                {{ selectionFull
                    ? 'انتخاب تکمیل شد — آماده ارسال'
                    : `${toPersian(MAX - selected.size)} لینک دیگر انتخاب کنید` }}
              </p>
            </div>

            <ul class="nl-links">
              <li
                v-for="link in preview.links"
                :key="link.id"
                class="nl-link"
                :class="{
                  'nl-link--selected':  selected.has(link.id),
                  'nl-link--disabled':  selectionFull && !selected.has(link.id),
                }"
                @click="toggle(link.id)"
              >
                <!-- Checkbox -->
                <span class="nl-link__check" :class="selected.has(link.id) ? 'checked' : ''">
                  <svg v-if="selected.has(link.id)" viewBox="0 0 16 16" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                    stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 8l3.5 3.5L13 5"/>
                  </svg>
                </span>

                <!-- Rank badge (when selected) -->
                <span v-if="selected.has(link.id)" class="nl-link__rank">
                  {{ toPersian(selectionOrder.indexOf(link.id) + 1) }}
                </span>

                <!-- Content -->
                <div class="nl-link__body">
                  <p class="nl-link__title">{{ link.title }}</p>
                  <p class="nl-link__meta">
                    <span dir="ltr" class="nl-link__domain">{{ domainOf(link.url) }}</span>
                    <span v-for="c in link.categories.slice(0,2)" :key="c.id" class="nl-link__cat">
                      {{ c.label }}
                    </span>
                    <span v-if="link.submittedBy" class="nl-link__who">
                      · {{ link.submittedBy.name }}
                    </span>
                  </p>
                  <p v-if="link.body" class="nl-link__desc">{{ link.body }}</p>
                </div>

                <!-- Published date -->
                <span class="nl-link__date">{{ shortDate(link.publishedAt) }}</span>
              </li>
            </ul>
          </div>

          <!-- Right: issue preview + send -->
          <div class="nl-sidebar">
            <div class="nl-preview-card">
              <p class="nl-preview-card__label">پیش‌نمایش این شماره</p>

              <div v-if="!selected.size" class="nl-preview-empty">
                لینک‌هایی را از سمت چپ انتخاب کنید.
              </div>

              <ol v-else class="nl-preview-list">
                <li v-for="id in selectionOrder" :key="id" class="nl-preview-item">
                  <span class="nl-preview-item__num">{{ toPersian(selectionOrder.indexOf(id)+1) }}</span>
                  <div>
                    <p class="nl-preview-item__title">{{ linkById(id)?.title }}</p>
                    <p class="nl-preview-item__domain" dir="ltr">{{ domainOf(linkById(id)?.url ?? '') }}</p>
                  </div>
                  <button class="nl-preview-item__remove" aria-label="حذف" @click.stop="remove(id)">
                    ×
                  </button>
                </li>
              </ol>

              <div class="nl-preview-footer">
                <span class="nl-preview-footer__to">
                  ارسال به {{ toPersian(preview.subscriberCount) }} مشترک
                </span>
                <UiAppButton
                  :variant="canSend ? 'forest' : 'neutral'"
                  shape="rounded"
                  block
                  :disabled="!canSend || sending"
                  @click="sendIssue"
                >
                  <IconsSend />
                  {{ sending
                      ? 'در حال ارسال...'
                      : selected.size
                        ? `ارسال ${toPersian(selected.size)} لینک`
                        : 'ارسال خبرنامه' }}
                </UiAppButton>
                <p v-if="!canSend && !sending" class="nl-send-hint">
                  {{ !selected.size
                      ? 'حداقل یک لینک انتخاب کنید'
                      : !preview.subscriberCount
                        ? 'هنوز مشترکی ثبت نشده است'
                        : '' }}
                </p>
              </div>
            </div>

            <!-- History -->
            <div v-if="preview.lastSend" class="nl-history">
              <p class="nl-history__label">آخرین شماره</p>
              <p class="nl-history__val">
                {{ toPersian(preview.lastSend.linkCount) }} لینک ·
                {{ toPersian(preview.lastSend.recipients) }} مشترک ·
                {{ formatDate(preview.lastSend.sentAt) }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import IconsMail from "../../components/icons/Mail.vue";
import IconsSend from "../../components/icons/Send.vue";

definePageMeta({ title: "بولتن — خبرنامه", middleware: "admin", layout: "admin" });

const MAX = 5;

interface NLLink {
  id: string; title: string; url: string; body: string | null;
  publishedAt: string | null;
  categories: { id: string; label: string }[];
  submittedBy: { name: string } | null;
}
interface NLSend { recipients: number; linkCount: number; sentAt: string }
interface Preview { links: NLLink[]; subscriberCount: number; lastSend: NLSend | null }

const loading    = ref(false);
const sending    = ref(false);
const errorMsg   = ref("");
const sendResult = ref("");
const preview    = reactive<Preview>({ links: [], subscriberCount: 0, lastSend: null });

// Plain $fetch on the server doesn't carry the incoming request's session
// cookie (that's a browser behavior — a server-side fetch is a brand new
// outgoing HTTP request with nothing attached by default). Since
// loadPreview() runs during SSR (see the top-level await below),
// requireAdmin on the API side was rejecting it as unauthenticated, SSR
// rendered the resulting error/empty state, and then the client re-fetched
// successfully right after mount (browsers attach cookies automatically) —
// producing a full cascade of hydration mismatches as the real data
// replaced the error state. useRequestFetch forwards the request context
// (cookies included) so the SSR pass gets the same authenticated result
// the client will, and the two renders actually match.
const fetcher = import.meta.server ? useRequestFetch() : $fetch;

// Selection — ordered Set (insertion order = rank in digest)
const selectionOrder = ref<string[]>([]);
const selected = computed(() => new Set(selectionOrder.value));
const selectionFull = computed(() => selectionOrder.value.length >= MAX);
const canSend = computed(() => selectionOrder.value.length > 0 && preview.subscriberCount > 0);

function toggle(id: string) {
  if (selected.value.has(id)) {
    selectionOrder.value = selectionOrder.value.filter(i => i !== id);
  } else {
    if (selectionFull.value) return;
    selectionOrder.value.push(id);
  }
}

function remove(id: string) {
  selectionOrder.value = selectionOrder.value.filter(i => i !== id);
}

function linkById(id: string) {
  return preview.links.find(l => l.id === id);
}

function domainOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

function shortDate(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian", day: "numeric", month: "short",
  }).format(new Date(iso));
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

async function loadPreview() {
  loading.value = true; errorMsg.value = "";
  try {
    const res = await fetcher<Preview>("/api/admin/newsletter/preview");
    Object.assign(preview, res);
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : "بارگذاری ناموفق بود.";
  } finally { loading.value = false; }
}

async function sendIssue() {
  if (!canSend.value) return;
  sending.value = true; errorMsg.value = "";
  try {
    const res = await $fetch<{ sent: number; failed: number; linkCount: number }>(
      "/api/admin/newsletter/send",
      { method: "POST", body: { linkIds: selectionOrder.value } }
    );
    sendResult.value = `${toPersian(res.sent)} مشترک · ${toPersian(res.linkCount)} لینک` +
      (res.failed ? ` · ${toPersian(res.failed)} ناموفق` : "");
    // Remove sent links from the local queue
    const sentIds = new Set(selectionOrder.value);
    preview.links = preview.links.filter(l => !sentIds.has(l.id));
    selectionOrder.value = [];
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : "ارسال ناموفق بود.";
  } finally { sending.value = false; }
}

function reset() {
  sendResult.value = "";
  loadPreview();
}

await loadPreview();
</script>
