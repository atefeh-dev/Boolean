<template>
  <div class="dash-panel">
    <div class="dash-panel__head">
      <h3 class="dash-panel__title"><IconsUsers /> مشترکین اخیر</h3>
      <NuxtLink to="/admin/subscribers" class="dash-panel__link">مشاهده همه ←</NuxtLink>
    </div>

    <div class="dash-panel__body">
      <ul class="dash-feed">
        <li v-for="s in subscriptions" :key="s.email + s.at" class="dash-feed-item">
          <span class="dash-contrib-avatar">{{ s.email.charAt(0).toUpperCase() }}</span>
          <div class="dash-feed-item__body">
            <p class="dash-feed-item__title">{{ s.email }}</p>
            <p class="dash-feed-item__meta">{{ timeAgo(s.at) }}</p>
          </div>
          <span class="dash-chart-badge" :class="s.hasAccount ? 'dash-chart-badge--up' : ''">
            {{ s.hasAccount ? 'دارای حساب' : 'مهمان' }}
          </span>
        </li>
        <li v-if="!subscriptions.length" class="dash-empty-sm">هنوز کسی مشترک نشده است.</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsUsers from "../icons/Users.vue";

defineProps<{
  subscriptions: { email: string; hasAccount: boolean; at: string }[]
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
