<template>
  <div class="dash-panel">
    <div class="dash-panel__head">
      <h3 class="dash-panel__title"><IconsClock /> صف بررسی</h3>
      <NuxtLink to="/admin/links?status=PENDING" class="dash-panel__link">مشاهده همه ←</NuxtLink>
    </div>

    <div class="dash-panel__body">
      <!-- Queue health indicator -->
      <div class="dash-queue-status" :class="healthClass">
        <span class="dash-queue-status__dot" />
        <span class="dash-queue-status__text">{{ healthLabel }}</span>
        <strong class="dash-queue-status__count">{{ toPersian(count) }} لینک</strong>
      </div>

      <p v-if="!oldestPending.length" class="dash-empty-sm">صف خالی است — همه بررسی شده‌اند ✓</p>

      <ul v-else class="dash-pending-list">
        <li v-for="link in oldestPending" :key="link.id" class="dash-pending-item">
          <span class="dash-pending-age" :class="link.daysAgo > 7 ? 'urgent' : link.daysAgo > 3 ? 'warn' : ''">
            {{ toPersian(link.daysAgo) }} روز
          </span>
          <div class="dash-pending-meta">
            <a :href="link.url" target="_blank" rel="noopener" class="dash-pending-title">{{ link.title }}</a>
            <div class="dash-pending-sub">
              <span v-if="link.submittedBy">{{ link.submittedBy }}</span>
              <span v-for="c in link.categories.slice(0,2)" :key="c.id" class="cat-lbl cat-lbl--sm">{{ c.label }}</span>
            </div>
          </div>
          <NuxtLink :to="`/admin/links?status=PENDING`" class="dash-pending-act">بررسی</NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsClock from "../icons/Clock.vue";

const props = defineProps<{
  count: number
  oldestPending: { id: string; title: string; url: string; daysAgo: number; submittedBy: string | null; categories: { id: string; label: string }[] }[]
}>()

const healthClass = computed(() => {
  if (props.count === 0) return "green";
  if (props.oldestPending[0]?.daysAgo > 7) return "red";
  if (props.oldestPending[0]?.daysAgo > 3) return "amber";
  return "green";
});

const healthLabel = computed(() => {
  if (props.count === 0) return "صف خالی";
  const oldest = props.oldestPending[0]?.daysAgo ?? 0;
  if (oldest > 7) return "نیاز فوری به بررسی";
  if (oldest > 3) return "بررسی توصیه می‌شود";
  return "وضعیت عادی";
});
</script>
