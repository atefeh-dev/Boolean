<template>
  <div class="admin-layout admin-dashboard">

    <p v-if="error" class="admin-error">{{ error }}</p>

    <template v-if="data">
      <!-- ① Action Required -->
      <AdminActionRequired :items="data.actionItems" />

      <!-- ② KPI row -->
      <AdminKpis
        :published-count="data.counts.publishedCount"
        :pending-count="data.counts.pendingCount"
        :rejected-count="data.counts.rejectedCount"
        :subscriber-count="data.counts.subscriberCount"
        :category-count="data.counts.categoryCount"
        :published-this-week="data.pace.thisWeek"
        :published-last-week="data.pace.lastWeek"
        :new-subs-this-week="data.subscribers.newThisWeek"
        :new-subs-last-week="data.subscribers.newLastWeek"
      />

      <!-- ③ Charts row: members + category donut -->
      <div class="dash-row-charts">
        <AdminMembersPanel :members="data.members" />
        <AdminCategoryChart :categories="data.categories" />
      </div>

      <!-- ④ Operational health: newsletter status + approval funnel -->
      <div class="dash-row-charts dash-row-charts--50-50">
        <AdminNewsletterPanel
          :ready-count="data.newsletter.readyCount"
          :last-sent-at="data.newsletter.lastSentAt"
          :last-sent-count="data.newsletter.lastSentCount"
          :days-since-sent="data.newsletter.daysSinceSent"
        />
        <AdminGrowthPanel
          :total-submitted="data.funnel.total"
          :approved="data.funnel.approved"
          :rejected="data.funnel.rejected"
          :approval-rate="data.funnel.approvalRate"
        />
      </div>

      <!-- ⑤ Charts row 2: subscriber growth + queue -->
      <div class="dash-row-charts dash-row-charts--60-40">
        <AdminSubscriberChart :subscriber-weekly-trend="data.subscriberWeeklyTrend" />
        <AdminQueuePanel
          :count="data.queue.count"
          :oldest-pending="data.oldestPending"
        />
      </div>

      <!-- ⑥ Bottom row: recent signups + contributors -->
      <div class="dash-row-charts dash-row-charts--50-50">
        <AdminSignupsPanel       :subscriptions="data.recentSubscriptions" />
        <AdminContributorsPanel  :contributors="data.topContributors" />
      </div>
    </template>

    <div v-else-if="!error" class="dash-loading">
      <span class="dash-loading__dot" />
      <span class="dash-loading__dot" />
      <span class="dash-loading__dot" />
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: "بولتن — داشبورد", middleware: "admin", layout: "admin" });

interface ActionItem {
  level: "urgent" | "warn" | "info" | "success"
  icon: string; text: string; href: string; cta: string
}

interface Analytics {
  actionItems:             ActionItem[]
  counts:                  { publishedCount: number; pendingCount: number; rejectedCount: number; subscriberCount: number; categoryCount: number; userCount: number }
  pace:                    { thisWeek: number; lastWeek: number }
  queue:                   { count: number; oldestDaysAgo: number | null; oldestTitle: string | null }
  newsletter:              { readyCount: number; lastSentAt: string | null; lastSentCount: number | null; daysSinceSent: number | null }
  subscribers:             { total: number; newThisWeek: number; newLastWeek: number; newToday: number }
  members:                 { total: number; subscribedToday: number; subscribed: number; notSubscribed: number }
  funnel:                  { total: number; approved: number; rejected: number; pending: number; approvalRate: number }
  categories:              { id: string; label: string; publishedCount: number; lastPublishedDaysAgo: number | null }[]
  topContributors:         { name: string; email: string; submitted: number; approved: number; approvalRate: number }[]
  oldestPending:           { id: string; title: string; url: string; daysAgo: number; submittedBy: string | null; categories: { id: string; label: string }[] }[]
  recentSubscriptions:     { email: string; hasAccount: boolean; at: string }[]
  subscriberWeeklyTrend:   { label: string; count: number }[]
}

const data  = ref<Analytics | null>(null);
const error = ref("");

const { data: raw } = await useAsyncData(
  "admin-analytics",
  async () => {
    try { return await $fetch<Analytics>("/api/admin/analytics"); }
    catch { return null; }
  },
  { getCachedData: () => undefined }
);

if (raw.value) data.value = raw.value;
else error.value = "سرور در دسترس نیست. لطفاً صفحه را بارگذاری مجدد کنید.";
</script>
