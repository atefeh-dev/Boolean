<template>
  <div class="admin-stats">
    <p class="admin-stats__title">خلاصه آمار</p>
    <div class="admin-stats__grid">
      <button
        v-for="stat in stats"
        :key="stat.key"
        type="button"
        class="admin-stats__item"
        @click="$emit('select', stat.key)"
      >
        <span class="admin-stats__num">{{ toPersian(stat.value) }}</span>
        <span class="admin-stats__label">{{ stat.label }}</span>
        <span class="admin-stats__icon" :class="`admin-stats__icon--${stat.tone}`">
          <component :is="stat.icon" />
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsClock from "../icons/Clock.vue";
import IconsCheckCircle from "../icons/CheckCircle.vue";
import IconsXCircle from "../icons/XCircle.vue";
import IconsGrid from "../icons/Grid.vue";
import IconsMail from "../icons/Mail.vue";

interface Stat {
  key: string;
  label: string;
  value: number;
  icon: typeof IconsClock;
  tone: "amber" | "forest" | "clay" | "ink";
}

const props = defineProps<{
  pendingCount: number;
  publishedCount: number;
  rejectedCount: number;
  categoriesCount: number;
  subscriberCount: number;
}>();

defineEmits<{ select: [key: string] }>();

const stats = computed<Stat[]>(() => [
  { key: "pending",     label: "در انتظار",      value: props.pendingCount,     icon: IconsClock,       tone: "amber" },
  { key: "published",   label: "منتشر شده",      value: props.publishedCount,   icon: IconsCheckCircle, tone: "forest" },
  { key: "rejected",    label: "رد شده",          value: props.rejectedCount,    icon: IconsXCircle,     tone: "clay" },
  { key: "categories",  label: "دسته‌بندی",       value: props.categoriesCount,  icon: IconsGrid,        tone: "ink" },
  { key: "subscribers", label: "مشترک خبرنامه",  value: props.subscriberCount,  icon: IconsMail,        tone: "ink" },
]);
</script>
