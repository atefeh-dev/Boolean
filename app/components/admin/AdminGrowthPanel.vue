<template>
  <div class="dash-panel">
    <div class="dash-panel__head">
      <h3 class="dash-panel__title"><IconsUsers /> مخاطبان و قیف تأیید</h3>
    </div>

    <!-- Subscriber growth -->
    <div class="dash-growth">
      <div class="dash-growth__num">
        <span class="dash-growth__total">{{ toPersian(total) }}</span>
        <span class="dash-growth__label">مشترک کل</span>
      </div>
      <div class="dash-growth__delta">
        <span class="dash-growth__week" :class="delta > 0 ? 'up' : ''">
          {{ delta >= 0 ? '+' : '' }}{{ toPersian(delta) }}
        </span>
        <span class="dash-growth__week-label">نسبت به هفته قبل</span>
      </div>
    </div>

    <div class="dash-divider" />

    <!-- Approval funnel -->
    <p class="dash-funnel-label">قیف ارسال لینک</p>
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
</template>

<script setup lang="ts">
import IconsUsers from "../icons/Users.vue";

const props = defineProps<{
  total: number
  newThisWeek: number
  newLastWeek: number
  totalSubmitted: number
  approved: number
  rejected: number
  approvalRate: number
}>()

const delta = computed(() => props.newThisWeek - props.newLastWeek);
function pct(n: number) { return `${props.totalSubmitted > 0 ? Math.round((n / props.totalSubmitted) * 100) : 0}%`; }
</script>
