<template>
  <HomeHero />

  <div class="section-head">
    <h2>شماره‌های اخیر</h2>
    <NuxtLink to="/archives">مشاهده آرشیو کامل ‹</NuxtLink>
  </div>

  <IssuesIssueDay
    v-for="issue in issues"
    :key="issue.date"
    :issue="issue"
    :category-map="categoryMap"
  />
</template>

<script setup lang="ts">
import { useHomeLinks } from "../composables/useHomeLinks";

const { issues, categoryMap } = await useHomeLinks();
</script>
