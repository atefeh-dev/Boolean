<template>
  <div class="archive-issue" :data-cats="issue.categories.join(',')">
    <div class="issue-date">
      <span class="issue-date-weekday">{{ issue.weekday }}</span>
      <span class="issue-date-persian">{{ issue.dateShort }}</span>
    </div>
    <div class="issue-links-preview">
      <a
        v-for="link in issue.previewLinks"
        :key="link.url"
        :href="link.url"
        class="preview-link"
        target="_blank"
        rel="noopener"
      >
        <span class="preview-rank">{{ toPersian(link.rank) }}</span>
        <span>
          {{ link.title }}
          <span class="preview-domain">— {{ link.domain }}</span>
        </span>
      </a>
      <NuxtLink to="/" class="see-all"
        >+ {{ toPersian(issue.remainingCount) }} لینک دیگر ›</NuxtLink
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ArchiveIssue } from "../../types/links";

defineProps<{
  issue: ArchiveIssue;
}>();
</script>
