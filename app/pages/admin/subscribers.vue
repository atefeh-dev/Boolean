<template>
  <div class="admin-layout">
    <div class="admin-page-header">
      <h1 class="admin-page-title">
        <IconsUsers />
        مشترکان خبرنامه
      </h1>
      <div class="admin-status-pills">
        <UiAppChip
          size="sm"
          :active="filter === 'all'"
          :count="toPersianCompact(stats.subscriberCount + stats.notSubscribedCount)"
          :title="toPersian(stats.subscriberCount + stats.notSubscribedCount)"
          @click="setFilter('all')"
        >
          همه
        </UiAppChip>
        <UiAppChip
          size="sm"
          :active="filter === 'subscribed'"
          :count="toPersianCompact(stats.subscriberCount)"
          :title="toPersian(stats.subscriberCount)"
          @click="setFilter('subscribed')"
        >
          مشترک
        </UiAppChip>
        <UiAppChip
          size="sm"
          :active="filter === 'not-subscribed'"
          :count="toPersianCompact(stats.notSubscribedCount)"
          :title="toPersian(stats.notSubscribedCount)"
          @click="setFilter('not-subscribed')"
        >
          <IconsXCircle />
          مشترک نشده
        </UiAppChip>
      </div>
    </div>

    <div class="admin-search">
      <svg class="admin-search__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
        <path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <input
        v-model="search"
        type="search"
        class="admin-search__input"
        placeholder="جستجو بر اساس نام یا ایمیل..."
      />
    </div>

    <p v-if="errorMsg" class="admin-error">{{ errorMsg }}</p>

    <div v-if="loading" class="admin-empty">در حال بارگذاری...</div>
    <div v-else-if="!subscribers.length" class="admin-empty">
      {{ search ? "نتیجه‌ای یافت نشد." : filter === "not-subscribed" ? "همه اعضا مشترک خبرنامه هستند." : "هنوز مشترکی ثبت نشده است." }}
    </div>

    <div v-else class="admin-members-table admin-members-table--with-actions">
      <div class="admin-members-table__head">
        <span>#</span>
        <span>نام</span>
        <span>ایمیل</span>
        <span>تاریخ</span>
        <span>وضعیت</span>
        <span></span>
      </div>
      <div
        v-for="(sub, idx) in subscribers"
        :key="sub.id"
        class="admin-members-table__row"
      >
        <span class="admin-members-table__index">{{ toPersian(skip + idx + 1) }}</span>
        <span class="admin-members-table__name">
          <span class="admin-members-table__name-text" :title="sub.name || undefined">{{ sub.name || "—" }}</span>
          <span v-if="!sub.hasAccount" class="admin-role-badge admin-role-badge--guest">مهمان</span>
        </span>
        <span class="admin-members-table__email" dir="ltr" :title="sub.email">{{ sub.email }}</span>
        <span class="admin-members-table__date">{{ formatDate(sub.createdAt) }}</span>
        <span
          class="admin-sub-badge"
          :class="sub.subscribed ? 'admin-sub-badge--yes' : 'admin-sub-badge--no'"
        >
          {{ sub.subscribed ? "مشترک" : "مشترک نشده" }}
        </span>
        <UiAppButton
          v-if="sub.subscribed"
          variant="icon"
          shape="rounded"
          :disabled="deletingId === sub.id"
          :aria-label="`حذف اشتراک ${sub.email}`"
          @click="confirmDelete(sub)"
        >
          <IconsTrash />
        </UiAppButton>
        <span v-else class="admin-members-table__action-empty" aria-hidden="true"></span>
      </div>

      <div class="admin-table-footer">
        <span class="admin-table-footer__summary">
          {{ toPersian(total) }} {{ filterLabel }}{{ search ? " (نتیجه جستجو)" : "" }}
        </span>
        <div v-if="total > pageSize" class="admin-table-footer__pagination">
          <UiAppButton variant="line" size="sm" :disabled="page === 1" @click="goToPage(page - 1)">‹ قبلی</UiAppButton>
          <span>صفحه {{ toPersian(page) }} از {{ toPersian(pageCount) }}</span>
          <UiAppButton variant="line" size="sm" :disabled="page === pageCount" @click="goToPage(page + 1)">بعدی ›</UiAppButton>
        </div>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <div v-if="confirmSub" class="admin-modal-backdrop" @click.self="confirmSub = null">
        <div class="admin-modal">
          <p class="admin-modal__title">حذف اشتراک</p>
          <p class="admin-modal__desc" dir="ltr">{{ confirmSub.email }}</p>
          <p class="admin-modal__warn">
            {{ confirmSub.hasAccount
              ? "حساب کاربری حذف نمی‌شود، فقط اشتراک خبرنامه لغو می‌شود."
              : "این عملیات قابل بازگشت نیست." }}
          </p>
          <div class="admin-modal__actions">
            <UiAppButton variant="outline" size="sm" @click="confirmSub = null">انصراف</UiAppButton>
            <UiAppButton variant="clay" size="sm" :disabled="!!deletingId" @click="doDelete">
              {{ deletingId ? "در حال حذف..." : "لغو اشتراک" }}
            </UiAppButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import IconsUsers from "../../components/icons/Users.vue";
