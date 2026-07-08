<template>
  <div class="dash-panel">
    <div class="dash-panel__head">
      <h3 class="dash-panel__title"><IconsUsers /> برترین مشارکت‌کنندگان</h3>
    </div>

    <div v-if="!contributors.length" class="dash-empty-sm">هنوز لینکی توسط کاربران ارسال نشده است.</div>

    <table v-else class="dash-contrib-table">
      <thead>
        <tr>
          <th>#</th>
          <th>کاربر</th>
          <th>ارسالی</th>
          <th>تأیید</th>
          <th>نرخ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(c, i) in contributors" :key="c.email">
          <td class="dash-contrib-rank">{{ toPersian(i + 1) }}</td>
          <td class="dash-contrib-name">
            <span class="dash-contrib-avatar">{{ c.name.charAt(0) }}</span>
            <div>
              <p>{{ c.name }}</p>
              <p class="dash-contrib-email">{{ c.email }}</p>
            </div>
          </td>
          <td>{{ toPersian(c.submitted) }}</td>
          <td>{{ toPersian(c.approved) }}</td>
          <td>
            <span class="dash-contrib-rate" :class="c.approvalRate >= 70 ? 'high' : c.approvalRate >= 40 ? 'mid' : 'low'">
              {{ toPersian(c.approvalRate) }}٪
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import IconsUsers from "../icons/Users.vue";
defineProps<{
  contributors: { name: string; email: string; submitted: number; approved: number; approvalRate: number }[]
}>()
</script>
