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

    <div class="dash-panel__body">
      <ClientOnly>
        <apexchart
          v-if="hasData"
          type="bar"
          :height="220"
          :options="options"
          :series="series"
        />
        <div v-else class="dash-chart-empty">
          هنوز مشترکی در این بازه ثبت نشده است.
        </div>
        <template #fallback>
          <div class="dash-chart-skeleton" style="height:220px" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsUsers from "../icons/Users.vue";

const props = defineProps<{
  subscriberWeeklyTrend: { label: string; count: number }[]
}>()

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
    i === props.subscriberWeeklyTrend.length - 1 ? "#9c5a3a" : "#e4cdba"
  )
);

const options = computed(() => ({
  chart: {
    toolbar: { show: false },
    fontFamily: "Vazirmatn, Tahoma, Arial, sans-serif",
    animations: { enabled: true, easing: "easeinout", speed: 600 },
    background: "transparent",
  },
  colors: ["#9c5a3a"],
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
    borderColor: "#dcdfd5",
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { right: 8, left: 8 },
  },
  xaxis: {
    categories: props.subscriberWeeklyTrend.map(w => w.label),
    labels: {
      style: { colors: "#868c82", fontFamily: "Vazirmatn", fontSize: "11px" },
    },
    axisBorder: { show: false },
    axisTicks:  { show: false },
  },
  yaxis: {
    min: 0,
    tickAmount: 4,
    labels: {
      style: { colors: "#868c82", fontFamily: "Vazirmatn", fontSize: "11px" },
      formatter: (v: number) => toPersian(Math.round(v)),
    },
  },
  tooltip: {
    theme: "light",
    style: { fontFamily: "Vazirmatn" },
    y: { formatter: (v: number) => `${toPersian(v)} مشترک جدید` },
  },
}));
</script>
