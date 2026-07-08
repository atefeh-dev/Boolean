<template>
  <div class="dash-panel dash-panel--full">
    <div class="dash-panel__head">
      <h3 class="dash-panel__title"><IconsList /> روند انتشار هفتگی</h3>
      <span class="dash-panel__sub">۸ هفته اخیر</span>
    </div>

    <div class="dash-chart">
      <svg :viewBox="`0 0 ${svgW} ${svgH}`" class="dash-chart__svg" aria-hidden="true">
        <!-- Grid lines -->
        <line v-for="y in gridLines" :key="y"
          :x1="padL" :y1="y" :x2="svgW - padR" :y2="y"
          stroke="var(--line)" stroke-width="1" />

        <!-- Bars -->
        <g v-for="(w, i) in weeks" :key="i">
          <rect
            :x="barX(i)"
            :y="barY(w.published)"
            :width="barW"
            :height="barH(w.published)"
            :fill="i === weeks.length - 1 ? 'var(--forest)' : 'var(--line)'"
            rx="4"
            class="dash-chart__bar"
          />
          <text
            v-if="w.published > 0"
            :x="barX(i) + barW / 2"
            :y="barY(w.published) - 6"
            text-anchor="middle"
            font-size="10"
            fill="var(--ink-soft)"
          >{{ toPersian(w.published) }}</text>
        </g>

        <!-- X labels -->
        <text v-for="(w, i) in weeks" :key="`l${i}`"
          :x="barX(i) + barW / 2"
          :y="svgH - 4"
          text-anchor="middle"
          font-size="9"
          :fill="i === weeks.length - 1 ? 'var(--forest)' : 'var(--ink-faint)'"
          :font-weight="i === weeks.length - 1 ? 700 : 400"
        >{{ w.shortLabel }}</text>
      </svg>
    </div>

    <!-- Summary row -->
    <div class="dash-chart-summary">
      <div class="dash-chart-summary__item">
        <span class="dash-chart-summary__num">{{ toPersian(thisWeekCount) }}</span>
        <span class="dash-chart-summary__label">این هفته</span>
      </div>
      <div class="dash-chart-summary__item">
        <span class="dash-chart-summary__num">{{ toPersian(lastWeekCount) }}</span>
        <span class="dash-chart-summary__label">هفته قبل</span>
      </div>
      <div class="dash-chart-summary__item">
        <span class="dash-chart-summary__num dash-chart-summary__num--trend" :class="trend > 0 ? 'up' : trend < 0 ? 'dn' : ''">
          {{ trend > 0 ? '+' : '' }}{{ toPersian(trend) }}
        </span>
        <span class="dash-chart-summary__label">تغییر</span>
      </div>
      <div class="dash-chart-summary__item">
        <span class="dash-chart-summary__num">{{ toPersian(totalPublished) }}</span>
        <span class="dash-chart-summary__label">مجموع ۸ هفته</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsList from "../icons/List.vue";

const props = defineProps<{
  weeklyTrend: { label: string; published: number }[]
}>()

const svgW = 520; const svgH = 140;
const padL = 8; const padR = 8; const padT = 24; const padB = 22;
const barW = 38; const gap = 8;

const weeks = computed(() => props.weeklyTrend.map(w => ({
  ...w,
  shortLabel: w.label === "این هفته" ? "این هفته" : w.label.replace(" هفته پیش", "w"),
})));

const maxVal = computed(() => Math.max(...props.weeklyTrend.map(w => w.published), 1));
const innerH = svgH - padT - padB;

function barX(i: number) { return padL + i * (barW + gap); }
function barY(v: number) { return padT + innerH - (v / maxVal.value) * innerH; }
function barH(v: number) { return (v / maxVal.value) * innerH; }

const gridLines = computed(() => {
  const max = maxVal.value;
  const step = Math.max(1, Math.ceil(max / 3));
  return Array.from({ length: 3 }, (_, i) => {
    const v = (i + 1) * step;
    return padT + innerH - (v / max) * innerH;
  }).filter(y => y > padT);
});

const thisWeekCount = computed(() => props.weeklyTrend[7]?.published ?? 0);
const lastWeekCount = computed(() => props.weeklyTrend[6]?.published ?? 0);
const trend = computed(() => thisWeekCount.value - lastWeekCount.value);
const totalPublished = computed(() => props.weeklyTrend.reduce((s, w) => s + w.published, 0));
</script>
