<template>
  <div class="admin-layout">
    <div class="admin-page-header">
      <h1 class="admin-page-title">
        <IconsUsers />
        مشترکان خبرنامه
      </h1>
    </div>

    <!-- Stats bar -->
    <div class="admin-sub-stats">
      <div class="admin-sub-stat">
        <span class="admin-sub-stat__num">{{ toPersian(total) }}</span>
        <span class="admin-sub-stat__label">مشترک فعال</span>
      </div>
      <div class="admin-sub-stat admin-sub-stat--secondary">
        <span class="admin-sub-stat__num">{{ toPersian(pageCount) }}</span>
        <span class="admin-sub-stat__label">صفحه</span>
      </div>
    </div>

    <p v-if="errorMsg" class="admin-error">{{ errorMsg }}</p>

    <div v-if="loading" class="admin-empty">در حال بارگذاری...</div>
    <div v-else-if="!subscribers.length" class="admin-empty">
      هنوز مشترکی ثبت نشده است.
    </div>

    <div v-else class="admin-sub-table">
      <div class="admin-sub-table__head">
        <span>#</span>
        <span>ایمیل</span>
        <span>تاریخ عضویت</span>
        <span></span>
      </div>
      <div
        v-for="(sub, idx) in subscribers"
        :key="sub.id"
        class="admin-sub-table__row"
      >
        <span class="admin-sub-table__index">{{ toPersian(skip + idx + 1) }}</span>
        <span class="admin-sub-table__email" dir="ltr">{{ sub.email }}</span>
        <span class="admin-sub-table__date">{{ formatDate(sub.createdAt) }}</span>
        <button
          class="admin-sub-table__delete"
          :disabled="deletingId === sub.id"
          :aria-label="`حذف ${sub.email}`"
          @click="confirmDelete(sub)"
        >
          <IconsTrash />
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="total > pageSize" class="admin-pagination">
      <button :disabled="page === 1" @click="goToPage(page - 1)">‹ قبلی</button>
      <span>صفحه {{ toPersian(page) }} از {{ toPersian(pageCount) }}</span>
      <button :disabled="page === pageCount" @click="goToPage(page + 1)">بعدی ›</button>
    </div>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <div v-if="confirmSub" class="admin-modal-backdrop" @click.self="confirmSub = null">
        <div class="admin-modal">
          <p class="admin-modal__title">حذف مشترک</p>
          <p class="admin-modal__desc" dir="ltr">{{ confirmSub.email }}</p>
          <p class="admin-modal__warn">این عملیات قابل بازگشت نیست.</p>
          <div class="admin-modal__actions">
            <button class="admin-modal__cancel" @click="confirmSub = null">انصراف</button>
            <button class="admin-modal__confirm" :disabled="!!deletingId" @click="doDelete">
              {{ deletingId ? "در حال حذف..." : "حذف مشترک" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import IconsUsers from "../../components/icons/Users.vue";
import IconsTrash from "../../components/icons/Trash.vue";

definePageMeta({ title: "بولتن — مشترکان", middleware: "admin", layout: "admin" });

interface Subscriber { id: string; email: string; createdAt: string }

const pageSize = 30;
const page = ref(1);
const subscribers = ref<Subscriber[]>([]);
const total = ref(0);
const skip = ref(0);
const loading = ref(false);
const errorMsg = ref("");
const deletingId = ref<string | null>(null);
const confirmSub = ref<Subscriber | null>(null);
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso));
}

async function load() {
  loading.value = true; errorMsg.value = "";
  skip.value = (page.value - 1) * pageSize;
  try {
    const res = await $fetch<{ subscribers: Subscriber[]; total: number }>(
      "/api/admin/subscribers",
      { query: { take: pageSize, skip: skip.value } }
    );
    subscribers.value = res.subscribers;
    total.value = res.total;
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : "بارگذاری ناموفق بود.";
  } finally { loading.value = false; }
}

function goToPage(v: number) { page.value = v; load(); }
function confirmDelete(sub: Subscriber) { confirmSub.value = sub; }

async function doDelete() {
  if (!confirmSub.value) return;
  deletingId.value = confirmSub.value.id;
  try {
    await $fetch(`/api/admin/subscribers/${confirmSub.value.id}`, { method: "DELETE" });
    subscribers.value = subscribers.value.filter(s => s.id !== confirmSub.value!.id);
    total.value -= 1;
    confirmSub.value = null;
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : "حذف ناموفق بود.";
  } finally { deletingId.value = null; }
}

await load();
</script>
