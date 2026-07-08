<template>
  <div class="dash-panel">
    <div class="dash-panel__head">
      <h3 class="dash-panel__title">
        <IconsGrid />
        توزیع دسته‌بندی‌ها
      </h3>
      <span class="dash-panel__sub">{{ toPersian(total) }} لینک منتشرشده</span>
    </div>

    <ClientOnly>
      <apexchart
        v-if="hasData"
        type="donut"
        :height="260"
        :options="options"
        :series="series"
      />
      <div v-else class="dash-chart-empty">
        هنوز لینکی برای نمایش وجود ندارد.
      </div>
      <template #fallback>
        <div class="dash-chart-skeleton" style="height:260px" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import IconsGrid from "../icons/Grid.vue";

const props = defineProps<{
  categories: { id: string; label: string; publishedCount: number }[]
}>()

const toP = (n: number) => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]);

// Top 7 with remainder grouped
const TOP = 7;
const sorted  = computed(() => [...props.categories].sort((a, b) => b.publishedCount - a.publishedCount));
const visible = computed(() => sorted.value.slice(0, TOP).filter(c => c.publishedCount > 0));
const rest    = computed(() => sorted.value.slice(TOP).reduce((s, c) => s + c.publishedCount, 0));

const total   = computed(() => props.categories.reduce((s, c) => s + c.publishedCount, 0));
const hasData = computed(() => total.value > 0);

const series  = computed(() => {
  const s = visible.value.map(c => c.publishedCount);
  if (rest.value > 0) s.push(rest.value);
  return s;
});

const PALETTE = ["#24483d","#b85d3e","#d3a240","#3a7a63","#c47850","#6ba88f","#d4956e","#8aaa97"];

const options = computed(() => {
  const labels = [...visible.value.map(c => c.label), ...(rest.value > 0 ? ["سایر"] : [])];
  return {
    chart: {
      fontFamily: "Vazirmatn, Tahoma, Arial, sans-serif",
      animations: { enabled: true, easing: "easeinout", speed: 700 },
      background: "transparent",
    },
    colors: PALETTE,
    labels,
    legend: {
      position: "bottom",
      fontFamily: "Vazirmatn",
      fontSize: "11px",
      fontWeight: 600,
      markers: { size: 6, offsetX: 4 },
      itemMargin: { horizontal: 6, vertical: 4 },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "62%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "کل",
              fontFamily: "Vazirmatn",
              fontSize: "12px",
              color: "#958878",
              fontWeight: 600,
              formatter: () => toP(total.value),
            },
            value: {
              fontFamily: "Vazirmatn",
              fontWeight: 800,
              fontSize: "20px",
              color: "#211d17",
              formatter: (v: string) => toP(parseInt(v)),
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 2, colors: ["#fffdf8"] },
    tooltip: {
      theme: "light",
      style: { fontFamily: "Vazirmatn" },
      y: { formatter: (v: number) => `${toP(v)} لینک` },
    },
  };
});
</script>
