<template>
  <div class="dash-panel">
    <div class="dash-panel__head">
      <h3 class="dash-panel__title">
        <IconsUsers />
        رشد مشترکان
      </h3>
      <div class="dash-chart-meta">
        <span class="dash-chart-badge">{{ toPersian(thisWeek) }} این هفته</span>
        <span
          v-if="trend !== 0"
          class="dash-chart-badge"
          :class="trend > 0 ? 'dash-chart-badge--up' : 'dash-chart-badge--dn'"
        >
          {{ trend > 0 ? '↑' : '↓' }} {{ toPersian(Math.abs(trend)) }}
        </span>
      </div>
    </div>

    <ClientOnly>
      <apexchart
        v-if="hasData"
        type="bar"
        :height="200"
        :options="options"
        :series="series"
      />
      <div v-else class="dash-chart-empty">
        هنوز مشترکی در این بازه ثبت نشده است.
      </div>
      <template #fallback>
        <div class="dash-chart-skeleton" style="height:200px" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import IconsUsers from "../icons/Users.vue";

const props = defineProps<{
  subscriberWeeklyTrend: { label: string; count: number }[]
}>()

const toP = (n: number) => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]);

const thisWeek = computed(() => props.subscriberWeeklyTrend.at(-1)?.count ?? 0);
const lastWeek = computed(() => props.subscriberWeeklyTrend.at(-2)?.count ?? 0);
const trend    = computed(() => thisWeek.value - lastWeek.value);
const hasData  = computed(() => props.subscriberWeeklyTrend.some(w => w.count > 0));

const series = computed(() => [{
  name: "مشترک جدید",
  data: props.subscriberWeeklyTrend.map(w => w.count),
}]);

// Current week bar is slightly darker for emphasis
const colors = computed(() =>
  props.subscriberWeeklyTrend.map((_, i) =>
    i === props.subscriberWeeklyTrend.length - 1 ? "#b85d3e" : "#e8c4b0"
  )
);

const options = computed(() => ({
  chart: {
    toolbar: { show: false },
    fontFamily: "Vazirmatn, Tahoma, Arial, sans-serif",
    animations: { enabled: true, easing: "easeinout", speed: 600 },
    background: "transparent",
  },
  colors: ["#b85d3e"],
  fill: { colors: colors.value, type: "solid" },
  plotOptions: {
    bar: {
      borderRadius: 6,
      borderRadiusApplication: "end",
      columnWidth: "58%",
      distributed: true,
    },
  },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: {
    borderColor: "#e8ddca",
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { right: 8, left: 8 },
  },
  xaxis: {
    categories: props.subscriberWeeklyTrend.map(w => w.label),
    labels: {
      style: { colors: "#958878", fontFamily: "Vazirmatn", fontSize: "11px" },
    },
    axisBorder: { show: false },
    axisTicks:  { show: false },
  },
  yaxis: {
    min: 0,
    tickAmount: 4,
    labels: {
      style: { colors: "#958878", fontFamily: "Vazirmatn", fontSize: "11px" },
      formatter: (v: number) => toP(Math.round(v)),
    },
  },
  tooltip: {
    theme: "light",
    style: { fontFamily: "Vazirmatn" },
    y: { formatter: (v: number) => `${toP(v)} مشترک جدید` },
  },
}));
</script>
