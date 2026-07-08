<template>
  <div class="dash-panel">
    <div class="dash-panel__head">
      <h3 class="dash-panel__title">
        <IconsList />
        روند انتشار هفتگی
      </h3>
      <div class="dash-chart-meta">
        <span class="dash-chart-badge">{{ toPersian(thisWeek) }} این هفته</span>
        <span
          v-if="trend !== 0"
          class="dash-chart-badge"
          :class="trend > 0 ? 'dash-chart-badge--up' : 'dash-chart-badge--dn'"
        >
          {{ trend > 0 ? '↑' : '↓' }} {{ toPersian(Math.abs(trend)) }} نسبت به هفته قبل
        </span>
      </div>
    </div>

    <ClientOnly>
      <apexchart
        v-if="hasData"
        type="area"
        :height="220"
        :options="options"
        :series="series"
      />
      <div v-else class="dash-chart-empty">
        هنوز لینکی منتشر نشده است.
      </div>
      <template #fallback>
        <div class="dash-chart-skeleton" style="height:220px" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import IconsList from "../icons/List.vue";

const props = defineProps<{
  weeklyTrend: { label: string; published: number }[]
}>()

const toP = (n: number) => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]);

const thisWeek = computed(() => props.weeklyTrend.at(-1)?.published ?? 0);
const lastWeek = computed(() => props.weeklyTrend.at(-2)?.published ?? 0);
const trend    = computed(() => thisWeek.value - lastWeek.value);
const hasData  = computed(() => props.weeklyTrend.some(w => w.published > 0));

const series = computed(() => [{
  name: "لینک منتشرشده",
  data: props.weeklyTrend.map(w => w.published),
}]);

const options = computed(() => ({
  chart: {
    toolbar: { show: false },
    fontFamily: "Vazirmatn, Tahoma, Arial, sans-serif",
    animations: { enabled: true, easing: "easeinout", speed: 700 },
    background: "transparent",
    sparkline: { enabled: false },
  },
  colors: ["#24483d"],
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.32,
      opacityTo: 0.02,
      stops: [0, 100],
    },
  },
  stroke: { curve: "smooth", width: 2.5 },
  dataLabels: { enabled: false },
  markers: {
    size: 4,
    colors: ["#24483d"],
    strokeColors: "#ffffff",
    strokeWidth: 2,
    hover: { size: 6 },
  },
  grid: {
    borderColor: "#dcdfd5",
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { right: 8, left: 8 },
  },
  xaxis: {
    categories: props.weeklyTrend.map(w => w.label),
    labels: {
      style: { colors: "#868c82", fontFamily: "Vazirmatn", fontSize: "11px" },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    min: 0,
    tickAmount: 4,
    labels: {
      style: { colors: "#868c82", fontFamily: "Vazirmatn", fontSize: "11px" },
      formatter: (v: number) => toP(Math.round(v)),
    },
  },
  tooltip: {
    theme: "light",
    style: { fontFamily: "Vazirmatn" },
    y: { formatter: (v: number) => `${toP(v)} لینک` },
  },
}));
</script>
