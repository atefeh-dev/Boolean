<template>
  <div class="dash-panel">
    <div class="dash-panel__head">
      <h3 class="dash-panel__title"><IconsCheckCircle /> قیف تأیید لینک‌ها</h3>
    </div>

    <div class="dash-panel__body">
      <div v-if="totalSubmitted === 0" class="dash-empty-sm">هنوز لینکی ارسال نشده است.</div>
      <template v-else>
        <div class="dash-funnel-row">
          <span>ارسال‌شده</span>
          <div class="dash-funnel-bar-track">
            <div class="dash-funnel-bar" style="width:100%" />
          </div>
          <span class="dash-funnel-count">{{ toPersian(totalSubmitted) }}</span>
        </div>
        <div class="dash-funnel-row">
          <span>تأیید شده</span>
          <div class="dash-funnel-bar-track">
            <div class="dash-funnel-bar dash-funnel-bar--approved" :style="{ width: pct(approved) }" />
          </div>
          <span class="dash-funnel-count">{{ toPersian(approved) }}</span>
        </div>
        <div class="dash-funnel-row">
          <span>رد شده</span>
          <div class="dash-funnel-bar-track">
            <div class="dash-funnel-bar dash-funnel-bar--rejected" :style="{ width: pct(rejected) }" />
          </div>
          <span class="dash-funnel-count">{{ toPersian(rejected) }}</span>
        </div>
        <p class="dash-funnel-rate">نرخ تأیید <strong>{{ toPersian(approvalRate) }}٪</strong></p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsCheckCircle from "../icons/CheckCircle.vue";

const props = defineProps<{
  totalSubmitted: number
  approved: number
  rejected: number
  approvalRate: number
}>()

function pct(n: number) { return `${props.totalSubmitted > 0 ? Math.round((n / props.totalSubmitted) * 100) : 0}%`; }
</script>
