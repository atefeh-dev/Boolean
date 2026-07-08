<template>
  <article class="day">
    <div class="day__meta">
      <span class="day__weekday">{{ issue.weekday }}</span>
      <span class="day__date">{{ issue.date }}</span>
    </div>
    <IssuesLinkRow
      v-for="link in issue.links"
      :key="link.url"
      :link="link"
      :category-map="categoryMap"
    />
  </article>
</template>

<script setup lang="ts">
import type { Issue } from "../../types/links";

defineProps<{
  issue: Issue;
  categoryMap: Record<string, string>;
}>();
</script>
