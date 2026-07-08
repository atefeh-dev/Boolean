<template>
  <div class="dash-kpis">
    <div v-for="k in kpis" :key="k.label" class="dash-kpi" :class="`dash-kpi--${k.tone}`">
      <span class="dash-kpi__icon"><component :is="k.icon" /></span>
      <div class="dash-kpi__body">
        <span class="dash-kpi__num">{{ toPersian(k.value) }}</span>
        <span class="dash-kpi__label">{{ k.label }}</span>
      </div>
      <span v-if="k.trend !== undefined" class="dash-kpi__trend" :class="k.trend > 0 ? 'up' : k.trend < 0 ? 'down' : 'flat'">
        {{ k.trend > 0 ? '↑' : k.trend < 0 ? '↓' : '—' }}
        {{ k.trend !== 0 ? toPersian(Math.abs(k.trend)) : '' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsCheckCircle from "../icons/CheckCircle.vue";
import IconsClock      from "../icons/Clock.vue";
import IconsXCircle    from "../icons/XCircle.vue";
import IconsUsers      from "../icons/Users.vue";
import IconsGrid       from "../icons/Grid.vue";

const props = defineProps<{
  publishedCount: number
  pendingCount:   number
  rejectedCount:  number
  subscriberCount:number
  categoryCount:  number
  publishedThisWeek: number
  publishedLastWeek: number
  newSubsThisWeek:   number
  newSubsLastWeek:   number
}>()

const kpis = computed(() => [
  { label: "منتشرشده",  value: props.publishedCount,  icon: IconsCheckCircle, tone: "forest", trend: props.publishedThisWeek - props.publishedLastWeek },
  { label: "در انتظار", value: props.pendingCount,    icon: IconsClock,       tone: "amber",  trend: undefined },
  { label: "رد شده",    value: props.rejectedCount,   icon: IconsXCircle,     tone: "clay",   trend: undefined },
  { label: "مشترکان",   value: props.subscriberCount, icon: IconsUsers,       tone: "ink",    trend: props.newSubsThisWeek - props.newSubsLastWeek },
  { label: "دسته‌بندی", value: props.categoryCount,   icon: IconsGrid,        tone: "ink",    trend: undefined },
])
</script>
