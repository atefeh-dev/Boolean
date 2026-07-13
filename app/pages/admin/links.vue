<template>
  <div class="admin-layout">
    <div class="admin-page-header">
      <h1 class="admin-page-title">
        <IconsList />
        مدیریت لینک‌ها
      </h1>
      <div class="admin-status-pills">
        <UiAppChip
          v-for="tab in tabs"
          :key="tab.value"
          size="sm"
          :active="status === tab.value"
          :count="toPersian(tab.count)"
          @click="setStatus(tab.value)"
        >
          <component :is="tab.icon" />
          {{ tab.label }}
        </UiAppChip>
      </div>
    </div>

    <p v-if="errorMsg" class="admin-error">{{ errorMsg }}</p>

    <div v-if="loading && !links.length" class="admin-empty">در حال بارگذاری...</div>
    <div v-else-if="!loading && !links.length" class="admin-empty">
      لینکی در این وضعیت وجود ندارد.
    </div>

    <ul v-if="links.length" class="admin-list" :class="{ 'admin-list--loading': loading }">
      <li v-for="link in links" :key="link.id" class="admin-card">

        <!-- Edit mode -->
        <template v-if="editingId === link.id">
          <div class="admin-card__main">
            <div class="field">
              <label class="field-label">عنوان</label>
              <div class="field-wrap"><input v-model="editForm.title" type="text" /></div>
            </div>
            <div class="field">
              <label class="field-label">توضیح</label>
              <div class="field-wrap"><input v-model="editForm.body" type="text" /></div>
            </div>
            <div class="field">
              <label class="field-label">منبع / اعتبار</label>
              <div class="field-wrap"><input v-model="editForm.credit" type="text" /></div>
            </div>
            <div class="field">
              <label class="field-label">دسته‌بندی (حداکثر ۳)</label>
              <div class="admin-edit-cats">
                <label v-for="c in allCategories" :key="c.id" class="admin-edit-cat">
                  <input type="checkbox" :value="c.id"
                    :checked="editForm.categories.includes(c.id)"
                    @change="toggleCat(c.id, $event)" />
                  {{ c.label }}
                </label>
              </div>
            </div>
          </div>
          <div class="admin-card__actions">
            <UiAppButton size="sm" :disabled="actingId === link.id" @click="saveEdits(link.id)">ذخیره</UiAppButton>
            <UiAppButton variant="danger" size="sm" @click="cancelEdit">انصراف</UiAppButton>
          </div>
        </template>

        <!-- View mode -->
        <template v-else>
          <div class="admin-card__main">
            <div class="admin-card__top">
              <span class="admin-card__status" :class="`admin-card__status--${link.status.toLowerCase()}`">
                {{ statusLabel(link.status) }}
              </span>
              <span class="admin-card__date">{{ formatDate(link.createdAt) }}</span>
            </div>
            <a :href="link.url" target="_blank" rel="noopener" class="admin-card__title">
              {{ link.title }}
            </a>
            <p v-if="link.body" class="admin-card__body">{{ link.body }}</p>
            <p class="admin-card__meta">
              <span dir="ltr" class="admin-card__url">{{ link.url }}</span>
              <span v-if="link.submittedBy"> · {{ link.submittedBy.name }}</span>
            </p>
            <div v-if="link.categories?.length" class="admin-card__cats">
              <span v-for="c in link.categories" :key="c.id" class="cat-lbl">{{ c.label }}</span>
            </div>
          </div>
          <div class="admin-card__actions">
            <template v-if="status === 'PENDING'">
              <UiAppButton size="sm" :disabled="actingId === link.id" @click="act(link.id, 'approve')">
                <IconsCheckCircle />
                تأیید
              </UiAppButton>
              <UiAppButton variant="danger" size="sm" :disabled="actingId === link.id" @click="act(link.id, 'reject')">
                <IconsXCircle />
                رد
              </UiAppButton>
            </template>
            <UiAppButton variant="subtle" size="sm" @click="startEdit(link)">
              ویرایش
            </UiAppButton>
          </div>
        </template>

      </li>
    </ul>

    <!-- Pagination -->
    <div v-if="total > pageSize" class="admin-pagination">
      <UiAppButton variant="line" size="sm" :disabled="page === 1" @click="goToPage(page - 1)">‹ قبلی</UiAppButton>
      <span>صفحه {{ toPersian(page) }} از {{ toPersian(totalPages) }}</span>
      <UiAppButton variant="line" size="sm" :disabled="page === totalPages" @click="goToPage(page + 1)">بعدی ›</UiAppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsList from "../../components/icons/List.vue";
import IconsClock from "../../components/icons/Clock.vue";
import IconsCheckCircle from "../../components/icons/CheckCircle.vue";
import IconsXCircle from "../../components/icons/XCircle.vue";