import IconsXCircle from "../../components/icons/XCircle.vue";
import IconsTrash from "../../components/icons/Trash.vue";
import { toPersian, toPersianCompact } from "../../utils/persian";

definePageMeta({ title: "بولتن — مشترکان", middleware: "admin", layout: "admin" });

interface Contact {
  id: string;
  email: string;
  name: string | null;
  hasAccount: boolean;
  subscribed: boolean;
  createdAt: string;
}

const route = useRoute();
const router = useRouter();

const pageSize = 30;
const initialFilter =
  route.query.filter === "subscribed" || route.query.filter === "not-subscribed"
    ? route.query.filter
    : "all";

const filter = ref<"all" | "subscribed" | "not-subscribed">(initialFilter);
const search = ref("");
const page = ref(1);
const subscribers = ref<Contact[]>([]);
const total = ref(0);
const skip = ref(0);
const loading = ref(false);
const errorMsg = ref("");
const deletingId = ref<string | null>(null);
const confirmSub = ref<Contact | null>(null);
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
const filterLabel = computed(() =>
  filter.value === "subscribed" ? "مشترک" : filter.value === "not-subscribed" ? "عضو، بدون اشتراک" : "نتیجه"
);

const stats = ref({ subscriberCount: 0, userCount: 0, notSubscribedCount: 0 });

async function loadStats() {
  try {
    const res = await $fetch<{
      subscriberCount: number;
      userCount: number;
      notSubscribedCount: number;
    }>("/api/admin/subscribers/stats");
    stats.value = res;
  } catch {
    // Non-critical — the table/pagination still work without it, so fail
    // quietly rather than blocking the page with an error banner.
  }
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso));
}

async function load() {
  loading.value = true; errorMsg.value = "";
  skip.value = (page.value - 1) * pageSize;
  try {
    const res = await $fetch<{ subscribers: Contact[]; total: number }>(
      "/api/admin/subscribers",
      {
        query: {
          take: pageSize,
          skip: skip.value,
          ...(filter.value !== "all" ? { filter: filter.value } : {}),
          ...(search.value.trim() ? { search: search.value.trim() } : {}),
        },
      }
    );
    subscribers.value = res.subscribers;
    total.value = res.total;
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : "بارگذاری ناموفق بود.";
  } finally { loading.value = false; }
}

function goToPage(v: number) { page.value = v; load(); }

function setFilter(next: "all" | "subscribed" | "not-subscribed") {
  if (filter.value === next) return;
  filter.value = next;
  page.value = 1;
  router.replace({ query: next === "all" ? {} : { filter: next } });
  load();
}

// Debounced so every keystroke doesn't fire a request.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    load();
  }, 300);
});

function confirmDelete(sub: Contact) { confirmSub.value = sub; }

async function doDelete() {
  if (!confirmSub.value) return;
  deletingId.value = confirmSub.value.id;
  try {
    await $fetch(`/api/admin/subscribers/${confirmSub.value.id}`, { method: "DELETE" });
    subscribers.value = subscribers.value.filter(s => s.id !== confirmSub.value!.id);
    total.value -= 1;
    confirmSub.value = null;
    loadStats();
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : "حذف ناموفق بود.";
  } finally { deletingId.value = null; }
}

await Promise.all([load(), loadStats()]);
</script>
