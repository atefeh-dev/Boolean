<template>
  <div class="dash-panel">
    <div class="dash-panel__head">
      <h3 class="dash-panel__title"><IconsList /> آخرین فعالیت‌ها</h3>
    </div>

    <ul class="dash-feed">
      <li v-for="item in activity" :key="item.at + item.title" class="dash-feed-item">
        <span class="dash-feed-item__icon" :class="`type--${item.type}`">
          <IconsCheckCircle v-if="item.type === 'published'" />
          <IconsMail        v-else-if="item.type === 'subscribed'" />
          <IconsClock       v-else />
        </span>
        <div class="dash-feed-item__body">
          <p class="dash-feed-item__title">{{ item.title }}</p>
          <p class="dash-feed-item__meta">{{ item.meta }} · {{ timeAgo(item.at) }}</p>
        </div>
      </li>
      <li v-if="!activity.length" class="dash-empty-sm">هنوز فعالیتی ثبت نشده است.</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import IconsCheckCircle from "../icons/CheckCircle.vue";
import IconsMail        from "../icons/Mail.vue";
import IconsClock       from "../icons/Clock.vue";
import IconsList        from "../icons/List.vue";

defineProps<{
  activity: { type: string; title: string; meta: string; at: string }[]
}>()

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (days > 0) return `${toPersian(days)} روز پیش`;
  if (hours > 0) return `${toPersian(hours)} ساعت پیش`;
  return "همین الان";
}
</script>
