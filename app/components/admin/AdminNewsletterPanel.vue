<template>
  <div class="dash-panel">
    <div class="dash-panel__head">
      <h3 class="dash-panel__title"><IconsMail /> خبرنامه</h3>
      <NuxtLink to="/admin/newsletter" class="dash-panel__link">مدیریت ←</NuxtLink>
    </div>

    <!-- Ready indicator -->
    <div class="dash-nl-ready" :class="readyClass">
      <span class="dash-nl-ready__num">{{ toPersian(readyCount) }}</span>
      <span class="dash-nl-ready__label">لینک آماده ارسال</span>
    </div>

    <div class="dash-nl-meta">
      <div class="dash-nl-row">
        <span class="dash-nl-row__label">آخرین ارسال</span>
        <span class="dash-nl-row__val">{{ lastSentLabel }}</span>
      </div>
      <div class="dash-nl-row">
        <span class="dash-nl-row__label">دریافت‌کنندگان</span>
        <span class="dash-nl-row__val">{{ lastSentCount ? toPersian(lastSentCount) + ' نفر' : '—' }}</span>
      </div>
      <div class="dash-nl-row">
        <span class="dash-nl-row__label">وضعیت</span>
        <span class="dash-nl-row__val" :class="statusClass">{{ statusLabel }}</span>
      </div>
    </div>

    <NuxtLink v-if="readyCount >= 3" to="/admin/newsletter" class="dash-nl-send-btn">
      <IconsSend /> ارسال خبرنامه بعدی
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import IconsMail from "../icons/Mail.vue";
import IconsSend from "../icons/Send.vue";

const props = defineProps<{
  readyCount: number
  lastSentAt: string | null
  lastSentCount: number | null
  daysSinceSent: number | null
}>()

const lastSentLabel = computed(() => {
  if (!props.lastSentAt) return "هرگز";
  if (props.daysSinceSent === 0) return "امروز";
  if (props.daysSinceSent === 1) return "دیروز";
  return `${toPersian(props.daysSinceSent!)} روز پیش`;
});

const statusClass = computed(() => {
  if (!props.lastSentAt || (props.daysSinceSent ?? 0) > 14) return "status--red";
  if ((props.daysSinceSent ?? 0) > 7) return "status--amber";
  return "status--green";
});

const statusLabel = computed(() => {
  if (!props.lastSentAt) return "هنوز ارسال نشده";
  if ((props.daysSinceSent ?? 0) > 14) return "دیر شده!";
  if ((props.daysSinceSent ?? 0) > 7) return "ارسال توصیه می‌شود";
  return "به‌روز";
});

const readyClass = computed(() =>
  props.readyCount >= 5 ? "ready--high" : props.readyCount >= 2 ? "ready--mid" : "ready--low"
);
</script>