definePageMeta({ title: "بولتن — مدیریت لینک‌ها", middleware: "admin", layout: "admin" });

interface Cat { id: string; label: string }
interface Link {
  id: string; url: string; title: string; body: string | null;
  credit: string | null; status: string; createdAt: string;
  categories: Cat[];
  submittedBy?: { name: string; email: string };
}

const pageSize = 20;
const route = useRoute();

// Read initial status from ?status= query param so dashboard stat cards
// open the correct tab directly (e.g. clicking "منتشرشده: 12" opens PUBLISHED).
const initialStatus = (() => {
  const q = (route.query.status as string)?.toUpperCase();
  return (["PENDING", "PUBLISHED", "REJECTED"] as const).includes(q as "PENDING")
    ? (q as "PENDING" | "PUBLISHED" | "REJECTED")
    : "PENDING";
})();

const status = ref<"PENDING" | "PUBLISHED" | "REJECTED">(initialStatus);
const page = ref(1);
const links = ref<Link[]>([]);
const total = ref(0);
const counts = reactive({ PENDING: 0, PUBLISHED: 0, REJECTED: 0 });
const loading = ref(false);
const errorMsg = ref("");
const actingId = ref<string | null>(null);
const allCategories = ref<Cat[]>([]);
const editingId = ref<string | null>(null);
const editForm = reactive({ title: "", body: "", credit: "", categories: [] as string[] });
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

const tabs = computed(() => [
  { value: "PENDING" as const,   label: "در انتظار",  icon: IconsClock,       count: counts.PENDING },
  { value: "PUBLISHED" as const, label: "منتشرشده",   icon: IconsCheckCircle, count: counts.PUBLISHED },
  { value: "REJECTED" as const,  label: "رد شده",     icon: IconsXCircle,     count: counts.REJECTED },
]);

function statusLabel(s: string) {
  return s === "PENDING" ? "در انتظار" : s === "PUBLISHED" ? "منتشر" : "رد شده";
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso));
}

async function loadCounts() {
  try {
    const res = await $fetch<{ pendingCount: number; publishedCount: number; rejectedCount: number }>(
      "/api/admin/overview"
    );
    counts.PENDING = res.pendingCount;
    counts.PUBLISHED = res.publishedCount;
    counts.REJECTED = res.rejectedCount;
  } catch { /* non-fatal */ }
}

async function load() {
  loading.value = true; errorMsg.value = "";
  try {
    const res = await $fetch<{ links: Link[]; total: number }>("/api/admin/links", {
      query: { status: status.value, take: pageSize, skip: (page.value - 1) * pageSize },
    });
    links.value = res.links; total.value = res.total;
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : "بارگذاری ناموفق بود.";
  } finally { loading.value = false; }
}

async function loadCategories() {
  try {
    const res = await $fetch<{ categories: Cat[] }>("/api/categories");
    allCategories.value = res.categories;
  } catch { allCategories.value = []; }
}

function setStatus(v: typeof status.value) {
  status.value = v; page.value = 1; editingId.value = null; load();
}
function goToPage(v: number) { page.value = v; load(); }

async function act(id: string, action: "approve" | "reject") {
  actingId.value = id;
  try {
    await $fetch(`/api/admin/links/${id}`, { method: "PATCH", body: { action } });
    links.value = links.value.filter(l => l.id !== id);
    total.value -= 1;
    await loadCounts();
  } catch (err) { errorMsg.value = err instanceof Error ? err.message : "عملیات ناموفق بود."; }
  finally { actingId.value = null; }
}

function startEdit(link: Link) {
  editingId.value = link.id;
  Object.assign(editForm, { title: link.title, body: link.body ?? "", credit: link.credit ?? "", categories: link.categories.map(c => c.id) });
}
function cancelEdit() { editingId.value = null; }

function toggleCat(id: string, e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  if (checked) {
    if (editForm.categories.length >= 3) { (e.target as HTMLInputElement).checked = false; return; }
    editForm.categories.push(id);
  } else {
    editForm.categories = editForm.categories.filter(c => c !== id);
  }
}

async function saveEdits(id: string) {
  actingId.value = id;
  try {
    const res = await $fetch<{ link: Link }>(`/api/admin/links/${id}`, {
      method: "PATCH",
      body: { action: "save", edits: { title: editForm.title, body: editForm.body, credit: editForm.credit, categories: editForm.categories } },
    });
    const idx = links.value.findIndex(l => l.id === id);
    if (idx !== -1) links.value[idx] = res.link as unknown as Link;
    editingId.value = null;
  } catch (err) { errorMsg.value = err instanceof Error ? err.message : "ذخیره ناموفق بود."; }
  finally { actingId.value = null; }
}

await Promise.all([load(), loadCategories(), loadCounts()]);
</script>
