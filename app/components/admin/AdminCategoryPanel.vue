<template>
  <div class="dash-panel">
    <div class="dash-panel__head">
      <h3 class="dash-panel__title"><IconsGrid /> سلامت دسته‌بندی‌ها</h3>
      <span class="dash-panel__sub">بر اساس لینک‌های منتشرشده</span>
    </div>

    <ul class="dash-cat-list">
      <li v-for="cat in sorted" :key="cat.id" class="dash-cat-row">
        <div class="dash-cat-row__top">
          <span class="dash-cat-row__label">{{ cat.label }}</span>
          <div class="dash-cat-row__right">
            <span v-if="cat.lastPublishedDaysAgo !== null && cat.lastPublishedDaysAgo > 14"
              class="dash-cat-badge dash-cat-badge--stale" title="مدت طولانی بدون انتشار">
              {{ toPersian(cat.lastPublishedDaysAgo) }} روز
            </span>
            <span class="dash-cat-row__count">{{ toPersian(cat.publishedCount) }}</span>
          </div>
        </div>
        <div class="dash-cat-bar-track">
          <div class="dash-cat-bar-fill" :style="{ width: barWidth(cat.publishedCount) }" />
        </div>
      </li>
    </ul>

    <p v-if="staleCount > 0" class="dash-cat-warn">
      <IconsClock /> {{ toPersian(staleCount) }} دسته‌بندی بیش از ۱۴ روز بدون لینک جدید
    </p>
  </div>
</template>

<script setup lang="ts">
import IconsGrid  from "../icons/Grid.vue";
import IconsClock from "../icons/Clock.vue";

const props = defineProps<{
  categories: { id: string; label: string; publishedCount: number; lastPublishedDaysAgo: number | null }[]
}>()

const sorted = computed(() => [...props.categories].sort((a, b) => b.publishedCount - a.publishedCount).slice(0, 10));
const maxCount = computed(() => Math.max(...sorted.value.map(c => c.publishedCount), 1));
function barWidth(n: number) { return `${(n / maxCount.value) * 100}%`; }
const staleCount = computed(() => props.categories.filter(c => (c.lastPublishedDaysAgo ?? 0) > 14 && c.publishedCount > 0).length);
</script>
